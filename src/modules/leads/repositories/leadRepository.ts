import { LeadStatus, Prisma } from '@prisma/client';
import { prisma } from '../../../database/prisma';

export class LeadRepository {
  findById(id: string) {
    return prisma.lead.findUnique({ where: { id }, include: { form: true, unit: true, grade: true, availabilitySlot: true } });
  }

  findMany(where: Prisma.LeadWhereInput, skip: number, take: number) {
    return prisma.lead.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { form: true, unit: true, grade: true, availabilitySlot: true },
    });
  }

  count(where: Prisma.LeadWhereInput) { return prisma.lead.count({ where }); }
  updateStatus(id: string, status: LeadStatus) { return prisma.lead.update({ where: { id }, data: { status } }); }
}
