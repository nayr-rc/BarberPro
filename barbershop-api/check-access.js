const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLastAccess() {
    try {
        const user = await prisma.user.findUnique({
            where: { email: 'narsie454@gmail.com' },
            select: { email: true, lastAccessAt: true, accessCount: true }
        });
        console.log('User stats:', user);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkLastAccess();
