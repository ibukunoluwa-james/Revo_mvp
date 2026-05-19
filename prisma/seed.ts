import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.agent.createMany({
    data: [
      { name: 'Emeka Obi',    phone: '08012345671', pin: await bcrypt.hash('1234', 10) },
      { name: 'Fatima Yusuf', phone: '08012345672', pin: await bcrypt.hash('1234', 10) },
      { name: 'Chidi Nwosu',  phone: '08012345673', pin: await bcrypt.hash('1234', 10) },
    ],
  });

  await prisma.admin.create({
    data: {
      email:    'admin@revenueguard.ng',
      password: await bcrypt.hash('admin123', 10),
    },
  });

  console.log('Seed complete.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
