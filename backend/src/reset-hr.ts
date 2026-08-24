import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function reset() {
  const hash = await bcrypt.hash('hrpass123', 10);
  await prisma.user.update({ 
    where: { username: 'hr_admin' }, 
    data: { passwordHash: hash } 
  });
  console.log('Reset complete');
}

reset().finally(() => prisma.$disconnect());
