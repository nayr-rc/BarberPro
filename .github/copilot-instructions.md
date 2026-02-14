# BarberPro Development Instructions

## Project Overview
BarberPro é uma plataforma de agendamento para barbearias construída com Next.js (frontend) e Node.js/Express (backend).

### Technology Stack
- **Frontend**: Next.js 16, React 19, Tailwind CSS, Zustand, React Hook Form, Axios
- **Backend**: Express, TypeScript, Prisma ORM, PostgreSQL, JWT, bcryptjs
- **Database**: PostgreSQL

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm/yarn

### Initial Setup
1. Frontend dependencies already installed: `npm install` ✓
2. Backend dependencies: `cd backend && npm install` ✓
3. Configure PostgreSQL and create database
4. Set environment variables (see `.env.example` files)
5. Run Prisma migrations: `npx prisma migrate dev`

## Project Structure

```
barbearia/
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── index.ts           # Entry point
│   │   ├── controllers/       # Request handlers
│   │   ├── middlewares/       # Auth, validation
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   └── utils/             # Helpers (auth, jwt, etc)
│   ├── prisma/schema.prisma   # Database schema
│   └── package.json
│
├── src/                        # Next.js frontend
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── auth/              # Auth pages
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── client/            # Client dashboard
│   │   └── admin/             # Admin dashboard
│   ├── components/
│   │   ├── client/
│   │   ├── admin/
│   │   └── shared/
│   ├── hooks/useAuth.ts       # Zustand auth store
│   ├── lib/
│   │   ├── api.ts             # Axios instance
│   │   └── auth.ts            # Auth functions
│   └── public/
│
├── tailwind.config.ts         # Tailwind config with custom colors
├── tsconfig.json
└── README.md
```

## Color Palette (Barbershop Theme)

Custom Tailwind colors configured in `tailwind.config.ts`:
- `barber-black`: #1a1a1a (primary background)
- `barber-dark`: #2d2d2d (secondary background)
- `barber-brown`: #6b4423 (borders, hover)
- `barber-brown-light`: #8b5a3c
- `barber-beige`: #e8dcc8 (primary text)
- `barber-beige-light`: #f5f1e8 (light backgrounds)
- `barber-accent`: #d4a574 (highlights, buttons)

## Running the Project

### Development
```bash
# Terminal 1 - Frontend (port 3000)
npm run dev

# Terminal 2 - Backend (port 3001)
cd backend && npm run dev
```

### Building
```bash
# Frontend
npm run build
npm start

# Backend
cd backend
npm run build
npm start
```

## Key Features Implemented

✅ Landing page with BarberPro branding
✅ Dark theme barbershop color scheme
✅ Authentication structure (login/register pages)
✅ Client dashboard placeholder
✅ Admin dashboard placeholder
✅ Zustand store for auth state management
✅ Axios API client with JWT interceptor
✅ Prisma schema with all core models
✅ Backend auth utilities (JWT, bcrypt)
✅ CORS and middleware setup

## Priority Next Steps

1. **Backend API Routes** (HIGH)
   - Auth endpoints: POST /api/auth/login, POST /api/auth/register
   - Services CRUD: GET/POST/PUT/DELETE /api/services
   - Appointments CRUD: GET/POST/PUT/DELETE /api/appointments
   - Barbers management: GET/POST/PUT/DELETE /api/barbers
   - Client routes: GET /api/profile, PUT /api/profile

2. **Frontend Pages** (HIGH)
   - Complete appointment booking flow
   - Client appointment list with cancellation
   - Admin schedule/calendar view
   - Service management interface
   - Barber management interface

3. **Database & Migrations** (HIGH)
   - Run `npx prisma migrate dev --name init`
   - Populate sample barbers and services
   - Test database connections

4. **Features** (MEDIUM)
   - Appointment availability calculation
   - Email notifications
   - Form validation improvements
   - Error handling patterns
   - Loading states

## File Organization Guidelines

- Components: One component per file in `src/components/`
- Pages: Use Next.js routing (files in `src/app/`)
- Types: Define in files where used or in `src/lib/types.ts`
- Utilities: Keep in `src/lib/` for frontend, `src/utils/` for backend
- Hooks: Custom hooks in `src/hooks/`

## Styling Guidelines

- Use Tailwind classes exclusively
- Use custom color names: `text-barber-beige`, `bg-barber-dark`, etc.
- Mobile-first approach
- Dark theme by default
- Consistent spacing with Tailwind scale

## Database Schema

Key models in `backend/prisma/schema.prisma`:
- **User**: Stores clients and admins (role field distinguishes them)
- **Barber**: Professionals offering services
- **Service**: Services offered (corte, barba, corte+barba, etc)
- **Appointment**: Bookings linking user + barber + service + time

## Security Notes

- Passwords hashed with bcryptjs (salt 10)
- JWT tokens expire in 7 days
- Use `authMiddleware` to protect routes
- Use `adminMiddleware` for admin-only routes
- Environment variables for secrets (DB, JWT_SECRET)
- CORS configured on backend
- Input validation on both frontend and backend

## Environment Variables

Frontend (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Backend (`backend/.env`):
```
DATABASE_URL=postgresql://user:password@localhost:5432/barberpro
JWT_SECRET=your_jwt_secret_here
PORT=3001
NODE_ENV=development
```

## Testing the App

1. Frontend builds successfully: `npm run build` ✓
2. Backend builds successfully: `cd backend && npm run build` ✓
3. Both dev servers start without errors
4. Frontend accessible at http://localhost:3000
5. Backend health check: GET http://localhost:3001/api/health

## Common Commands Reference

```bash
# Frontend
npm run dev              # Start dev server
npm run build            # Production build
npm run lint             # Run ESLint

# Backend
cd backend
npm run dev              # Start with ts-node
npm run build            # Compile TypeScript
npm start                # Run compiled version
npx prisma migrate dev   # Create new migration
npx prisma studio       # Open DB studio
```

---

**Project Status**: MVP Phase - Core structure in place, ready for feature development
**Last Updated**: February 2026
**Maintainer**: Development Team
