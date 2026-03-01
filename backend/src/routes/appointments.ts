import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// Criar agendamento com pagamento pendente
router.post("/", async (req, res) => {
    try {
        const { guestName, guestPhone, barberId, serviceId, datetimeStart, datetimeEnd, drinkIds } = req.body;

        // Calcular data de expiração (10 minutos a partir de agora)
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);

        const appointment = await prisma.appointment.create({
            data: {
                guestName,
                guestPhone,
                barberId,
                serviceId,
                datetimeStart: new Date(datetimeStart),
                datetimeEnd: new Date(datetimeEnd),
                paymentStatus: "pending",
                paymentExpiresAt: expiresAt,
                appointmentDrinks: drinkIds && drinkIds.length > 0 ? {
                    create: drinkIds.map((drinkId: string) => ({ drinkId, quantity: 1 }))
                } : undefined
            },
        });

        res.status(201).json(appointment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao criar agendamento" });
    }
});

// Endpoint para processar/confirmar o pagamento
router.post("/:id/pay", async (req, res) => {
    try {
        const { id } = req.params;

        const appointment = await prisma.appointment.findUnique({ where: { id } });

        if (!appointment) return res.status(404).json({ message: "Agendamento não encontrado" });

        if (appointment.paymentExpiresAt && new Date() > appointment.paymentExpiresAt) {
            // Atualizar para expirado
            await prisma.appointment.update({ where: { id }, data: { paymentStatus: "expired", status: "cancelled" } });
            return res.status(400).json({ message: "Tempo de pagamento expirado" });
        }

        if (appointment.paymentStatus === "paid") {
            return res.status(400).json({ message: "Pagamento já foi realizado" });
        }

        // Simula sucesso de pagamento
        const updated = await prisma.appointment.update({
            where: { id },
            data: { paymentStatus: "paid", status: "confirmed" },
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: "Erro ao processar pagamento" });
    }
});

export default router;
