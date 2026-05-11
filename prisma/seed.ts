import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@handle.local';
  const existingAdmin = await prisma.user.findUnique({ where: { email } });
  if (existingAdmin) return;

  const passwordHash = await hashPassword(process.env.ADMIN_PASSWORD ?? 'ChangeMe123!');
  await prisma.user.create({
    data: {
      name: process.env.ADMIN_NAME ?? 'Admin User',
      email,
      passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });
}

main().finally(async () => prisma.$disconnect());
