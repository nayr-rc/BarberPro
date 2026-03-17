const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testQuery() {
    try {
        console.log('Testing /subscription/all query...');
        const users = await prisma.user.findMany({
            where: { role: 'barber' },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                contactNumber: true,
                subscriptionStatus: true,
            }
        });
        console.log('Query successful! Users found:', users);
    } catch (err) {
        console.error('❌ Query failed:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

testQuery();
