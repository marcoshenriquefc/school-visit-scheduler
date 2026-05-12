import 'dotenv/config';

import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import {
  PrismaClient,
  UserRole,
  UserStatus,
} from '@prisma/client';

import { hashPassword } from '../src/utils/password';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@handle.local';

  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log('Admin already exists');
    return;
  }

  const passwordHash = await hashPassword(
    process.env.ADMIN_PASSWORD ?? 'ChangeMe123!'
  );

  await prisma.user.create({
    data: {
      name: process.env.ADMIN_NAME ?? 'Admin User',
      email,
      passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  console.log('Admin user created');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });