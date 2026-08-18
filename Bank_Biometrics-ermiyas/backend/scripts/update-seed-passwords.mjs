import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const plain = 'password123';
  const hash = await bcrypt.hash(plain, 10);
  const usernames = ['admin', 'manager', 'accountant', 'itadmin'];

  for (const username of usernames) {
    await prisma.user.updateMany({
      where: { username },
      data: { passwordHash: hash }
    });
  }

  console.log('Updated seeded passwords for:', usernames.join(', '));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
