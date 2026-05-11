import { Prisma, Unit } from '@prisma/client';
import { prisma } from '../../../database/prisma';

export class UnitRepository {
  create(data: Prisma.UnitCreateInput): Promise<Unit> { return prisma.unit.create({ data }); }
  findById(id: string): Promise<Unit | null> { return prisma.unit.findUnique({ where: { id } }); }
  findByIdentifier(identifier: string): Promise<Unit | null> { return prisma.unit.findUnique({ where: { identifier } }); }
  findMany(where: Prisma.UnitWhereInput): Promise<Unit[]> { return prisma.unit.findMany({ where, orderBy: { createdAt: 'desc' } }); }
  update(id: string, data: Prisma.UnitUpdateInput): Promise<Unit> { return prisma.unit.update({ where: { id }, data }); }
}
