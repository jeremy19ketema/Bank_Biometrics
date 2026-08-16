import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const existingSuperAdmin = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' }
  });

  if (!existingSuperAdmin) {
    const passwordHash = await bcrypt.hash("admin123", 10);
    
    await prisma.user.create({
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
  } else {
    console.log("Super Admin already exists:", existingSuperAdmin.username);
  }

  // Seed Default Global Security Policy
  const existingSecurityPolicy = await prisma.globalSecurityPolicy.findFirst({
    where: { name: 'Default Policy' }
  });
  
  if (!existingSecurityPolicy) {
    await prisma.globalSecurityPolicy.create({
      data: {
        name: 'Default Policy',
        mfaRequired: false,
        sessionTimeoutMinutes: 30,
        passwordRegex: '^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$',
        maxFailedAttempts: 5,
        accountLockoutMinutes: 15,
        ipRestrictions: [],
        isActive: true
      }
    });
    console.log("Default GlobalSecurityPolicy created.");
  }

  // Seed Default Biometric Policy
  const existingBiometricPolicy = await prisma.biometricPolicy.findFirst({
    where: { name: 'Default Biometric Policy' }
  });
  
  if (!existingBiometricPolicy) {
    await prisma.biometricPolicy.create({
      data: {
        name: 'Default Biometric Policy',
        requireMultiFinger: false,
        retentionDays: 365,
        strictMatchThreshold: 85.0,
        allowReEnrollment: true,
        isActive: true
      }
    });
    console.log("Default BiometricPolicy created.");
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
