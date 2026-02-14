"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const auth_1 = require("./utils/auth");
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const port = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health Check
app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});
// Register
app.post("/api/auth/register", async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        if (!name || !email || !phone || !password) {
            return res.status(400).json({ message: "Todos os campos obrigatórios" });
        }
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(409).json({ message: "Email já cadastrado" });
        }
        const hashedPassword = await (0, auth_1.hashPassword)(password);
        const user = await prisma.user.create({
            data: { name, email, phone, password: hashedPassword, role: "client" },
        });
        const token = (0, auth_1.generateToken)({ userId: user.id, email: user.email, role: user.role });
        res.status(201).json({ token, user: { id: user.id, name, email, role: user.role } });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro no servidor" });
    }
});
// Login
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email e senha obrigatórios" });
        }
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: "Email ou senha incorretos" });
        }
        const passwordMatch = await (0, auth_1.comparePassword)(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Email ou senha incorretos" });
        }
        const token = (0, auth_1.generateToken)({ userId: user.id, email: user.email, role: user.role });
        res.json({ token, user: { id: user.id, name: user.name, email, role: user.role } });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro no servidor" });
    }
});
// Logout
app.post("/api/auth/logout", (req, res) => {
    res.json({ message: "Logout realizado" });
});
app.listen(port, () => {
    console.log(`🚀 BarberPro API running on http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map