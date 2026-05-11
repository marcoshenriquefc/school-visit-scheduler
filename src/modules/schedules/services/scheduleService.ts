import { FormStatus, LeadStatus, RubeusStatus } from '@prisma/client';
import { AppError } from '../../../utils/appError';
import { env } from '../../../config/env';
import { prisma } from '../../../database/prisma';
import { ScheduleRepository } from '../repositories/scheduleRepository';

export class ScheduleService {
  constructor(private readonly scheduleRepository = new ScheduleRepository()) {}

  private async sendToRubeus(leadId: string): Promise<void> {
    try {
      await prisma.integrationLog.create({ data: { leadId, integrationName: 'RUBEUS', status: 'SENT', requestPayload: JSON.stringify({ leadId }), responsePayload: JSON.stringify({ ok: true }) } });
      await prisma.lead.update({ where: { id: leadId }, data: { rubeusStatus: RubeusStatus.SENT } });
    } catch (error) {
      await prisma.integrationLog.create({ data: { leadId, integrationName: 'RUBEUS', status: 'ERROR', errorMessage: error instanceof Error ? error.message : 'Unknown integration error' } });
      await prisma.lead.update({ where: { id: leadId }, data: { rubeusStatus: RubeusStatus.ERROR } });
    }
  }

  async create(input: { formId: string; unitId: string; gradeId: string; availabilitySlotId: string; name: string; email: string; phone: string; lgpdAccepted: boolean; dynamicFields?: Record<string, unknown> }, requester: string) {
    const form = await prisma.form.findUnique({ where: { id: input.formId } });
    if (!form) throw new AppError('Form not found', 404);
    if (form.status !== FormStatus.ACTIVE) throw new AppError('This form is not accepting schedules', 400);
    const now = new Date();
    if (now < form.startDate || now > form.endDate) throw new AppError('Scheduling is outside campaign period', 400);

    const unit = await prisma.unit.findUnique({ where: { id: input.unitId } });
    if (!unit || !unit.isActive) throw new AppError('Unit not available', 400);
    const formUnit = await prisma.formUnit.findFirst({ where: { formId: form.id, unitId: unit.id } });
    if (!formUnit) throw new AppError('Unit not linked to form', 400);

    const grade = await prisma.grade.findUnique({ where: { id: input.gradeId } });
    if (!grade || !grade.isActive) throw new AppError('Grade not available', 400);
    const formGrade = await prisma.formGrade.findFirst({ where: { formId: form.id, gradeId: grade.id } });
    if (!formGrade) throw new AppError('Grade not linked to form', 400);

    const slot = await prisma.availabilitySlot.findUnique({ where: { id: input.availabilitySlotId } });
    if (!slot) throw new AppError('Slot not found', 404);
    if (slot.formId !== form.id || slot.unitId !== unit.id) throw new AppError('Slot does not belong to selected form/unit', 400);
    if (slot.isBlocked) throw new AppError('Selected slot is blocked', 400);
    if (slot.date < new Date()) throw new AppError('Past slot is not allowed', 400);

    try {
      const lead = await this.scheduleRepository.createScheduledLead({ ...input, lgpdAcceptedBy: requester, dynamicFields: input.dynamicFields });
      await this.sendToRubeus(lead.id);
      return { leadId: lead.id, status: lead.status, finalMessage: form.finalMessage, scheduledDate: slot.date, scheduledTime: `${slot.startTime}-${slot.endTime}` };
    } catch (error) {
      if (error instanceof Error && error.message === 'SLOT_FULL') throw new AppError('Selected time is no longer available', 409);
      if (error instanceof Error && error.message === 'SLOT_NOT_FOUND') throw new AppError('Slot not found', 404);
      throw new AppError('Could not create schedule', 500, env.nodeEnv === 'development' ? error : undefined);
    }
  }

  async cancel(leadId: string, cancelToken: string) {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new AppError('Lead not found', 404);
    if (lead.publicCancelToken !== cancelToken) throw new AppError('Invalid cancel token', 401);
    if (lead.status === LeadStatus.CANCELED) throw new AppError('Schedule already canceled', 400);
    if (lead.status === LeadStatus.ATTENDED) throw new AppError('Attended schedules cannot be canceled', 400);
    const updated = await this.scheduleRepository.cancelLead(leadId);
    await prisma.integrationLog.create({ data: { leadId, integrationName: 'INTERNAL_SCHEDULE', status: 'CANCELED', requestPayload: JSON.stringify({ leadId }), responsePayload: JSON.stringify({ status: 'CANCELED' }) } });
    return { leadId: updated.id, status: updated.status };
  }

  async reschedule(leadId: string, cancelToken: string, newAvailabilitySlotId: string) {
    return prisma.$transaction(async (tx) => {
      const lead = await tx.lead.findUnique({ where: { id: leadId }, include: { availabilitySlot: true } });
      if (!lead) throw new AppError('Lead not found', 404);
      if (lead.publicCancelToken !== cancelToken) throw new AppError('Invalid cancel token', 401);
      if (lead.status === LeadStatus.CANCELED || lead.status === LeadStatus.ATTENDED) throw new AppError('This schedule cannot be rescheduled', 400);

      const newSlot = await tx.availabilitySlot.findUnique({ where: { id: newAvailabilitySlotId } });
      if (!newSlot) throw new AppError('New slot not found', 404);
      if (newSlot.formId !== lead.formId) throw new AppError('New slot must belong to same form', 400);
      if (newSlot.unitId !== lead.unitId) throw new AppError('Unit change is not allowed in this version', 400);
      if (newSlot.isBlocked || newSlot.date < new Date()) throw new AppError('New slot is not available', 400);

      const occupied = await tx.lead.count({ where: { availabilitySlotId: newAvailabilitySlotId, status: { not: LeadStatus.CANCELED }, id: { not: leadId } } });
      if (occupied >= newSlot.capacity) throw new AppError('Selected new slot is full', 409);

      const updated = await tx.lead.update({ where: { id: leadId }, data: { availabilitySlotId: newAvailabilitySlotId, status: LeadStatus.RESCHEDULED } });
      await tx.integrationLog.create({ data: { leadId, integrationName: 'INTERNAL_SCHEDULE', status: 'RESCHEDULED', requestPayload: JSON.stringify({ oldSlotId: lead.availabilitySlotId, newSlotId: newAvailabilitySlotId }), responsePayload: JSON.stringify({ status: 'RESCHEDULED' }) } });
      return { leadId: updated.id, status: updated.status, scheduledDate: newSlot.date, scheduledTime: `${newSlot.startTime}-${newSlot.endTime}` };
    });
  }
}
