import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const existingSuperAdmin = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' }
  });

  if (existingSuperAdmin) {
    console.log("Super Admin already exists:", existingSuperAdmin.username);
    return;
  }

  const passwordHash = await bcrypt.hash("admin123", 10);
  
  const superAdmin = await prisma.user.create({
    data: {
      username: "superadmin_real",
      fullName: "System Super Admin",
      email: "superadmin@bank.com",
      passwordHash,
      role: "SUPER_ADMIN",
      isActive: true,
      status: "ACTIVE",
      isFirstLogin: false
    }
  });

  console.log("Super Admin created successfully!");
  console.log("Username: superadmin_real");
  console.log("Password: admin123");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
