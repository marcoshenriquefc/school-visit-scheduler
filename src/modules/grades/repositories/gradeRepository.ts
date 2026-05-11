import { Grade, Prisma } from '@prisma/client';
import { prisma } from '../../../database/prisma';

export class GradeRepository {
  create(data: Prisma.GradeCreateInput): Promise<Grade> { return prisma.grade.create({ data }); }
  findById(id: string): Promise<Grade | null> { return prisma.grade.findUnique({ where: { id } }); }
  findByIdentifier(identifier: string): Promise<Grade | null> { return prisma.grade.findUnique({ where: { identifier } }); }
  findMany(where: Prisma.GradeWhereInput): Promise<Grade[]> { return prisma.grade.findMany({ where, orderBy: { createdAt: 'desc' } }); }
  update(id: string, data: Prisma.GradeUpdateInput): Promise<Grade> { return prisma.grade.update({ where: { id }, data }); }
}
