const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    // Vamos criar/atualizar para ambos os casos para garantir que você entre
    const emails = ['narsie454@gmail.com', 'narsie454@gmaill.com'];
    const hashedPassword = await bcrypt.hash('admin123', 8);

    for (const adminEmail of emails) {
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
