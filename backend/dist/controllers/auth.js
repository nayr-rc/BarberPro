"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.logout = logout;
const client_1 = require("@prisma/client");
const auth_1 = require("../utils/auth");
const prisma = new client_1.PrismaClient();
async function register(req, res) {
    try {
        const { name, email, phone, password } = req.body;
        // Validação
        if (!name || !email || !phone || !password) {
            res.status(400).json({ message: "Todos os campos são obrigatórios" });
            return;
        }
        // Verificar se email já existe
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            res.status(409).json({ message: "Email já cadastrado" });
            return;
        }
        // Hash da senha
        const hashedPassword = await (0, auth_1.hashPassword)(password);
        // Criar usuário
        const user = await prisma.user.create({
            data: {
                name,
                email,
                phone,
                password: hashedPassword,
                role: "client",
            },
        });
        // Gerar token
        const token = (0, auth_1.generateToken)({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        res.status(201).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ message: "Erro ao criar conta" });
    }
}
async function login(req, res) {
    try {
        const { email, password } = req.body;
        // Validação
        if (!email || !password) {
            res.status(400).json({ message: "Email e senha são obrigatórios" });
            return;
        }
        // Encontrar usuário
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            res.status(401).json({ message: "Email ou senha inválidos" });
            return;
        }
        // Verificar senha
        const isPasswordValid = await (0, auth_1.comparePassword)(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: "Email ou senha inválidos" });
            return;
        }
        // Gerar token
        const token = (0, auth_1.generateToken)({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Erro ao fazer login" });
    }
}
async function logout(req, res) {
    // Logout é feito no frontend removendo o token
    res.json({ message: "Logout realizado com sucesso" });
}
//# sourceMappingURL=auth.js.map