import { Form, Prisma } from '@prisma/client';
import { prisma } from '../../../database/prisma';

export class FormRepository {
  create(data: Prisma.FormCreateInput): Promise<Form> { return prisma.form.create({ data }); }
  findById(id: string): Promise<Form | null> { return prisma.form.findUnique({ where: { id }, include: { formUnits: true, formGrades: true } }); }
  findBySlug(slug: string): Promise<Form | null> { return prisma.form.findUnique({ where: { slug } }); }
  findMany(where: Prisma.FormWhereInput): Promise<Form[]> { return prisma.form.findMany({ where, orderBy: { createdAt: 'desc' } }); }
  update(id: string, data: Prisma.FormUpdateInput): Promise<Form> { return prisma.form.update({ where: { id }, data }); }
  async replaceUnits(formId: string, unitIds: string[]): Promise<void> {
    await prisma.formUnit.deleteMany({ where: { formId } });
    await prisma.formUnit.createMany({ data: unitIds.map((unitId) => ({ formId, unitId })) });
  }
  async replaceGrades(formId: string, gradeIds: string[]): Promise<void> {
    await prisma.formGrade.deleteMany({ where: { formId } });
    await prisma.formGrade.createMany({ data: gradeIds.map((gradeId) => ({ formId, gradeId })) });
  }
}
