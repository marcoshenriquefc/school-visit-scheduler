import { FormFieldType } from '@prisma/client';
import { AppError } from '../../../utils/appError';
import { FormRepository } from '../../forms/repositories/formRepository';
import { FormFieldRepository } from '../repositories/formFieldRepository';

export class FormFieldService {
  constructor(private readonly formRepository = new FormRepository(), private readonly formFieldRepository = new FormFieldRepository()) { }

  private async ensureForm(formId: string) { const form = await this.formRepository.findById(formId); if (!form) throw new AppError('Form not found', 404); return form; }

  async create(formId: string, input: { label: string; name: string; type: FormFieldType; placeholder?: string; isRequired?: boolean; options?: unknown; order?: number; isActive?: boolean }) {
    await this.ensureForm(formId);
    const existing = await this.formFieldRepository.findByName(formId, input.name);
    if (existing) throw new AppError('Field name must be unique per form', 409);
    return this.formFieldRepository.create({ ...input, form: { connect: { id: formId } }, isRequired: input.isRequired ?? false, isActive: input.isActive ?? true, order: input.order ?? 0 });
  }

  list(formId: string) { return this.formFieldRepository.findMany(formId); }

  async getById(formId: string, fieldId: string) { await this.ensureForm(formId); const field = await this.formFieldRepository.findById(fieldId); if (!field || field.formId !== formId) throw new AppError('Form field not found', 404); return field; }

  async update(formId: string, fieldId: string, input: { label?: string; name?: string; type?: FormFieldType; placeholder?: string; isRequired?: boolean; options?: unknown; order?: number; isActive?: boolean }) {
    await this.getById(formId, fieldId);
    if (input.name) { const existing = await this.formFieldRepository.findByName(formId, input.name); if (existing && existing.id !== fieldId) throw new AppError('Field name must be unique per form', 409); }
    return this.formFieldRepository.update(fieldId, input);
  }

  async activate(formId: string, fieldId: string) { await this.getById(formId, fieldId); return this.formFieldRepository.update(fieldId, { isActive: true }); }
  async deactivate(formId: string, fieldId: string) { await this.getById(formId, fieldId); return this.formFieldRepository.update(fieldId, { isActive: false }); }
  async reorder(formId: string, fieldOrders: { id: string; order: number }[]) { await this.ensureForm(formId); await this.formFieldRepository.reorder(formId, fieldOrders); return this.list(formId); }
}
