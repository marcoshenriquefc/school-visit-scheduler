import { FormStatus, Prisma } from '@prisma/client';
import { AppError } from '../../../utils/appError';
import { prisma } from '../../../database/prisma';
import { AvailabilityRepository } from '../repositories/availabilityRepository';

const MACEIO_OFFSET = '-03:00';
const makeDate = (dateString: string): Date => new Date(`${dateString}T00:00:00${MACEIO_OFFSET}`);

export class AvailabilityService {
  constructor(private readonly availabilityRepository = new AvailabilityRepository()) {}

  private async ensureForm(formId: string) { const form = await prisma.form.findUnique({ where: { id: formId } }); if (!form) throw new AppError('Form not found', 404); return form; }

  async createManual(formId: string, input: { unitId: string; date: string; startTime: string; endTime: string; capacity?: number; isBlocked?: boolean; blockReason?: string }) {
    const form = await this.ensureForm(formId);
    const slotDate = makeDate(input.date);
    if (slotDate < makeDate(new Date().toISOString().slice(0,10))) throw new AppError('Past dates are not allowed', 400);
    if (slotDate > form.endDate) throw new AppError('Availability cannot exceed campaign end date', 400);
    const unit = await prisma.unit.findUnique({ where: { id: input.unitId } });
    if (!unit) throw new AppError('Unit not found', 404);
    return this.availabilityRepository.create({ form: { connect: { id: formId } }, unit: { connect: { id: input.unitId } }, date: slotDate, startTime: input.startTime, endTime: input.endTime, capacity: input.capacity ?? unit.defaultCapacityPerHour, isBlocked: input.isBlocked ?? false, blockReason: input.blockReason });
  }

  async generate(formId: string, input: { unitId: string; startHour: string; endHour: string; slotDurationMinutes: number; weekdays: number[]; holidayDates?: string[] }) {
    const form = await this.ensureForm(formId);
    const unit = await prisma.unit.findUnique({ where: { id: input.unitId } });
    if (!unit) throw new AppError('Unit not found', 404);
    const holidaySet = new Set((input.holidayDates ?? []).map((d) => makeDate(d).toISOString().slice(0,10)));
    const records: Prisma.AvailabilitySlotCreateManyInput[] = [];
    for (let day = new Date(form.startDate); day <= form.endDate; day.setUTCDate(day.getUTCDate() + 1)) {
      const weekday = day.getUTCDay();
      const isoDate = day.toISOString().slice(0,10);
      if (makeDate(isoDate) < makeDate(new Date().toISOString().slice(0,10))) continue;
      if (!input.weekdays.includes(weekday)) continue;
      if (holidaySet.has(isoDate)) continue;
      const [startHour, startMinute] = input.startHour.split(':').map(Number);
      const [endHour, endMinute] = input.endHour.split(':').map(Number);
      let minutesCursor = startHour * 60 + startMinute;
      const dayEnd = endHour * 60 + endMinute;
      while (minutesCursor + input.slotDurationMinutes <= dayEnd) {
        const slotStart = `${String(Math.floor(minutesCursor / 60)).padStart(2, '0')}:${String(minutesCursor % 60).padStart(2, '0')}`;
        const slotEndMinutes = minutesCursor + input.slotDurationMinutes;
        const slotEnd = `${String(Math.floor(slotEndMinutes / 60)).padStart(2, '0')}:${String(slotEndMinutes % 60).padStart(2, '0')}`;
        records.push({ formId, unitId: input.unitId, date: makeDate(isoDate), startTime: slotStart, endTime: slotEnd, capacity: unit.defaultCapacityPerHour, isBlocked: false });
        minutesCursor = slotEndMinutes;
      }
    }
    if (records.length === 0) return { created: 0 };
    const result = await this.availabilityRepository.createMany(records);
    return { created: result.count };
  }

  list(formId: string, filters: { unitId?: string; date?: string; isBlocked?: string }) {
    return this.availabilityRepository.findMany({ formId, unitId: filters.unitId, date: filters.date ? makeDate(filters.date) : undefined, isBlocked: filters.isBlocked ? filters.isBlocked === 'true' : undefined });
  }

  async block(slotId: string, blockReason: string) { return this.availabilityRepository.update(slotId, { isBlocked: true, blockReason }); }
  async unblock(slotId: string) { return this.availabilityRepository.update(slotId, { isBlocked: false, blockReason: null }); }
  async update(slotId: string, input: { unitId?: string; date?: string; startTime?: string; endTime?: string; capacity?: number; isBlocked?: boolean; blockReason?: string }) {
    const slot = await this.availabilityRepository.findById(slotId); if (!slot) throw new AppError('Slot not found',404);
    return this.availabilityRepository.update(slotId, { ...input, date: input.date ? makeDate(input.date) : undefined });
  }
  delete(slotId: string) { return this.availabilityRepository.delete(slotId); }

  async publicDates(slug: string, unitId: string) {
    const form = await prisma.form.findUnique({ where: { slug } });
    if (!form || form.status === FormStatus.DRAFT) throw new AppError('Form not available', 404);
    if (form.status !== FormStatus.ACTIVE) return { status: form.status, dates: [] };
    const slots = await this.availabilityRepository.findMany({ formId: form.id, unitId, isBlocked: false, date: { lte: form.endDate } });
    return { status: form.status, dates: [...new Set(slots.map((slot) => slot.date.toISOString().slice(0,10)))] };
  }

  async publicTimes(slug: string, unitId: string, date: string, includeFull?: string) {
    const form = await prisma.form.findUnique({ where: { slug } });
    if (!form || form.status === FormStatus.DRAFT) throw new AppError('Form not available', 404);
    if (form.status !== FormStatus.ACTIVE) return { status: form.status, message: `Form is ${form.status}`, times: [] };
    const slots = await this.availabilityRepository.findMany({ formId: form.id, unitId, date: makeDate(date), isBlocked: false });
    const slotIds = slots.map((slot) => slot.id);
    const leadCounts = await prisma.lead.groupBy({ by: ['availabilitySlotId'], where: { availabilitySlotId: { in: slotIds } }, _count: { _all: true } });
    const countMap = new Map(leadCounts.map((item) => [item.availabilitySlotId ?? '', item._count._all]));
    const times = slots.map((slot) => {
      const booked = countMap.get(slot.id) ?? 0;
      const isFull = booked >= slot.capacity;
      return { slotId: slot.id, startTime: slot.startTime, endTime: slot.endTime, capacity: slot.capacity, booked, status: isFull ? 'FULL' : 'AVAILABLE' };
    }).filter((slot) => includeFull === 'true' ? true : slot.status !== 'FULL');
    return { status: form.status, times };
  }
}
