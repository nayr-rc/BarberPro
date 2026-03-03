const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function approveKaua() {
    const email = 'kaua.sacramento@gmail.com';
    try {
        console.log(`Approving user: ${email}`);

        const now = new Date();
        const expiresAt = new Date(now);
        expiresAt.setDate(expiresAt.getDate() + 30);

        const updatedUser = await prisma.user.update({
            where: { email: email },
            data: {
                subscriptionStatus: 'active',
                subscriptionActivatedAt: now,
                subscriptionExpiresAt: expiresAt,
                subscriptionPausedAt: null,
                subscriptionCancelledAt: null,
            }
        });

        console.log('✅ User approved successfully!');
        console.log('New Status:', updatedUser.subscriptionStatus);
        console.log('Expires At:', updatedUser.subscriptionExpiresAt);
    } catch (err) {
        console.error('❌ Error approving user:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

approveKaua();
