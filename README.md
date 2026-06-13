# Nano Link - Premium URL Shortener Full-Stack SaaS

A production-ready full-stack URL Shortener SaaS (modeled after Dub.co and Bitly) featuring secure JWT authentication (with access token + HttpOnly refresh token rotation), a custom redirection engine, real-time analytics aggregation, dynamic QR code generators, and bulk CSV uploads.

## Technical Architecture

### Backend (Node.js & Express)
Built with high-performance separation of concerns (Repositories -> Services -> Controllers):
- **Repositories**: Direct data queries using Prisma ORM.
- **Services**: Domain logic (CSV parser streams, IP/UserAgent device parser, QR generators).
- **Controllers**: Express request endpoints wrapping HTTP response codes and error handling.
- **Security**: Rate limits (`express-rate-limit`), security headers (`helmet`), Zod validation schemas, and cookie parsers.
- **Documentation**: Swagger API catalog serving interactive schema descriptions.

### Frontend (React & Vite)
- **Vite + React (TypeScript)**: Highly optimised, lightweight bundler and typed application logic.
- **Tailwind CSS**: Curved glassmorphic dashboards, light/dark modes, and sleek startup typography.
- **Framer Motion**: Smooth page loads, modal pops, and copy checkmark pop micro-animations.
- **React Query (TanStack)**: Multi-cache data syncer and automatic refetch policies.
- **Recharts**: Responsive SVG graphs for geographic source metrics, browsers, and daily visitor timelines.

---

## Setup & Running Locally

### Step 1: Database Setup
Make sure you have a PostgreSQL database server running.
Create a database called `url_shortener`.

### Step 2: Backend Configuration
1. Navigate to `/backend`.
2. Edit the `.env` file to match your PostgreSQL server credentials:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/url_shortener?schema=public"
   ```
3. Install dependencies and run database migrations:
   ```bash
   npm install
   npx prisma migrate dev --name init
   ```
4. Start the Express development server:
   ```bash
   npm run dev
   ```
   *The server will boot on `http://localhost:5000`.*
   *Interactive API Docs will be available at `http://localhost:5000/api-docs`.*

### Step 3: Frontend Configuration
1. Navigate to `/frontend`.
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   *The client will boot on `http://localhost:5173`.*

---

## Folder Structures

```
nanolink/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma      # Prisma ORM schema
│   ├── src/
│   │   ├── controllers/       # HTTP controllers
│   │   ├── services/          # Business logic services
│   │   ├── repositories/      # Prisma DB query layer
│   │   ├── middlewares/       # JWT Auth, Errors, Validation, limits
│   │   ├── routes/            # Express routes
│   │   ├── validators/        # Zod input schemas
│   │   ├── utils/             # Helper classes (JWT, prisma client, errors)
│   │   ├── swagger/           # OpenAPI specs
│   │   └── app.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/        # Particle Canvas, modals, loaders
    │   ├── pages/             # LandingPage, Login, Signup, Dashboard, Analytics, CSV
    │   ├── layouts/           # AuthLayout, DashboardLayout
    │   ├── hooks/             # Custom utility hooks
    │   ├── services/          # Axios wrappers
    │   ├── lib/               # Custom axios configurations
    │   └── contexts/          # Theme, Auth, Toast contexts
    ├── package.json
    └── tailwind.config.js
```
