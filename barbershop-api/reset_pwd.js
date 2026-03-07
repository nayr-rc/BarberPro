const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const emailToReset = 'luiza_rebello@hotmail.com';
    const newPassword = 'Senha123!';

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 8);

    try {
        const user = await prisma.user.update({
            where: { email: emailToReset },
            data: { password: hashedPassword }
        });
        console.log('Senha atualizada com sucesso para:', emailToReset);
        console.log('Sua nova senha é:', newPassword);
    } catch (e) {
        console.log('Erro. Talvez o usuário não exista no banco de dados:', e.message);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
