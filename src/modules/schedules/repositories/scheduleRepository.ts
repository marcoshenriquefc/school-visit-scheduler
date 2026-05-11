import { LeadStatus, Prisma, RubeusStatus } from '@prisma/client';
import { randomBytes } from 'crypto';
import { prisma } from '../../../database/prisma';

export class ScheduleRepository {
  private generateCancelToken(): string { return randomBytes(32).toString('hex'); }

  async createScheduledLead(data: { formId: string; unitId: string; gradeId: string; availabilitySlotId: string; name: string; email: string; phone: string; lgpdAccepted: boolean; lgpdAcceptedBy: string; dynamicFields?: Prisma.InputJsonValue }) {
    return prisma.$transaction(async (tx) => {
      const slot = await tx.availabilitySlot.findUnique({ where: { id: data.availabilitySlotId } });
      if (!slot) throw new Error('SLOT_NOT_FOUND');
      const activeCount = await tx.lead.count({ where: { availabilitySlotId: data.availabilitySlotId, status: { not: LeadStatus.CANCELED } } });
      if (activeCount >= slot.capacity) throw new Error('SLOT_FULL');
      return tx.lead.create({ data: { ...data, publicCancelToken: this.generateCancelToken(), status: LeadStatus.SCHEDULED, rubeusStatus: RubeusStatus.PENDING } });
    });
  }

  async cancelLead(leadId: string) {
    return prisma.lead.update({ where: { id: leadId }, data: { status: LeadStatus.CANCELED } });
  }

  async rescheduleLead(leadId: string, newAvailabilitySlotId: string) {
    return prisma.lead.update({ where: { id: leadId }, data: { availabilitySlotId: newAvailabilitySlotId, status: LeadStatus.RESCHEDULED } });
  }
}
