const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function testAuth() {
    const email = 'narsie454@gmail.com';
    const password = 'Barber@2026';

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.log('User not found');
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match test:', isMatch);

        if (!isMatch) {
            console.log('Re-hashing password...');
            const hashedPassword = await bcrypt.hash(password, 8);
            await prisma.user.update({
                where: { email },
                data: { password: hashedPassword }
            });
            console.log('Password re-hashed. Testing again...');
            const updatedUser = await prisma.user.findUnique({ where: { email } });
            const isMatch2 = await bcrypt.compare(password, updatedUser.password);
            console.log('Second match test:', isMatch2);
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

testAuth();
