# BarberPro - Plataforma de Agendamento para Barbearia

Uma plataforma web moderna para gerenciamento de agendamentos em barbearias, com separação clara entre painéis de cliente e barbeiro.

## 🎯 Características

- ✅ **Autenticação Segura**: Login com JWT e senhas criptografadas com bcrypt
- ✅ **Painel do Cliente**: Agendamento, cancelamento e histórico de atendimentos
- ✅ **Painel do Barbeiro/Admin**: Gerenciamento completo de agenda, clientes e serviços
- ✅ **Privacidade**: Clientes anônimos entre si, dados protegidos
- ✅ **Design Responsivo**: Mobile-first com tema escuro personalizado
- ✅ **LGPD Compliant**: Conformidade com regulamentações de privacidade

## 🏗️ Arquitetura

### Frontend (Next.js + React)
- Framework: Next.js 16 com App Router
- Styling: Tailwind CSS com tema personalizado (preto, marrom, bege)
- Estado Global: Zustand
- Forms: React Hook Form
- API Client: Axios

### Backend (Node.js + Express)
- Runtime: Node.js com TypeScript
- API: Express.js
- Database: PostgreSQL
- ORM: Prisma
- Auth: JWT + bcryptjs

## 🚀 Começando

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- PostgreSQL 12+

### Instalação

1. **Instale dependências do frontend:**
```bash
npm install
```

2. **Instale dependências do backend:**
```bash
cd backend
npm install
```

3. **Configure as variáveis de ambiente:**

Frontend (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Backend (`backend/.env`):
```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/barberpro"
JWT_SECRET="sua_chave_secreta_super_segura"
PORT=3001
NODE_ENV="development"
```

4. **Configure o banco de dados:**
```bash
cd backend
npx prisma migrate dev --name init
```

### Executando o Projeto

**Terminal 1 - Frontend (porta 3000):**
```bash
npm run dev
```

**Terminal 2 - Backend (porta 3001):**
```bash
cd backend
npm run dev
```

Acesse http://localhost:3000

## 🎨 Paleta de Cores

- **Preto Principal**: `#1a1a1a`
- **Preto Escuro**: `#2d2d2d`
- **Marrom**: `#6b4423`
- **Marrom Claro**: `#8b5a3c`
- **Bege**: `#e8dcc8`
- **Bege Claro**: `#f5f1e8`
- **Accent**: `#d4a574`

## 🔐 Segurança

- ✅ Senhas criptografadas com bcryptjs (salt 10)
- ✅ Tokens JWT com expiração de 7 dias
- ✅ RBAC (Role-Based Access Control)
- ✅ Proteção contra XSS, CSRF e SQL Injection
- ✅ CORS configurado
- ✅ Validação de entrada em todos os endpoints

---

Desenvolvido com ❤️ para barbearias
