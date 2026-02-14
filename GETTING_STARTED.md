# BarberPro - Guia Completo de Uso

Bem-vindo ao **BarberPro** - A plataforma inteligente de agendamento para barbearias!

## 🎯 O que foi criado

### ✅ Frontend (Next.js)
- **Landing Page** (`/`): Apresentação da plataforma com CTA
- **Autenticação** (`/auth/login` e `/auth/register`): Login e cadastro com validação
- **Painel do Cliente** (`/client`): Dashboard com opções de agendamento
- **Painel do Admin** (`/admin`): Dashboard de gerenciamento
- **Design System**: Tema personalizado com cores de barbearia (preto, marrom, bege)

### ✅ Backend (Node.js + Express)
- **Servidor Express** com CORS e middleware de autenticação
- **Autenticação JWT** com tokens de 7 dias
- **Criptografia de Senhas** com bcryptjs
- **Banco de Dados Prisma** com schema completo
- **Utilitários de Auth**: Login, registro, token management

### ✅ Banco de Dados (PostgreSQL)
- **Tabelas**: Users, Barbers, Services, Appointments
- **Relações**: Usuários → Agendamentos ← Barbeiros/Serviços
- **Segurança**: Cascade deletes, validações

### ✅ Configuração
- Variáveis de ambiente (.env.local e .env)
- Tailwind CSS com cores customizadas
- TypeScript em ambos os projetos
- ESLint para qualidade de código

---

## 🚀 Como Começar

### 1. **Configurar o Banco de Dados**

```bash
# Windows: Inicie o PostgreSQL
# Services > PostgreSQL > Iniciar

# ou via linha de comando:
# psql -U postgres

# Crie o banco:
CREATE DATABASE barberpro;
```

### 2. **Configurar Variáveis de Ambiente**

**Frontend** (`c:\Users\Rin6\barbearia\.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Backend** (`c:\Users\Rin6\barbearia\backend\.env`):
```env
DATABASE_URL="postgresql://postgres:seu_password@localhost:5432/barberpro"
JWT_SECRET="sua_chave_super_secreta_mude_em_producao"
PORT=3001
NODE_ENV="development"
```

### 3. **Executar Migrações do Prisma**

```bash
cd c:\Users\Rin6\barbearia\backend
npx prisma migrate dev --name init
```

Isso vai:
- Criar as tabelas no banco
- Gerar o Prisma Client
- Criar um arquivo de migração

### 4. **Iniciar os Servidores**

**Terminal 1 - Frontend:**
```bash
cd c:\Users\Rin6\barbearia
npm run dev
# Acessar: http://localhost:3000
```

**Terminal 2 - Backend:**
```bash
cd c:\Users\Rin6\barbearia\backend
npm run dev
# API rodando em: http://localhost:3001
```

---

## 📱 Testando a Plataforma

### Landing Page
- URL: `http://localhost:3000`
- Veja o design com tema de barbearia
- Clique em "Começar como Cliente" ou "Admin"

### Cadastro de Cliente
- URL: `http://localhost:3000/auth/register`
- Preencha: Nome, Email, Telefone, Senha
- Clique em "Cadastrar"
- *Será redirecionado para `/client` (mas sem dados ainda)*

### Login
- URL: `http://localhost:3000/auth/login`
- Use as credenciais cadastradas
- *Funciona após implementar endpoint de login no backend*

---

## 🏗️ Arquitetura do Projeto

### Frontend Structure
```
src/
├── app/
│   ├── page.tsx              ← Landing page
│   ├── globals.css           ← Estilos globais
│   ├── layout.tsx            ← Layout principal
│   ├── auth/
│   │   ├── login/page.tsx    ← Página de login
│   │   └── register/page.tsx ← Página de cadastro
│   ├── client/
│   │   └── page.tsx          ← Dashboard do cliente
│   └── admin/
│       └── page.tsx          ← Dashboard do admin
├── components/
│   ├── client/               ← Componentes do cliente
│   ├── admin/                ← Componentes do admin
│   └── shared/               ← Componentes compartilhados
├── hooks/
│   └── useAuth.ts            ← Store Zustand de autenticação
├── lib/
│   ├── api.ts                ← Cliente Axios com interceptor JWT
│   └── auth.ts               ← Funções de autenticação
└── public/                   ← Assets estáticos
```

### Backend Structure
```
backend/
├── src/
│   ├── index.ts              ← Servidor Express principal
│   ├── controllers/          ← Lógica dos endpoints (vazio por enquanto)
│   ├── middlewares/
│   │   └── auth.ts           ← Middlewares de autenticação
│   ├── routes/               ← Definição das rotas (vazio por enquanto)
│   ├── services/             ← Lógica de negócio (vazio por enquanto)
│   └── utils/
│       └── auth.ts           ← Utilitários: JWT, bcrypt
├── prisma/
│   └── schema.prisma         ← Modelo do banco de dados
└── package.json
```

---

## 🎨 Paleta de Cores

Todas as cores estão em `tailwind.config.ts`:

```tsx
colors: {
  "barber-black": "#1a1a1a",        // Fundo principal
  "barber-dark": "#2d2d2d",         // Fundo secundário
  "barber-brown": "#6b4423",        // Bordas e hover
  "barber-brown-light": "#8b5a3c",  // Hover hover
  "barber-beige": "#e8dcc8",        // Texto principal
  "barber-beige-light": "#f5f1e8",  // Fundo light
  "barber-accent": "#d4a574",       // Destaques e botões
}
```

### Exemplos de Uso:
```tsx
// Fundo escuro
<div className="bg-barber-black">

// Texto principal
<p className="text-barber-beige">

// Botão destacado
<button className="bg-barber-accent text-barber-black hover:bg-barber-brown">

// Card com borda
<div className="bg-barber-dark border-2 border-barber-brown rounded-lg">

// Texto de destaque
<span className="text-barber-accent font-bold">
```

---

## 🔐 Segurança Implementada

✅ **JWT Tokens**
- Gerados com `jsonwebtoken`
- Expiram em 7 dias
- Armazenados em `localStorage`

✅ **Criptografia de Senhas**
- bcryptjs com salt 10
- Comparação segura de senhas

✅ **Middlewares**
- `authMiddleware`: Valida JWT em requests protegidos
- `adminMiddleware`: Verifica se o usuário é admin

✅ **CORS**
- Configurado para aceitar requests do frontend

---

## 📊 Próximas Tarefas (Priority Order)

### 🔴 ALTA PRIORIDADE

**Backend:**
1. Criar controlador de autenticação
   - POST `/api/auth/login` - Login do usuário
   - POST `/api/auth/register` - Cadastro do usuário
   - POST `/api/auth/logout` - Logout

2. Criar rotas de serviços
   - GET `/api/services` - Listar serviços
   - POST `/api/services` - Criar (admin only)
   - PUT `/api/services/:id` - Editar (admin only)
   - DELETE `/api/services/:id` - Deletar (admin only)

3. Criar rotas de agendamentos
   - GET `/api/appointments` - Listar agendamentos do usuário
   - POST `/api/appointments` - Criar agendamento
   - PUT `/api/appointments/:id` - Atualizar status
   - DELETE `/api/appointments/:id` - Cancelar

**Frontend:**
1. Conectar forms de login/register aos endpoints
2. Implementar fluxo de autenticação completo
3. Criar componentes de agendamento (date picker, horário)

### 🟡 MÉDIA PRIORIDADE
- Componentes de listagem de agendamentos
- Dashboard com gráficos/estatísticas
- Gestão de barbeiros (admin)
- Validações avançadas
- Tratamento de erros com notificações

### 🟢 BAIXA PRIORIDADE
- Tests unitários
- Pagamento online (v2)
- Notificações via WhatsApp (v2)
- App mobile (v3)

---

## 🧪 Verificar Setup

Execute os comandos para confirmar tudo funcionando:

```bash
# 1. Frontend compila?
cd c:\Users\Rin6\barbearia
npm run build
# Resultado esperado: ✓ Compiled successfully

# 2. Backend compila?
cd backend
npm run build
# Resultado esperado: Sem erros

# 3. Frontend inicia?
npm run dev
# Resultado esperado: ▲ Next.js 16 ready on http://localhost:3000

# 4. Backend inicia?
cd backend && npm run dev
# Resultado esperado: 🚀 BarberPro API running on http://localhost:3001

# 5. Banco de dados?
npx prisma studio
# Vai abrir interface web para visualizar dados
```

---

## 📚 Recursos Úteis

### Documentação
- [Next.js](https://nextjs.org/docs)
- [Express.js](https://expressjs.com)
- [Prisma](https://www.prisma.io/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Hook Form](https://react-hook-form.com/)

### Arquivos Importantes
- **Autenticação**: `backend/src/utils/auth.ts`
- **Middlewares**: `backend/src/middlewares/auth.ts`
- **Store Zustand**: `src/hooks/useAuth.ts`
- **Cliente API**: `src/lib/api.ts`
- **Prisma Schema**: `backend/prisma/schema.prisma`
- **Tailwind Config**: `tailwind.config.ts`

---

## 💡 Dicas de Desenvolvimento

### Para adicionar nova página no frontend:
```bash
# Crie um novo arquivo em src/app/
# Por exemplo: src/app/services/page.tsx

export default function ServicesPage() {
  return (
    <div className="bg-barber-black min-h-screen">
      {/* Conteúdo */}
    </div>
  );
}
```

### Para adicionar novo endpoint no backend:
```bash
# 1. Crie controlador em src/controllers/
# 2. Crie rota em src/routes/
# 3. Adicione em src/index.ts
# 4. Use middlewares (authMiddleware, adminMiddleware)

import { authMiddleware, adminMiddleware } from "../middlewares/auth";

router.post("/services", adminMiddleware, createService);
```

### Para fazer request ao backend:
```tsx
import apiClient from "@/lib/api";

// GET
const response = await apiClient.get("/services");

// POST
const response = await apiClient.post("/auth/login", {
  email: "user@example.com",
  password: "password"
});

// Token é enviado automaticamente via interceptor!
```

---

## ⚠️ Troubleshooting

### Erro: "ECONNREFUSED" ao conectar no backend
**Problema**: Backend não está rodando  
**Solução**: `cd backend && npm run dev`

### Erro: "DATABASE_URL" não definida
**Problema**: Arquivo `.env` não criado no backend  
**Solução**: Copie `.env.example` para `.env` e preencha os valores

### Erro: Porta 3000 ou 3001 já em uso
**Solução Frontend**: `npm run dev -- -p 3002`  
**Solução Backend**: Mude `PORT` no `.env`

### Erro: "bcryptjs module not found"
**Problema**: Dependências não instaladas  
**Solução**: `cd backend && npm install`

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique a documentação do framework (links acima)
2. Leia os comentários no código
3. Revise o `.github/copilot-instructions.md`

---

**🎉 Parabéns!** Seu projeto BarberPro está pronto para desenvolvimento!

**Próximo passo**: Implemente os endpoints de autenticação no backend!
