import { FormStatus } from '@prisma/client';
import { AppError } from '../../../utils/appError';
import { prisma } from '../../../database/prisma';

export class PublicFormService {
  async getFormData(slug: string) {
    const form = await prisma.form.findUnique({
      where: { slug },
      include: {
        formUnits: {
          include: {
            unit: {
              select: {
                id: true,
                name: true,
                identifier: true,
                address: true,
                color: true,
                isActive: true,
              },
            },
          },
        },
        formGrades: {
          include: {
            grade: {
              select: { id: true, name: true, identifier: true, isActive: true },
            },
          },
        },
        fields: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            label: true,
            name: true,
            type: true,
            placeholder: true,
            isRequired: true,
            options: true,
            order: true,
            isActive: true,
          },
        },
      },
    });

    if (!form || form.status === FormStatus.DRAFT) throw new AppError('Form not available', 404);
    if (form.status === FormStatus.PAUSED) return { status: FormStatus.PAUSED, message: 'This campaign is temporarily paused.' };
    if (form.status === FormStatus.CLOSED) return { status: FormStatus.CLOSED, message: 'This campaign is closed.' };

    const slots = await prisma.availabilitySlot.findMany({
      where: { formId: form.id },
      select: { id: true, unitId: true, date: true, startTime: true, endTime: true, capacity: true, isBlocked: true, blockReason: true },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    const slotsByUnit = new Map<string, typeof slots>();
    slots.forEach((slot) => {
      const current = slotsByUnit.get(slot.unitId) ?? [];
      current.push(slot);
      slotsByUnit.set(slot.unitId, current);
    });

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
      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
      formUnits: form.formUnits.map((item) => ({
        idUnit: item.unit.id,
        name: item.unit.name,
        identifier: item.unit.identifier,
        address: item.unit.address,
        color: item.unit.color,
        isActive: item.unit.isActive,
        slots: (slotsByUnit.get(item.unit.id) ?? []).map(({ unitId, ...slot }) => slot),
      })),
      formGrades: form.formGrades.map((item) => ({
        gradeId: item.grade.id,
        name: item.grade.name,
        identifier: item.grade.identifier,
        isActive: item.grade.isActive,
      })),
      formFields: form.fields,
    };
  }

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
