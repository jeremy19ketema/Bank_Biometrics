import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PasskeyCredential" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "publicKey" BYTEA NOT NULL,
          "counter" BIGINT NOT NULL,
          "transports" TEXT[],
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "PasskeyCredential_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1
              FROM pg_constraint
              WHERE conname = 'PasskeyCredential_userId_fkey'
          ) THEN
              ALTER TABLE "PasskeyCredential" ADD CONSTRAINT "PasskeyCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
      END $$;
    `);

    console.log("PasskeyCredential table created successfully.");
  } catch (error) {
    console.error("Error executing raw SQL:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
