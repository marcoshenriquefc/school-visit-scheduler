import { FormField, Prisma } from '@prisma/client';
import { prisma } from '../../../database/prisma';

export class FormFieldRepository {
  create(data: Prisma.FormFieldCreateInput): Promise<FormField> { return prisma.formField.create({ data }); }
  findMany(formId: string): Promise<FormField[]> { return prisma.formField.findMany({ where: { formId }, orderBy: { order: 'asc' } }); }
  findById(id: string): Promise<FormField | null> { return prisma.formField.findUnique({ where: { id } }); }
  findByName(formId: string, name: string): Promise<FormField | null> { return prisma.formField.findFirst({ where: { formId, name } }); }
  update(id: string, data: Prisma.FormFieldUpdateInput): Promise<FormField> { return prisma.formField.update({ where: { id }, data }); }
  async reorder(formId: string, orders: { id: string; order: number }[]): Promise<void> {
    await prisma.$transaction(orders.map((item) => prisma.formField.updateMany({ where: { id: item.id, formId }, data: { order: item.order } })));
  }
}
