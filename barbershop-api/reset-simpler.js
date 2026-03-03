const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function resetSimpler() {
    const email = 'narsie454@gmail.com';
    const password = 'barber123';
    const hashedPassword = await bcrypt.hash(password, 8);

    try {
        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        });
        console.log('✅ Password reset to: barber123');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

resetSimpler();
