import { UserStatus } from '@prisma/client';
import { AppError } from '../../../utils/appError';
import { hashPassword } from '../../../utils/password';
import { UserRepository } from '../repositories/userRepository';

const sanitizeUser = <T extends { passwordHash: string }>(user: T) => {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

export class UserService {
  constructor(private readonly userRepository = new UserRepository()) {}

  async create(input: { name: string; email: string; password: string; role: 'ADMIN' | 'MARKETING' | 'OPERATIONAL' | 'COMMERCIAL' }) {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) throw new AppError('Email already in use', 409);

    const passwordHash = await hashPassword(input.password);
    const user = await this.userRepository.create({ ...input, passwordHash, status: UserStatus.ACTIVE });
    return sanitizeUser(user);
  }

  async list() { return (await this.userRepository.findMany()).map(sanitizeUser); }
  async getById(id: string) { const u = await this.userRepository.findById(id); if (!u) throw new AppError('User not found',404); return sanitizeUser(u); }
  async update(id: string, input: { name?: string; email?: string; password?: string; role?: 'ADMIN'|'MARKETING'|'OPERATIONAL'|'COMMERCIAL' }) {
    const found = await this.userRepository.findById(id); if (!found) throw new AppError('User not found',404);
    const passwordHash = input.password ? await hashPassword(input.password) : undefined;
    const user = await this.userRepository.update(id, { ...input, password: undefined, passwordHash });
    return sanitizeUser(user);
  }
  async deactivate(id: string) { await this.getById(id); const user = await this.userRepository.update(id,{ status: UserStatus.INACTIVE }); return sanitizeUser(user); }
}
