import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await hash('admin123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@z.ai' },
    update: {},
    create: {
      email: 'admin@z.ai',
      name: 'Admin User',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      credits: 1000,
      isActive: true,
    },
  });

  console.log('Admin user created:', adminUser);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
