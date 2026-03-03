const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function fixAdminAccount() {
    const correctEmail = 'narsie454@gmail.com';
    const wrongEmail = 'narsie454@gmaill.com';
    const newPassword = 'Barber@2026';

    try {
        console.log('--- Cleaning Up Accounts ---');

        // 1. Apagar a conta com erro de digitação
        const deletedWrong = await prisma.user.deleteMany({
            where: { email: wrongEmail }
        });
        console.log(`Deleted ${deletedWrong.count} duplicate account(s) (gmaill).`);

        // 2. Resetar a senha da conta principal
        const hashedPassword = await bcrypt.hash(newPassword, 8);
        const updatedUser = await prisma.user.update({
            where: { email: correctEmail },
            data: {
                password: hashedPassword,
                role: 'admin' // Garantindo que é admin
            }
        });

        console.log('✅ Account fixed successfully!');
        console.log(`User: ${updatedUser.email}`);
        console.log(`New Password: ${newPassword}`);
        console.log('--- Done ---');

    } catch (err) {
        console.error('❌ Error during cleanup:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

fixAdminAccount();
