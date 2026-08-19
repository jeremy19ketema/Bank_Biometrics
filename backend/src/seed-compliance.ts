import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production") {
    console.error("Seeding is disabled in production.");
    process.exit(1);
  }
  console.log("Seeding Compliance data...");

  const courses = [
    {
      title: "AML / Counter-Terrorist Financing",
      code: "COMP-AML-01",
      category: "REGULATORY",
      description: "Mandatory anti-money laundering and counter-terrorist financing training for all staff.",
      mandatoryRoles: ["BANK_MANAGER", "ACCOUNTANT", "AUDITOR", "SUPER_ADMIN_FOREX"] as Role[],
      mandatoryDepartments: ["COMPLIANCE", "FOREX", "TELLER", "OPERATIONS"],
      validityMonths: 12,
    },
    {
      title: "Cybersecurity Awareness",
      code: "COMP-SEC-01",
      category: "SECURITY",
      description: "Annual cybersecurity awareness, phishing prevention, and secure password practices.",
      mandatoryRoles: ["SUPER_ADMIN", "SUPER_ADMIN_MANAGER", "SUPER_ADMIN_IT", "SUPER_ADMIN_FOREX", "BANK_MANAGER", "BRANCH_IT", "ACCOUNTANT", "HR", "AUDITOR"] as Role[],
      mandatoryDepartments: [],
      validityMonths: 12,
    },
    {
      title: "Data Privacy",
      code: "COMP-PRIV-01",
      category: "LEGAL",
      description: "Customer data protection, GDPR equivalent, and local privacy laws.",
      mandatoryRoles: ["SUPER_ADMIN", "BANK_MANAGER", "HR", "AUDITOR", "ACCOUNTANT"] as Role[],
      mandatoryDepartments: ["COMPLIANCE", "HR", "IT"],
      validityMonths: 24,
    },
    {
      title: "Biometric Data Handling",
      code: "COMP-BIO-01",
      category: "SECURITY",
      description: "Handling highly sensitive biometric templates and hardware safely.",
      mandatoryRoles: ["SUPER_ADMIN", "SUPER_ADMIN_IT", "BRANCH_IT", "BANK_MANAGER"] as Role[],
      mandatoryDepartments: ["IT"],
      validityMonths: 12,
    },
    {
      title: "Information Security",
      code: "COMP-INFO-01",
      category: "SECURITY",
      description: "Advanced IT information security, networking, and server hardening.",
      mandatoryRoles: ["SUPER_ADMIN_IT", "BRANCH_IT"] as Role[],
      mandatoryDepartments: ["IT"],
      validityMonths: 12,
    },
    {
      title: "Code of Conduct",
      code: "COMP-ETH-01",
      category: "HR",
      description: "Bank Code of Conduct, ethics, and professional workplace behavior.",
      mandatoryRoles: ["SUPER_ADMIN", "SUPER_ADMIN_MANAGER", "SUPER_ADMIN_IT", "SUPER_ADMIN_FOREX", "BANK_MANAGER", "BRANCH_IT", "ACCOUNTANT", "HR", "AUDITOR"] as Role[],
      mandatoryDepartments: [],
      validityMonths: 36,
    }
  ];

  for (const c of courses) {
    await prisma.complianceCourse.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
    console.log(`Seeded Course: ${c.code} - ${c.title}`);
  }

  console.log("Compliance seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
