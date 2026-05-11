import { Prisma } from '@prisma/client';
import { AppError } from '../../../utils/appError';
import { UnitRepository } from '../repositories/unitRepository';

interface UnitFilters { isActive?: string; name?: string; identifier?: string }

export class UnitService {
  constructor(private readonly unitRepository = new UnitRepository()) {}

  private buildFilters(filters: UnitFilters): Prisma.UnitWhereInput {
    return {
      isActive: filters.isActive ? filters.isActive === 'true' : undefined,
      name: filters.name ? { contains: filters.name, mode: 'insensitive' } : undefined,
      identifier: filters.identifier ? { contains: filters.identifier, mode: 'insensitive' } : undefined,
    };
  }

  async create(input: { name: string; identifier: string; address: string; defaultCapacityPerHour: number; color?: string; isActive?: boolean }) {
    const existing = await this.unitRepository.findByIdentifier(input.identifier);
    if (existing) throw new AppError('Unit identifier already in use', 409);
    return this.unitRepository.create({ ...input, isActive: input.isActive ?? true });
  }

  list(filters: UnitFilters) { return this.unitRepository.findMany(this.buildFilters(filters)); }
  async getById(id: string) { const unit = await this.unitRepository.findById(id); if (!unit) throw new AppError('Unit not found', 404); return unit; }

  async update(id: string, input: { name?: string; identifier?: string; address?: string; defaultCapacityPerHour?: number; color?: string; isActive?: boolean }) {
    await this.getById(id);
    if (input.identifier) {
      const existing = await this.unitRepository.findByIdentifier(input.identifier);
      if (existing && existing.id !== id) throw new AppError('Unit identifier already in use', 409);
    }
    return this.unitRepository.update(id, input);
  }

  activate(id: string) { return this.unitRepository.update(id, { isActive: true }); }
  deactivate(id: string) { return this.unitRepository.update(id, { isActive: false }); }
}
