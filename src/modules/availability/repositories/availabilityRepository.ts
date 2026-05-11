import { AvailabilitySlot, Prisma } from '@prisma/client';
import { prisma } from '../../../database/prisma';

export class AvailabilityRepository {
  create(data: Prisma.AvailabilitySlotCreateInput): Promise<AvailabilitySlot> { return prisma.availabilitySlot.create({ data }); }
  createMany(data: Prisma.AvailabilitySlotCreateManyInput[]): Promise<Prisma.BatchPayload> { return prisma.availabilitySlot.createMany({ data }); }
  findById(id: string): Promise<AvailabilitySlot | null> { return prisma.availabilitySlot.findUnique({ where: { id } }); }
  findMany(where: Prisma.AvailabilitySlotWhereInput): Promise<AvailabilitySlot[]> { return prisma.availabilitySlot.findMany({ where, orderBy: [{ date: 'asc' }, { startTime: 'asc' }] }); }
  update(id: string, data: Prisma.AvailabilitySlotUpdateInput): Promise<AvailabilitySlot> { return prisma.availabilitySlot.update({ where: { id }, data }); }
  delete(id: string): Promise<AvailabilitySlot> { return prisma.availabilitySlot.delete({ where: { id } }); }
}
