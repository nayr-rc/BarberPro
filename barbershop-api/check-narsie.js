const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserStats() {
    try {
        const users = await prisma.user.findMany({
            where: { email: { contains: 'narsie454', mode: 'insensitive' } },
            select: { id: true, email: true, createdAt: true, role: true }
        });
        console.log('Narsie users:', users);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkUserStats();
