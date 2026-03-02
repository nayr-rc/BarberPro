const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const adminEmail = 'narsie454@gmaill.com';
    const hashedPassword = await bcrypt.hash('admin123', 8);

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            password: hashedPassword,
            role: 'admin',
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
        },
    });

    console.log('✅ Admin user created/updated:', admin.email);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
