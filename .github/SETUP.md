# BarberPro - Instruções de Desenvolvimento

Bem-vindo ao BarberPro! Este projeto foi scaffolded com Next.js + Express + PostgreSQL.

## 📋 Setup Checklist

### 1. Dependências Instaladas ✅
- Frontend: Next.js, React, Tailwind CSS, Zustand, React Hook Form, Axios
- Backend: Express, Prisma, JWT, bcryptjs, PostgreSQL

### 2. Variáveis de Ambiente

**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Backend** (`backend/.env`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/barberpro"
JWT_SECRET="sua_chave_secreta_mude_em_producao"
PORT=3001
NODE_ENV="development"
```

### 3. Setup do Banco de Dados

```bash
# 1. Inicie o PostgreSQL
# No Windows, use: Services > PostgreSQL

# 2. Crie o banco de dados
createdb barberpro

# 3. Execute as migrações Prisma
cd backend
npx prisma migrate dev --name init
```

### 4. Estrutura do Projeto

```
barbearia/
├── backend/                  # API Node.js + Express
│   ├── src/
│   │   ├── index.ts         # Servidor principal
│   │   ├── controllers/     # Lógica dos endpoints
│   │   ├── middlewares/     # Auth, validação, etc
│   │   ├── routes/          # Definição de rotas
│   │   ├── services/        # Regras de negócio
│   │   └── utils/           # Funções auxiliares
│   ├── prisma/
│   │   └── schema.prisma    # Modelo do banco
│   └── package.json
│
├── src/                      # Frontend Next.js
│   ├── app/
│   │   ├── page.tsx         # Landing page
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── client/
│   │   │   └── page.tsx     # Dashboard do cliente
│   │   └── admin/
│   │       └── page.tsx     # Dashboard do admin
│   ├── components/
│   │   ├── client/          # Componentes do painel cliente
│   │   ├── admin/           # Componentes do painel admin
│   │   └── shared/          # Componentes compartilhados
│   ├── hooks/
│   │   └── useAuth.ts       # Store de autenticação (Zustand)
│   ├── lib/
│   │   ├── api.ts           # Cliente Axios
│   │   └── auth.ts          # Funções de auth
│   └── public/              # Assets estáticos
│
├── tailwind.config.ts       # Configuração de cores
├── tsconfig.json
└── README.md
```

## 🚀 Executar o Projeto

### Terminal 1 - Frontend
```bash
npm run dev
# Acesse: http://localhost:3000
```

### Terminal 2 - Backend
```bash
cd backend
npm run dev
# API roda em: http://localhost:3001
```

## 🎯 Próximas Tarefas

### Backend
- [ ] Criar controladores de autenticação (login, register, logout)
- [ ] Implementar rotas de serviços (criar, listar, editar, deletar)
- [ ] Implementar rotas de agendamentos
- [ ] Implementar rotas de barbeiros
- [ ] Criar endpoints de cliente (perfil, histórico)
- [ ] Criar endpoints de admin (dashboard, relatórios)

### Frontend
- [ ] Componente de agendamento (data/hora picker)
- [ ] Listagem de agendamentos do cliente
- [ ] Dashboard do admin com gráficos
- [ ] Gestão de serviços (admin)
- [ ] Gestão de barbeiros (admin)
- [ ] Componentização e reutilização

## 🎨 Guia de Estilos

### Paleta de Cores (Tailwind)
```
Primary Colors:
- barber-black: #1a1a1a
- barber-dark: #2d2d2d
- barber-brown: #6b4423
- barber-accent: #d4a574
- barber-beige: #e8dcc8

Uso:
- Fundo: bg-barber-black ou bg-barber-dark
- Texto principal: text-barber-beige
- Destacar: text-barber-accent ou bg-barber-accent
- Bordas: border-barber-brown
```

### Exemplos
```tsx
// Botão principal
<button className="bg-barber-accent text-barber-black hover:bg-barber-brown">
  Ação
</button>

// Card
<div className="bg-barber-dark border border-barber-brown rounded-lg p-6">
  Conteúdo
</div>

// Texto
<p className="text-barber-beige">Texto principal</p>
<p className="text-barber-accent">Texto destaque</p>
```

## 🔐 Fluxos de Autenticação

### Registro (Cliente)
1. User preenche formulário em `/auth/register`
2. Frontend faz POST `/api/auth/register`
3. Backend valida e cria user com role "client"
4. Retorna token JWT
5. Frontend armazena token em localStorage
6. Redireciona para `/client`

### Login
1. User preenche email/senha em `/auth/login`
2. Frontend faz POST `/api/auth/login`
3. Backend valida credenciais
4. Retorna token + user info
5. Redirect baseado em `user.role` (admin ou client)

### Middlewares
- `authMiddleware`: Valida JWT nos requests
- `adminMiddleware`: Verifica se role === "admin"

## 📊 Modelo de Dados (Prisma)

```prisma
// User (cliente ou admin)
- id, email, password, name, phone, role, createdAt, updatedAt

// Barber (profissional)
- id, name, active, createdAt, updatedAt

// Service (serviço)
- id, name, price, durationMinutes, active, createdAt, updatedAt

// Appointment (agendamento)
- id, userId, barberId, serviceId
- datetimeStart, datetimeEnd
- status (confirmed, cancelled, completed, no_show)
- cancelledBy, createdAt, updatedAt
```

## 🛠️ Comandos Úteis

### Frontend
```bash
npm run dev       # Dev server
npm run build     # Build production
npm start         # Start production
npm run lint      # ESLint check
```

### Backend
```bash
npm run dev                    # Dev server com ts-node
npm run build                  # Build para dist/
npm start                      # Run dist/index.js
npx prisma migrate dev         # Criar nova migração
npx prisma studio             # Visualizar DB
npx prisma generate           # Regenerar Prisma client
```

## 🐛 Troubleshooting

### Erro de conexão com banco
- Verifique se PostgreSQL está rodando
- Confirme DATABASE_URL em `backend/.env`
- Tente: `npx prisma migrate reset` (cuidado: apaga dados)

### Erro CORS
- Backend deve ter `cors()` middleware
- Frontend NEXT_PUBLIC_API_URL deve estar correto

### Token expirado
- Token JWT expira em 7 dias
- Implemente refresh token em v2

### Porta ocupada
- Frontend: Mude para `npm run dev -- -p 3001`
- Backend: Mude `PORT` em `.env`

## 📚 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Express Docs](https://expressjs.com)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Tailwind CSS](https://tailwindcss.com)
- [JWT Info](https://jwt.io)

---

**Last Updated**: Fevereiro 2026
**Status**: MVP em desenvolvimento
