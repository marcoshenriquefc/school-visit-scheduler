import { LeadStatus, Prisma } from '@prisma/client';
import { prisma } from '../../../database/prisma';

interface DashboardFilters { formId?: string; unitId?: string; gradeId?: string; startDate?: string; endDate?: string }

export class DashboardService {
  private buildWhere(filters: DashboardFilters): Prisma.LeadWhereInput {
    return {
      formId: filters.formId,
      unitId: filters.unitId,
      gradeId: filters.gradeId,
      createdAt: filters.startDate || filters.endDate ? { gte: filters.startDate ? new Date(filters.startDate) : undefined, lte: filters.endDate ? new Date(filters.endDate) : undefined } : undefined,
    };
  }

  async getDashboard(filters: DashboardFilters) {
    const where = this.buildWhere(filters);
    const validWhere = { ...where, status: { not: LeadStatus.CANCELED } };

    const [
      totalLeads,
      totalScheduled,
      totalAttended,
      totalNoShow,
      totalCanceled,
      leadsByUnit,
      leadsByGrade,
      schedulesByDate,
      schedulesByHour,
      occupancyRaw,
      rubeusStatusSummary,
      mostRequestedHours,
    ] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.count({ where: { ...where, status: LeadStatus.SCHEDULED } }),
      prisma.lead.count({ where: { ...where, status: LeadStatus.ATTENDED } }),
      prisma.lead.count({ where: { ...where, status: LeadStatus.NO_SHOW } }),
      prisma.lead.count({ where: { ...where, status: LeadStatus.CANCELED } }),
      prisma.lead.groupBy({ by: ['unitId'], where: validWhere, _count: { _all: true } }),
      prisma.lead.groupBy({ by: ['gradeId'], where: validWhere, _count: { _all: true } }),
      prisma.lead.groupBy({ by: ['availabilitySlotId'], where: validWhere, _count: { _all: true } }),
      prisma.lead.groupBy({ by: ['availabilitySlotId'], where: validWhere, _count: { _all: true } }),
      prisma.availabilitySlot.findMany({ where: { formId: filters.formId, unitId: filters.unitId }, select: { id: true, capacity: true, date: true, startTime: true } }),
      prisma.lead.groupBy({ by: ['rubeusStatus'], where, _count: { _all: true } }),
      prisma.lead.groupBy({ by: ['availabilitySlotId'], where: validWhere, _count: { _all: true }, orderBy: { _count: { availabilitySlotId: 'desc' } }, take: 5 }),
    ]);

    const slotIds = schedulesByDate.map((item) => item.availabilitySlotId).filter(Boolean) as string[];
    const slotMap = new Map((await prisma.availabilitySlot.findMany({ where: { id: { in: slotIds } }, select: { id: true, date: true, startTime: true } })).map((slot) => [slot.id, slot]));

    return {
      totalLeads,
      totalScheduled,
      totalAttended,
      totalNoShow,
      totalCanceled,
      leadsByUnit,
      leadsByGrade,
      schedulesByDate: schedulesByDate.map((item) => ({ date: slotMap.get(item.availabilitySlotId ?? '')?.date ?? null, total: item._count._all })),
      schedulesByHour: schedulesByHour.map((item) => ({ hour: slotMap.get(item.availabilitySlotId ?? '')?.startTime ?? null, total: item._count._all })),
      occupancyRateBySlot: occupancyRaw.map((slot) => {
        const occupied = schedulesByDate.find((s) => s.availabilitySlotId === slot.id)?._count._all ?? 0;
        return { slotId: slot.id, date: slot.date, hour: slot.startTime, capacity: slot.capacity, occupied, occupancyRate: slot.capacity > 0 ? Number(((occupied / slot.capacity) * 100).toFixed(2)) : 0 };
      }),
      rubeusStatusSummary,
      mostRequestedHours: mostRequestedHours.map((item) => ({ hour: slotMap.get(item.availabilitySlotId ?? '')?.startTime ?? null, total: item._count._all })),
    };
  }
}
