import { ApiKey, ApiKeyStatus } from '@prisma/client';
import { prisma } from '../../../database/prisma';

export class ApiKeyRepository {
  create(name: string, keyHash: string): Promise<ApiKey> { return prisma.apiKey.create({ data: { name, keyHash, status: ApiKeyStatus.ACTIVE } }); }
  findMany(): Promise<ApiKey[]> { return prisma.apiKey.findMany({ orderBy: { createdAt: 'desc' } }); }
  findById(id: string): Promise<ApiKey | null> { return prisma.apiKey.findUnique({ where: { id } }); }
  findByHash(keyHash: string): Promise<ApiKey | null> { return prisma.apiKey.findFirst({ where: { keyHash } }); }
  updateStatus(id: string, status: ApiKeyStatus): Promise<ApiKey> { return prisma.apiKey.update({ where: { id }, data: { status } }); }
  touch(id: string): Promise<ApiKey> { return prisma.apiKey.update({ where: { id }, data: { lastUsedAt: new Date() } }); }
}
