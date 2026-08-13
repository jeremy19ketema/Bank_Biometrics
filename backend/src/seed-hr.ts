import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const existingHR = await prisma.user.findFirst({
    where: { role: 'HR' }
  });

  if (existingHR) {
    console.log("HR user already exists:", existingHR.username);
    return;
  }

  const passwordHash = await bcrypt.hash("hrpass123", 10);
  
  const hrUser = await prisma.user.create({
    data: {
      username: "hr_admin",
      fullName: "HR Administrator",
      email: "hr@bank.com",
      passwordHash,
      role: "HR",
      isActive: true,
      status: "ACTIVE",
      isFirstLogin: false
    }
  });

  console.log("HR User created successfully!");
  console.log("Username: hr_admin");
  console.log("Password: hrpass123");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
