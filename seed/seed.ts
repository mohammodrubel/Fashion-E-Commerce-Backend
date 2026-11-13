import bcrypt from 'bcrypt';
import prisma from '../src/app/utils/prisma';
import { Role } from '@prisma/client';

const ADMIN_NAME = process.env.SEED_ADMIN_NAME || 'Admin';
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@fashion.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'Admin@123456';

const seedAdmin = async () => {
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, saltRounds);

  // update is empty on purpose: re-running the seed never overwrites an
  // existing admin's password.
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
    },
  });
  console.log(`Admin ready: ${ADMIN_EMAIL}`);
};

const main = async () => {
  try {
    await seedAdmin();
    console.log('Seed completed');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
};

main();
