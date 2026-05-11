import { ApiKeyStatus } from '@prisma/client';
import crypto from 'crypto';
import { AppError } from '../../../utils/appError';
import { ApiKeyRepository } from '../repositories/apiKeyRepository';

const hashKey = (value: string): string => crypto.createHash('sha256').update(value).digest('hex');

export class ApiKeyService {
  constructor(private readonly apiKeyRepository = new ApiKeyRepository()) {}

  async create(name: string) {
    const plainKey = `hdl_${crypto.randomBytes(24).toString('hex')}`;
    const keyHash = hashKey(plainKey);
    const created = await this.apiKeyRepository.create(name, keyHash);
    return { id: created.id, name: created.name, status: created.status, createdAt: created.createdAt, apiKey: plainKey };
  }

  list() { return this.apiKeyRepository.findMany(); }
  async activate(id: string) { await this.ensureExists(id); return this.apiKeyRepository.updateStatus(id, ApiKeyStatus.ACTIVE); }
  async deactivate(id: string) { await this.ensureExists(id); return this.apiKeyRepository.updateStatus(id, ApiKeyStatus.INACTIVE); }

  async validateAndTouch(plainKey: string) {
    const key = await this.apiKeyRepository.findByHash(hashKey(plainKey));
    if (!key) throw new AppError('Invalid API key', 401);
    if (key.status !== ApiKeyStatus.ACTIVE) throw new AppError('API key is inactive', 403);
    await this.apiKeyRepository.touch(key.id);
    return key;
  }

  private async ensureExists(id: string) { const found = await this.apiKeyRepository.findById(id); if (!found) throw new AppError('API key not found', 404); }
}
