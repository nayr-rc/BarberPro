import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// Listar todas as bebidas ativas (Público/Cliente)
router.get("/", async (req, res) => {
    try {
        const drinks = await prisma.drink.findMany({
            where: { active: true },
        });
        res.json(drinks);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar bebidas" });
    }
});

// Criar nova bebida (Apenas Barbeiro/Admin - simulação sem middleware por enquanto)
router.post("/", async (req, res) => {
    try {
        const { name, price } = req.body;
        if (!name || price === undefined) {
            return res.status(400).json({ message: "Nome e preço são obrigatórios" });
        }
        const drink = await prisma.drink.create({
            data: { name, price: Number(price) },
        });
        res.status(201).json(drink);
    } catch (error) {
        res.status(500).json({ message: "Erro ao criar bebida" });
    }
});

// Atualizar bebida
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, active } = req.body;
        const drink = await prisma.drink.update({
            where: { id },
            data: { name, price: price ? Number(price) : undefined, active },
        });
        res.json(drink);
    } catch (error) {
        res.status(500).json({ message: "Erro ao atualizar bebida" });
    }
});

export default router;
