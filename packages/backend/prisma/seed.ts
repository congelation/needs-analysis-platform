// packages/backend/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@yourdomain.com' },
    update: {},
    create: {
      email: 'admin@yourdomain.com',
    },
  });
  console.log('Default admin user created/found:', adminUser);
}

main().catch(e => console.error(e)).finally(async () => await prisma.$disconnect());