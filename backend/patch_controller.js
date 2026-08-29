import fs from 'fs';

const filePath = 'c:\\Users\\Hp\\Desktop\\Bank Biometrics\\backend\\src\\controllers\\staffController.ts';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add import statement
if (!content.includes('sendWelcomeEmail')) {
    content = content.replace(
        'import { generateSecurePassword } from "../utils/passwordGenerator.js";',
        'import { generateSecurePassword } from "../utils/passwordGenerator.js";\nimport { sendWelcomeEmail } from "../utils/emailService.js";'
    );
}

// 2. Replace existingUser checks
content = content.replace(/where:\s*\{\s*OR:\s*\[\{\s*username\s*\},\s*\{\s*email\s*\}\]\s*\}/g, 'where: { username }');

// 3. Inject email sending logic after prisma.user.create
// The pattern looks for the end of the prisma.user.create call
const createBlockRegex = /(isFirstLogin:\s*true\s*\n\s*\}\s*\}\);)/g;

content = content.replace(createBlockRegex, `$1\n\n    try {\n      await sendWelcomeEmail(email, username, generatedPasscode, req.body.role || req.body.department || 'Staff');\n    } catch (emailError: any) {\n      await prisma.user.delete({ where: { id: user.id } });\n      res.status(500).json({ success: false, message: "Failed to send welcome email. Account creation aborted." });\n      return;\n    }`);

fs.writeFileSync(filePath, content);
console.log("staffController.ts patched successfully.");
