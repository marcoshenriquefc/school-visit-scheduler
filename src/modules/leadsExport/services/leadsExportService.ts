import { LeadStatus, Prisma } from '@prisma/client';
import { prisma } from '../../../database/prisma';

interface ExportFilters { formId?: string; unitId?: string; gradeId?: string; status?: LeadStatus; rubeusStatus?: 'PENDING'|'SENT'|'ERROR'|'RESENT'; startDate?: string; endDate?: string }

export class LeadsExportService {
  private buildWhere(filters: ExportFilters): Prisma.LeadWhereInput {
    return {
      formId: filters.formId,
      unitId: filters.unitId,
      gradeId: filters.gradeId,
      status: filters.status,
      rubeusStatus: filters.rubeusStatus,
      createdAt: filters.startDate || filters.endDate ? { gte: filters.startDate ? new Date(filters.startDate) : undefined, lte: filters.endDate ? new Date(filters.endDate) : undefined } : undefined,
    };
  }

  async getRows(filters: ExportFilters) {
    const leads = await prisma.lead.findMany({ where: this.buildWhere(filters), orderBy: { createdAt: 'desc' }, include: { unit: true, grade: true, availabilitySlot: true } });
    return leads.map((lead) => ({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      unit: lead.unit.name,
      grade: lead.grade.name,
      date: lead.availabilitySlot?.date.toISOString().slice(0,10) ?? '',
      time: lead.availabilitySlot ? `${lead.availabilitySlot.startTime}-${lead.availabilitySlot.endTime}` : '',
      status: lead.status,
      rubeusStatus: lead.rubeusStatus,
      createdAt: lead.createdAt.toISOString(),
    }));
  }

  async toCsv(filters: ExportFilters): Promise<string> {
    const rows = await this.getRows(filters);
    const header = 'Nome,Email,Telefone,Unidade,Série,Data,Horário,Status,Status Rubeus,Data de criação';
    const lines = rows.map((r) => [r.name, r.email, r.phone, r.unit, r.grade, r.date, r.time, r.status, r.rubeusStatus, r.createdAt].map((v) => `"${String(v).replaceAll('"', '""')}"`).join(','));
    return [header, ...lines].join('\n');
  }

  async toPdfLike(filters: ExportFilters): Promise<Buffer> {
    const rows = await this.getRows(filters);
    const lines = [
      'Handle - Leads Export',
      `Filters: formId=${filters.formId ?? '-'} unitId=${filters.unitId ?? '-'} gradeId=${filters.gradeId ?? '-'} status=${filters.status ?? '-'} rubeusStatus=${filters.rubeusStatus ?? '-'} startDate=${filters.startDate ?? '-'} endDate=${filters.endDate ?? '-'}`,
      '',
      'Nome | Email | Telefone | Unidade | Série | Data | Horário | Status | Status Rubeus | Data de criação',
      ...rows.map((r) => `${r.name} | ${r.email} | ${r.phone} | ${r.unit} | ${r.grade} | ${r.date} | ${r.time} | ${r.status} | ${r.rubeusStatus} | ${r.createdAt}`),
    ];
    return Buffer.from(lines.join('\n'));
  }
}
