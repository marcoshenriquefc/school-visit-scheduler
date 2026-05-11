import { Prisma } from '@prisma/client';
import { AppError } from '../../../utils/appError';
import { GradeRepository } from '../repositories/gradeRepository';

interface GradeFilters { isActive?: string; name?: string; identifier?: string }

export class GradeService {
  constructor(private readonly gradeRepository = new GradeRepository()) {}

  private buildFilters(filters: GradeFilters): Prisma.GradeWhereInput {
    return {
      isActive: filters.isActive ? filters.isActive === 'true' : undefined,
      name: filters.name ? { contains: filters.name, mode: 'insensitive' } : undefined,
      identifier: filters.identifier ? { contains: filters.identifier, mode: 'insensitive' } : undefined,
    };
  }

  async create(input: { name: string; identifier: string; isActive?: boolean }) {
    const existing = await this.gradeRepository.findByIdentifier(input.identifier);
    if (existing) throw new AppError('Grade identifier already in use', 409);
    return this.gradeRepository.create({ ...input, isActive: input.isActive ?? true });
  }

  list(filters: GradeFilters) { return this.gradeRepository.findMany(this.buildFilters(filters)); }
  async getById(id: string) { const grade = await this.gradeRepository.findById(id); if (!grade) throw new AppError('Grade not found', 404); return grade; }

  async update(id: string, input: { name?: string; identifier?: string; isActive?: boolean }) {
    await this.getById(id);
    if (input.identifier) {
      const existing = await this.gradeRepository.findByIdentifier(input.identifier);
      if (existing && existing.id !== id) throw new AppError('Grade identifier already in use', 409);
    }
    return this.gradeRepository.update(id, input);
  }

  activate(id: string) { return this.gradeRepository.update(id, { isActive: true }); }
  deactivate(id: string) { return this.gradeRepository.update(id, { isActive: false }); }
}
