import { Prisma, User } from '@prisma/client';
import { prisma } from '../../../database/prisma';

export class UserRepository {
  create(data: Prisma.UserCreateInput): Promise<User> { return prisma.user.create({ data }); }
  findMany(): Promise<User[]> { return prisma.user.findMany({ orderBy: { createdAt: 'desc' } }); }
  findById(id: string): Promise<User | null> { return prisma.user.findUnique({ where: { id } }); }
  findByEmail(email: string): Promise<User | null> { return prisma.user.findUnique({ where: { email } }); }
  update(id: string, data: Prisma.UserUpdateInput): Promise<User> { return prisma.user.update({ where: { id }, data }); }
}
