import { FormStatus, Prisma } from '@prisma/client';
import { AppError } from '../../../utils/appError';
import { prisma } from '../../../database/prisma';
import { FormRepository } from '../repositories/formRepository';

interface FormFilters { status?: 'DRAFT'|'ACTIVE'|'PAUSED'|'CLOSED'; campaignIdentifier?: string; title?: string; slug?: string; startDate?: string; endDate?: string }

export class FormService {
  constructor(private readonly formRepository = new FormRepository()) {}

  private buildFilters(filters: FormFilters): Prisma.FormWhereInput {
    return {
      status: filters.status,
      campaignIdentifier: filters.campaignIdentifier ? { contains: filters.campaignIdentifier, mode: 'insensitive' } : undefined,
      title: filters.title ? { contains: filters.title, mode: 'insensitive' } : undefined,
      slug: filters.slug ? { contains: filters.slug, mode: 'insensitive' } : undefined,
      startDate: filters.startDate ? { gte: new Date(filters.startDate) } : undefined,
      endDate: filters.endDate ? { lte: new Date(filters.endDate) } : undefined,
    };
  }

  async create(input: { campaignIdentifier: string; title: string; slug: string; finalMessage?: string; lgpdText?: string; startDate: Date; endDate: Date; status?: FormStatus }) {
    const existing = await this.formRepository.findBySlug(input.slug);
    if (existing) throw new AppError('Form slug already in use', 409);
    return this.formRepository.create({ ...input, status: input.status ?? FormStatus.DRAFT });
  }
  list(filters: FormFilters) { return this.formRepository.findMany(this.buildFilters(filters)); }
  async getById(id: string) { const form = await this.formRepository.findById(id); if (!form) throw new AppError('Form not found', 404); return form; }

  async update(id: string, input: { campaignIdentifier?: string; title?: string; slug?: string; finalMessage?: string; lgpdText?: string; startDate?: Date; endDate?: Date; status?: FormStatus }) {
    const form = await this.getById(id);
    const startDate = input.startDate ?? form.startDate;
    const endDate = input.endDate ?? form.endDate;
    if (endDate < startDate) throw new AppError('endDate cannot be before startDate', 400);
    if (input.slug) {
      const existing = await this.formRepository.findBySlug(input.slug);
      if (existing && existing.id !== id) throw new AppError('Form slug already in use', 409);
    }
    return this.formRepository.update(id, input);
  }


  async getPublicBySlug(slug: string) {
    const form = await this.formRepository.findBySlug(slug);
    if (!form) throw new AppError('Form not found', 404);
    if (form.status === FormStatus.CLOSED) {
      return { status: FormStatus.CLOSED, message: 'This campaign is closed and no longer accepts new scheduling requests.' };
    }
    return form;
  }

  async activate(id: string) { const form = await this.getById(id); if (form.status === FormStatus.CLOSED) throw new AppError('Closed form cannot be reactivated',400); return this.formRepository.update(id, { status: FormStatus.ACTIVE }); }
  async pause(id: string) { const form = await this.getById(id); if (form.status !== FormStatus.ACTIVE) throw new AppError('Only ACTIVE form can be paused',400); return this.formRepository.update(id,{ status: FormStatus.PAUSED }); }
  async close(id: string) { await this.getById(id); return this.formRepository.update(id, { status: FormStatus.CLOSED }); }

  async linkUnits(id: string, unitIds: string[]) { await this.getById(id); const count = await prisma.unit.count({ where: { id: { in: unitIds } } }); if (count !== unitIds.length) throw new AppError('One or more units not found',400); await this.formRepository.replaceUnits(id, unitIds); return this.getById(id); }
  async linkGrades(id: string, gradeIds: string[]) { await this.getById(id); const count = await prisma.grade.count({ where: { id: { in: gradeIds } } }); if (count !== gradeIds.length) throw new AppError('One or more grades not found',400); await this.formRepository.replaceGrades(id, gradeIds); return this.getById(id); }
}
