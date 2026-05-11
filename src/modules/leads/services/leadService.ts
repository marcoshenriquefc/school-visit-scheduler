import { LeadStatus, Prisma } from '@prisma/client';
import { AppError } from '../../../utils/appError';
import { LeadRepository } from '../repositories/leadRepository';

export class LeadService {
  constructor(private readonly leadRepository = new LeadRepository()) {}

  private buildWhere(filters: { formId?: string; unitId?: string; gradeId?: string; status?: LeadStatus; rubeusStatus?: 'PENDING'|'SENT'|'ERROR'|'RESENT'; startDate?: string; endDate?: string; search?: string }): Prisma.LeadWhereInput {
    return {
      formId: filters.formId,
      unitId: filters.unitId,
      gradeId: filters.gradeId,
      status: filters.status,
      rubeusStatus: filters.rubeusStatus,
      createdAt: filters.startDate || filters.endDate ? { gte: filters.startDate ? new Date(filters.startDate) : undefined, lte: filters.endDate ? new Date(filters.endDate) : undefined } : undefined,
      OR: filters.search ? [{ name: { contains: filters.search, mode: 'insensitive' } }, { email: { contains: filters.search, mode: 'insensitive' } }, { phone: { contains: filters.search, mode: 'insensitive' } }] : undefined,
    };
  }

  async list(filters: { formId?: string; unitId?: string; gradeId?: string; status?: LeadStatus; rubeusStatus?: 'PENDING'|'SENT'|'ERROR'|'RESENT'; startDate?: string; endDate?: string; search?: string; page: number; limit: number }) {
    const where = this.buildWhere(filters);
    const skip = (filters.page - 1) * filters.limit;
    const [items, total] = await Promise.all([this.leadRepository.findMany(where, skip, filters.limit), this.leadRepository.count(where)]);
    return {
      items: items.map((lead) => ({ id: lead.id, name: lead.name, email: lead.email, phone: lead.phone, form: { id: lead.form.id, title: lead.form.title }, unit: { id: lead.unit.id, name: lead.unit.name }, grade: { id: lead.grade.id, name: lead.grade.name }, scheduledDate: lead.availabilitySlot?.date, scheduledTime: lead.availabilitySlot ? `${lead.availabilitySlot.startTime}-${lead.availabilitySlot.endTime}` : null, status: lead.status, rubeusStatus: lead.rubeusStatus, createdAt: lead.createdAt })),
      page: filters.page,
      limit: filters.limit,
      total,
    };
  }

  async getById(id: string) { const lead = await this.leadRepository.findById(id); if (!lead) throw new AppError('Lead not found', 404); return lead; }
  async updateStatus(id: string, status: LeadStatus) { await this.getById(id); return this.leadRepository.updateStatus(id, status); }
}
