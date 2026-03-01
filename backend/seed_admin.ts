import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const adminEmail = "admin@barberpro.com";
    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    });

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash("admin123", 10);
        const admin = await prisma.user.create({
            data: {
                name: "Admin Barbearia",
                email: adminEmail,
                password: hashedPassword,
                phone: "11999999999",
                role: "admin",
            },
        });
        console.log("Admin criado com sucesso!");
        console.log("Email:", adminEmail);
        console.log("Senha:", "admin123");
    } else {
        console.log("O admin já existe!");
        console.log("Email:", adminEmail);
        console.log("Senha:", "admin123 (senha padrão do script)");
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
