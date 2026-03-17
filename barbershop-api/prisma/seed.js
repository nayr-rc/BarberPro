const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const configuredEmails = process.env.SEED_ADMIN_EMAILS
        ? process.env.SEED_ADMIN_EMAILS.split(',').map((email) => email.trim()).filter(Boolean)
        : [process.env.SEED_ADMIN_EMAIL || 'admin@barberpro.com'];
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'admin12345';
    const hashedPassword = await bcrypt.hash(adminPassword, 8);

    for (const adminEmail of configuredEmails) {
        const admin = await prisma.user.upsert({
            where: { email: adminEmail },
            update: {
                password: hashedPassword,
                role: 'admin',
                subscriptionStatus: 'active',
                firstName: 'Ryan',
                lastName: 'Gonçalves',
            },
            create: {
                email: adminEmail,
                password: hashedPassword,
                firstName: 'Ryan',
                lastName: 'Gonçalves',
                contactNumber: '71999034067',
                role: 'admin',
                subscriptionStatus: 'active',
            },
        });
        console.log('✅ Admin user ready:', admin.email);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
