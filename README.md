# 🎓 Coaching Center Operating System

A comprehensive, production-grade tutoring and education management platform built with modern web technologies. This system manages the complete lifecycle of a coaching center including student enrollment, course delivery, attendance tracking, finance, HR operations, and marketing.

---

## 📖 Table of Contents

- [Quick Start](#-quick-start)
- [Tech Stack](#-tech-stack)
- [New Developer Onboarding](#-new-developer-onboarding)
- [Development Standards](#-development-standards)
- [Architecture Overview](#-architecture-overview)
- [Design Decisions & Rationale](#-design-decisions--rationale)
- [Common Gotchas & Troubleshooting](#-common-gotchas--troubleshooting)
- [Database Guide](#-database-guide)
- [Testing Strategy](#-testing-strategy)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| [Node.js](https://nodejs.org/) | v20+ | Runtime |
| [Docker](https://www.docker.com/) | Latest | Database container |
| [Git](https://git-scm.com/) | Latest | Version control |

### 1. Clone & Install

```bash
git clone <repository-url>
cd future-ready-web
npm install
```

### 2. Environment Setup

Create a `.env` file from the template:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tutoring"

# Authentication (NextAuth v5)
AUTH_SECRET="your-super-secure-secret-key"  # Run `npx auth secret` to generate
AUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST=true

# Email (Nodemailer)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Payments (Razorpay - India)
RAZORPAY_KEY_ID="rzp_test_xxx"
RAZORPAY_KEY_SECRET="xxx"

# File Uploads (UploadThing)
UPLOADTHING_SECRET="sk_xxx"
UPLOADTHING_APP_ID="xxx"

# Client-side Variables
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_xxx"
```

### 3. Database Setup

```bash
# Start PostgreSQL via Docker
docker compose up -d db

# Generate Prisma Client
npx prisma generate

# Apply migrations
npx prisma db push

# Seed with sample data (optional)
npx prisma db seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🛠️ Tech Stack

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | Next.js | 16.0.10 | App Router, Server Components |
| **Runtime** | React | 19.2.1 | UI with React Compiler |
| **Language** | TypeScript | 5.x | Strict type safety |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS |
| **Database** | PostgreSQL | 15 | Primary data store |
| **ORM** | Prisma | 6.19.1 | Database access layer |
| **Authentication** | NextAuth.js | v5-beta.30 | Auth with JWT strategy |
| **Validation** | Zod | 4.1.13 | Schema validation |
| **i18n** | next-intl | 4.6.0 | Internationalization (en, hi, pa) |
| **Payments** | Razorpay | 2.9.6 | Payment processing (INR) |
| **File Uploads** | UploadThing | 7.7.4 | Image/document uploads |
| **Rich Text** | Tiptap | 3.14.0 | WYSIWYG editor |
| **Email** | Nodemailer | 7.x | Transactional emails |
| **Testing** | Jest + Playwright | 30 / 1.57 | Unit, Integration, E2E |
| **Performance** | Vercel Speed Insights | 1.3.1 | Real User Monitoring |

---

## 👋 New Developer Onboarding

### Day 1: Environment Setup

1. **Clone the repository** and install dependencies
2. **Set up environment** variables (copy from team vault/1Password)
3. **Start the database** with Docker
4. **Run migrations** and seed data
5. **Start dev server** and explore the app

### Day 1-2: Codebase Familiarization

1. **Read this README** completely
2. **Review `ai instructions.md`** - detailed coding standards and patterns
3. **Explore `prisma/DATABASE.md`** - database schema and architecture
4. **Review `prisma/schema.prisma`** - understand the data model
5. **Browse `/src/app/[locale]`** - understand the route structure

### Week 1: Key Concepts to Master

| Concept | Files to Study | Priority |
|---------|---------------|----------|
| Authentication | `src/auth.ts`, `src/auth.config.ts`, `src/proxy.ts` | 🔴 High |
| Database Access | `src/lib/db.ts`, `prisma/schema.prisma` | 🔴 High |
| Server Actions | `src/lib/actions/*.ts`, `src/app/actions/*.ts` | 🔴 High |
| Role-Based Access | `src/lib/permissions*.ts`, `src/hooks/use-permission.ts` | 🟡 Medium |
| Internationalization | `src/i18n/`, `messages/*.json` | 🟡 Medium |
| Testing Patterns | `src/lib/__tests__/`, `e2e/` | 🟡 Medium |

### First Task Recommendations

1. **Fix a small bug** - familiarize with the codebase
2. **Add a translation key** - understand i18n workflow
3. **Write a unit test** - learn testing patterns
4. **Create a simple server action** - understand data flow

---

## 📐 Development Standards

### TypeScript Configuration

We use **strict TypeScript** with additional safety flags:

```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "noImplicitOverride": true,
  "exactOptionalPropertyTypes": true,
  "verbatimModuleSyntax": true
}
```

> **Important**: All array access requires null checks. All optional properties must explicitly include `undefined`.

### Core Principles

| Principle | Description | Example |
|-----------|-------------|---------|
| **Type Safety First** | TypeScript types + Zod runtime validation | Never trust external input |
| **Server Components Default** | Use `'use client'` only when needed | Keep bundle sizes small |
| **Named Exports Only** | No `export default` | Better tree-shaking, IDE support |
| **Colocate by Feature** | Keep related files together | `/app/[locale]/admin/users/` |
| **Rule of Three** | Abstract after 3rd occurrence | Avoid premature abstraction |

### File Naming Conventions

```
Server Components:     UserProfile.tsx
Client Components:     UserProfileClient.tsx (or 'use client' directive)
Server Actions:        actions.ts
Types:                 types.ts (colocated)
Schemas:               schema.ts (Zod, colocated)
```

### Import Patterns

```typescript
// ✅ Correct - Use path aliases
import { db } from '@/lib/db'
import { auth } from '@/auth'
import { createUserSchema } from './schema'

// ❌ Wrong - Relative path hell
import { db } from '../../../lib/db'
```

### Server Action Pattern

```typescript
// src/lib/actions/users.ts
'use server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
})

export async function createUser(raw: unknown) {
  // 1. Authenticate
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  // 2. Validate input
  const data = createUserSchema.parse(raw)

  // 3. Database operation
  return await db.user.create({ data })
}
```

### Styling Guidelines

- Use **Tailwind CSS 4** utility classes directly
- **NO `@apply`** in component files
- Create React components for reusable patterns
- Mobile-first responsive design

```typescript
// ✅ Correct
<div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm">

// ❌ Wrong - Custom class requiring @apply
<div className="card-container">
```

---

## 🏗️ Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Client Browser                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐   │
│   │   React 19      │    │   Next.js 16    │    │  Tailwind 4  │   │
│   │   Components    │◀──▶│   App Router    │◀──▶│   Styling    │   │
│   └─────────────────┘    └─────────────────┘    └──────────────┘   │
│                                   ▲                                   │
└───────────────────────────────────│───────────────────────────────────┘
                                    │
                          ┌─────────▼─────────┐
                          │    Middleware     │
                          │ (Auth + i18n)     │
                          └─────────┬─────────┘
                                    │
     ┌──────────────────────────────┼──────────────────────────────┐
     │                              │                               │
     ▼                              ▼                               ▼
┌─────────┐                  ┌─────────────┐               ┌─────────────┐
│  API    │                  │   Server    │               │   Server    │
│ Routes  │                  │  Components │               │   Actions   │
└────┬────┘                  └──────┬──────┘               └──────┬──────┘
     │                              │                              │
     └──────────────────────────────┼──────────────────────────────┘
                                    │
                          ┌─────────▼─────────┐
                          │   Prisma ORM      │
                          │   (db.ts)         │
                          └─────────┬─────────┘
                                    │
                          ┌─────────▼─────────┐
                          │   PostgreSQL 15   │
                          │   (Docker)        │
                          └───────────────────┘
```

### Directory Structure

```
future-ready-web/
├── prisma/
│   ├── schema.prisma        # Database schema (single source of truth)
│   ├── migrations/          # DB migrations history
│   ├── seed.ts              # Sample data seeding
│   └── DATABASE.md          # Database documentation
│
├── src/
│   ├── app/
│   │   ├── [locale]/        # Internationalized routes
│   │   │   ├── admin/       # Admin dashboard (DIRECTOR, ADMIN, MANAGER roles)
│   │   │   │   ├── users/
│   │   │   │   ├── courses/
│   │   │   │   ├── batches/
│   │   │   │   └── ...
│   │   │   ├── teacher/     # Teacher portal
│   │   │   ├── student/     # Student portal
│   │   │   ├── staff/       # Staff portal (HR, Payroll, Marketing)
│   │   │   └── layout.tsx   # Root layout with i18n
│   │   ├── actions/         # Route-specific server actions
│   │   └── api/             # API routes (auth, webhooks, uploads)
│   │
│   ├── components/
│   │   ├── admin/           # Admin-specific components
│   │   ├── ui/              # Shared UI components
│   │   ├── layout/          # Layout components (Nav, Sidebar)
│   │   └── forms/           # Form components
│   │
│   ├── lib/
│   │   ├── actions/         # Shared server actions
│   │   ├── db.ts            # Prisma singleton
│   │   ├── email.ts         # Nodemailer utility
│   │   ├── rate-limit.ts    # Rate limiting (LRU cache)
│   │   ├── permissions*.ts  # RBAC logic
│   │   └── audit.ts         # Audit logging
│   │
│   ├── hooks/               # Custom React hooks
│   ├── i18n/                # i18n configuration
│   ├── auth.ts              # NextAuth v5 config
│   ├── auth.config.ts       # Auth providers config
│   ├── proxy.ts             # Auth + i18n middleware
│   └── env.mjs              # Type-safe env vars
│
├── messages/                # Translation files
│   ├── en.json
│   └── hi.json
│
├── e2e/                     # Playwright E2E tests
└── public/                  # Static assets
```

### User Role Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                         DIRECTOR                                 │
│                    (Full Strategic Access)                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    ┌────▼────┐        ┌─────▼─────┐       ┌─────▼─────┐
    │  ADMIN  │        │ GENERAL   │       │ BUSINESS  │
    │         │        │ MANAGER   │       │ ANALYST   │
    └────┬────┘        └─────┬─────┘       └───────────┘
         │                   │
    ┌────┘                   └────┐
    │                             │
┌───▼────┐  ┌───────────┐  ┌─────▼─────┐  ┌───────────────┐
│  HR    │  │  PAYROLL  │  │ MARKETING │  │  BACKOFFICE   │
│MANAGER │  │  MANAGER  │  │ DIGITAL   │  │               │
└────────┘  └───────────┘  └───────────┘  └───────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         TEACHER                                  │
│               (Course delivery, Attendance)                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         STUDENT                                  │
│                    (Learning Access)                             │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow: Student Enrollment

```
User Submit Form
       │
       ▼
┌──────────────────┐    Zod Validation    ┌───────────────────┐
│   Client Form    │───────────────────▶  │   Server Action   │
│  (React Hook     │                      │  (createEnrollment)│
│   Form/State)    │                      └─────────┬─────────┘
└──────────────────┘                                │
                                            auth() check
                                                    │
                                            ┌───────▼───────┐
                                            │   Prisma      │
                                            │ $transaction  │
                                            └───────┬───────┘
                                                    │
           ┌────────────────────────────────────────┼─────────────────────┐
           │                                        │                     │
           ▼                                        ▼                     ▼
    ┌─────────────┐                         ┌─────────────┐      ┌─────────────┐
    │ Enrollment  │                         │ Notification│      │  AuditLog   │
    │   Created   │                         │    Sent     │      │   Created   │
    └─────────────┘                         └─────────────┘      └─────────────┘
```

---

## 🎯 Design Decisions & Rationale

### 1. NextAuth v5 with JWT Strategy

**Decision**: Use JWT sessions instead of database sessions.

**Rationale**:
- ✅ Stateless authentication (no DB hit per request)
- ✅ Works with serverless deployments
- ✅ Easier to scale horizontally
- ⚠️ Tokens can't be invalidated until expiry (mitigated by short expiry + refresh)

```typescript
// auth.ts
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' }, // Critical for performance
  // ...
})
```

### 2. Prisma Singleton Pattern

**Decision**: Use a global singleton for Prisma client.

**Rationale**:
- ✅ Prevents connection pool exhaustion in development (hot reload)
- ✅ Consistent across all server components and actions
- ✅ Standard pattern recommended by Prisma

```typescript
// lib/db.ts
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }
export const db = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

### 3. Server Actions over API Routes

**Decision**: Use Server Actions for mutations, API Routes only for webhooks/external.

**Rationale**:
- ✅ Type-safe end-to-end (input and output)
- ✅ Automatic form integration with React 19
- ✅ Progressive enhancement (works without JS)
- ✅ Simplified error handling

### 4. Zod at All Boundaries

**Decision**: Validate with Zod at every data boundary, even with TypeScript types.

**Rationale**:
- ✅ TypeScript types are erased at runtime
- ✅ Protects against malformed external data
- ✅ Self-documenting schemas
- ✅ Composable validation rules

```typescript
// Never trust inputs even with TS
export async function createUser(raw: unknown) { // <-- `unknown`, not typed
  const data = createUserSchema.parse(raw)       // Runtime validation
  return db.user.create({ data })
}
```

### 5. Internationalization with Dynamic Locale

**Decision**: Use `[locale]` dynamic segment for all routes.

**Rationale**:
- ✅ SEO-friendly URLs (`/en/courses`, `/hi/courses`)
- ✅ Easy to add new languages
- ✅ Preserves locale in navigation
- ⚠️ All routes need `[locale]` prefix (enforced by structure)

### 6. Feature-Based File Organization

**Decision**: Colocate files by feature, not by type.

**Rationale**:
- ✅ Easier to find related files
- ✅ Better encapsulation
- ✅ Simpler refactoring (move entire folder)
- ✅ Clear ownership

```
# ✅ Feature-based (preferred)
/app/[locale]/admin/users/
  ├── page.tsx
  ├── actions.ts
  ├── schema.ts
  └── components/
      └── UserTable.tsx

# ❌ Type-based (avoid)
/components/UserTable.tsx
/actions/userActions.ts
/schemas/userSchema.ts
```

### 7. Role Model Instead of Enum

**Decision**: Use a `Role` model with dynamic permissions instead of hardcoded enum.

**Rationale**:
- ✅ Roles can be added/modified without schema migration
- ✅ Permissions are data, not code
- ✅ UI for role management possible
- ⚠️ Slightly more complex queries

---

## ⚠️ Common Gotchas & Troubleshooting

### NextAuth v5 Import Paths

> **Gotcha**: NextAuth v4 patterns will NOT work. v5 has breaking changes.

```typescript
// ❌ WRONG (v4 pattern)
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// ✅ CORRECT (v5 pattern)
import { auth } from '@/auth'
const session = await auth()
```

### Client vs Server Component Boundaries

> **Gotcha**: If you see `Functions cannot be passed...` error, you're mixing boundaries.

```typescript
// ❌ WRONG - Passing function to Client Component
<ClientButton onClick={async () => await serverAction()} />

// ✅ CORRECT - Use form action
<form action={serverAction}>
  <button type="submit">Submit</button>
</form>

// ✅ CORRECT - Import server action in client
'use client'
import { serverAction } from './actions'

function ClientComponent() {
  return <button onClick={() => serverAction()}>Click</button>
}
```

### Array Access with `noUncheckedIndexedAccess`

> **Gotcha**: Array access returns `T | undefined`, not `T`.

```typescript
const users = await db.user.findMany()

// ❌ WRONG
const first = users[0].name // Error: Object is possibly 'undefined'

// ✅ CORRECT
const first = users[0]?.name
// OR
if (users[0]) {
  const first = users[0].name
}
```

### Database Connection in Docker

> **Gotcha**: Use `localhost` when app runs locally, `db` when app runs in Docker.

```bash
# Local development (app outside Docker, DB in Docker)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tutoring"

# Full Docker setup (both app and DB in Docker)
DATABASE_URL="postgresql://postgres:postgres@db:5432/tutoring"
```

### Prisma Migration vs Push

> **Gotcha**: Use the right command for your use case.

```bash
# Development - Quick iteration, no migration history
npx prisma db push

# Production - Maintain migration history
npx prisma migrate dev --name add_new_field
```

### Rate Limiting

> **Gotcha**: API routes are rate-limited to 100 requests/minute per IP.

Check `src/lib/rate-limit.ts` if you encounter "Too Many Requests" errors.

### Currency Display

> **Gotcha**: This is an India-focused app. Currency is INR (₹), not USD ($).

```typescript
// ✅ Correct
const formatted = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR'
}).format(amount)
```

---

## 🗄️ Database Guide

### Quick Commands

```bash
# Start database
docker compose up -d db

# Open Prisma Studio (GUI)
npx prisma studio

# Generate client after schema changes
npx prisma generate

# Apply schema changes (development)
npx prisma db push

# Create migration (staging/production)
npx prisma migrate dev --name <name>

# Reset database (DELETES ALL DATA)
npx prisma migrate reset
```

### Schema Overview

See `prisma/DATABASE.md` for detailed documentation. Key models:

| Domain | Models |
|--------|--------|
| **User Management** | User, Role, Permission, StudentProfile, TeacherProfile, StaffProfile |
| **Course Management** | Roadmap, Course, Curriculum, Module, Lesson, Assignment, Quiz |
| **Enrollment** | Batch, Enrollment, Attendance, Submission, LessonProgress |
| **Finance** | PaymentReceipts, Salary, SalaryReceipt, Expense |
| **Marketing** | Lead, LeadActivity, Campaign |
| **System** | Announcement, Query, Notification, AuditLog, Setting |

---

## 🧪 Testing Strategy

### Unit Tests (Jest)

```bash
# Run all unit tests
npm test

# Watch mode
npm run test:watch
```

Location: `src/lib/__tests__/`, `src/components/__tests__/`

### E2E Tests (Playwright)

```bash
# Run E2E tests
npx playwright test

# UI mode
npx playwright test --ui
```

Location: `e2e/`

### Test Database

Tests can use SQLite for isolation:

```env
# test.env
DATABASE_URL="file:./test.db"
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. Connect repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Docker Production Build

```bash
# Build production image
docker compose -f docker-compose.yml up --build

# Or build manually
docker build -t coaching-os .
docker run -p 3000:3000 --env-file .env coaching-os
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `AUTH_SECRET` | ✅ | NextAuth secret (32+ chars) |
| `AUTH_URL` | ✅ | App URL for auth callbacks |
| `SMTP_*` | ✅ | Email configuration |
| `RAZORPAY_*` | ✅ | Payment gateway |
| `UPLOADTHING_*` | ✅ | File uploads |

---

## 🤝 Contributing

### Branch Naming

```
feature/<feature-name>   # New features
fix/<bug-description>    # Bug fixes
refactor/<scope>         # Code improvements
docs/<topic>             # Documentation
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(auth): add password reset flow
fix(enrollment): handle edge case for duplicate
refactor(actions): extract validation logic
docs(readme): add architecture section
```

### Pull Request Process

1. Create feature branch from `main`
2. Make changes following our standards
3. Ensure all tests pass: `npm run build`
4. Open PR with description
5. Address review feedback
6. Merge after approval

### Pre-commit Checklist

- [ ] TypeScript compiles without errors (`tsc --noEmit`)
- [ ] ESLint passes (`eslint .`)
- [ ] Tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Server actions have Zod validation
- [ ] New translations added to all locales

---

## 📚 Additional Resources

- [ai instructions.md](./ai%20instructions.md) - Detailed coding patterns and standards
- [prisma/DATABASE.md](./prisma/DATABASE.md) - Database schema documentation
- [Next.js 16 Docs](https://nextjs.org/docs) - Framework documentation
- [NextAuth v5 Docs](https://authjs.dev/) - Authentication guide
- [Prisma Docs](https://www.prisma.io/docs) - ORM documentation

---

## 📞 Support

For questions or issues:

1. Check the [Common Gotchas](#-common-gotchas--troubleshooting) section
2. Search existing GitHub issues
3. Create a new issue with reproduction steps

---

<p align="center">
  Built with ❤️ for education
</p>
