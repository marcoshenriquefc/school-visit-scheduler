import { FormStatus } from '@prisma/client';
import { AppError } from '../../../utils/appError';
import { prisma } from '../../../database/prisma';

export class PublicFormService {
  async getForm(slug: string) {
    const form = await prisma.form.findUnique({ where: { slug } });
    if (!form || form.status === FormStatus.DRAFT) throw new AppError('Form not available', 404);
    if (form.status === FormStatus.PAUSED) return { status: FormStatus.PAUSED, message: 'This campaign is temporarily paused.' };
    if (form.status === FormStatus.CLOSED) return { status: FormStatus.CLOSED, message: 'This campaign is closed.' };
    return {
      id: form.id,
      campaignIdentifier: form.campaignIdentifier,
      title: form.title,
      slug: form.slug,
      finalMessage: form.finalMessage,
      lgpdText: form.lgpdText,
      startDate: form.startDate,
      endDate: form.endDate,
      status: form.status,
    };
  }

  async getUnits(slug: string) {
    const form = await prisma.form.findUnique({ where: { slug } });
    if (!form || form.status !== FormStatus.ACTIVE) return [];
    return prisma.unit.findMany({ where: { isActive: true, formUnits: { some: { formId: form.id } } }, select: { id: true, name: true, identifier: true, address: true, color: true } });
  }

  async getGrades(slug: string) {
    const form = await prisma.form.findUnique({ where: { slug } });
    if (!form || form.status !== FormStatus.ACTIVE) return [];
    return prisma.grade.findMany({ where: { isActive: true, formGrades: { some: { formId: form.id } } }, select: { id: true, name: true, identifier: true } });
  }

  async getFields(slug: string) {
    const form = await prisma.form.findUnique({ where: { slug } });
    if (!form || form.status !== FormStatus.ACTIVE) return [];
    return prisma.formField.findMany({ where: { formId: form.id, isActive: true }, orderBy: { order: 'asc' }, select: { id: true, label: true, name: true, type: true, placeholder: true, isRequired: true, options: true, order: true } });
  }
}
