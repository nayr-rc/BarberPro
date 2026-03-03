const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
    try {
        const user = await prisma.user.findFirst({
            where: { email: { contains: 'ryan', mode: 'insensitive' } }
        });
        console.log('User found:', user ? { id: user.id, email: user.email, role: user.role } : 'None');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkUser();
