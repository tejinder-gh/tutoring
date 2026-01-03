# Next.js + TypeScript Standards for AI Coding Assistants

## CORE DIRECTIVES

**YOU MUST**:
- Prioritize type safety over convenience
- Default to Server Components unless interactivity required
- Validate all external data with Zod at boundaries
- Follow rule of three: duplicate twice, abstract on third occurrence
- Preserve explicit patterns over clever abstractions
- Catch errors at build time, not runtime

**YOU MUST NEVER**:
- Use default exports (named exports only)
- Pass non-serializable props (functions, Dates, class instances) from Server→Client components
- Create abstractions before seeing pattern repeated 3 times
- Remove runtime validation when TypeScript types exist
- Ignore or remove cache directives (`revalidate`, `dynamic`)
- Mix server and client code without explicit boundaries

---

## FILE STRUCTURE RULES

### Naming Conventions
```
Server Components:     UserProfile.tsx
Client Components:     UserProfileClient.tsx OR 'use client' directive at top
Server Actions:        actions.ts (exports: createUser, deletePost)
Types:                 types.ts (colocated with feature)
Schemas:               schema.ts (Zod schemas, colocated)
```

### File Organization
- Colocate by feature, not by layer
- One component per file
- Filename must match component name exactly
- Keep files under 300 lines
- Structure:


# Next.js + TypeScript Standards for AI Coding Assistants
## STACK-SPECIFIC EDITION

## TECH STACK REFERENCE

```
Framework:     Next.js 16.0.10 (App Router)
Runtime:       React 19.2.1
Database:      Prisma 6.19.1
Auth:          NextAuth v5.0.0-beta.30
Validation:    Zod 4.1.13
Styling:       Tailwind CSS 4
Testing:       Jest 30 + Testing Library + Playwright
File Upload:   UploadThing 7.7.4
Payments:      Razorpay 2.9.6
i18n:          next-intl 4.6.0
Rich Text:     Tiptap 3.14.0
```

---

## CORE DIRECTIVES

**YOU MUST**:
- Use Prisma for ALL database operations (no raw SQL unless performance critical)
- Use NextAuth v5 patterns (NOT v4 - breaking changes)
- Validate with Zod at ALL boundaries (forms, API, Server Actions)
- Follow rule of three: duplicate twice, abstract on third occurrence
- Use Tailwind 4 utility classes (no @apply in components)
- Default to Server Components unless interactivity required
- Catch errors at build time via strict TypeScript

**YOU MUST NEVER**:
- Use default exports (named exports only)
- Pass non-serializable props Server→Client
- Create abstractions before 3rd occurrence
- Remove Zod validation when TypeScript types exist
- Mix NextAuth v4 and v5 patterns
- Use deprecated Prisma patterns
- Import NextAuth from wrong v5 paths

---

## PRISMA PATTERNS

### Database Access Rules

**ALWAYS use Prisma Client from singleton**:
```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

**Usage in Server Components**:
```typescript
// app/users/page.tsx
import { db } from '@/lib/db'

export default async function UsersPage() {
  // Direct Prisma calls in Server Components
  const users = await db.user.findMany({
    where: { active: true },
    include: { profile: true },
    orderBy: { createdAt: 'desc' }
  })

  return <UserList users={users} />
}
```

### Prisma Query Patterns

**N+1 Prevention** [HIGH confidence]:
```typescript
// ❌ WRONG - N+1 query
const users = await db.user.findMany()
for (const user of users) {
  const posts = await db.post.findMany({ where: { userId: user.id } })
}

// ✅ CORRECT - Single query with include
const users = await db.user.findMany({
  include: { posts: true }
})

// ✅ CORRECT - Separate query with where-in
const users = await db.user.findMany()
const userIds = users.map(u => u.id)
const posts = await db.post.findMany({
  where: { userId: { in: userIds } }
})
```

**Transaction Patterns**:
```typescript
// For related writes that must succeed/fail together
const result = await db.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData })
  const profile = await tx.profile.create({
    data: { ...profileData, userId: user.id }
  })
  return { user, profile }
})

// IMPORTANT: Transactions lock rows - keep short
// PERF: Avoid long-running operations in transactions
```

**Zod Integration with Prisma**:
```typescript
// schema.ts
import { z } from 'zod'
import type { User } from '@prisma/client'

// Create schema matches Prisma model
export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(['USER', 'ADMIN']) // Matches Prisma enum
})

// Type inference matches Prisma
export type CreateUserInput = z.infer<typeof createUserSchema>

// Validation + DB operation
export async function createUser(raw: unknown) {
  const data = createUserSchema.parse(raw)
  return await db.user.create({ data })
}
```

**Pagination Pattern**:
```typescript
export async function getUsers(page: number = 1, pageSize: number = 20) {
  const skip = (page - 1) * pageSize

  const [users, total] = await db.$transaction([
    db.user.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' }
    }),
    db.user.count()
  ])

  return {
    users,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  }
}
```

---

## NEXTAUTH V5 PATTERNS

### Configuration (BREAKING CHANGES from v4)

**Auth Config** [HIGH confidence - v5 specific]:
```typescript
// auth.ts
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' }, // v5 default
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const user = await db.user.findUnique({
          where: { email: credentials.email as string }
        })

        if (!user || !user.password) return null

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!valid) return null

        return { id: user.id, email: user.email, name: user.name }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role // Add custom fields
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    }
  }
})
```

**Route Handler** (v5 uses separate handlers export):
```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/auth'

export const { GET, POST } = handlers
```

**Middleware Pattern**:
```typescript
// middleware.ts
import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard')

  if (isOnDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
```

**Server Component Usage**:
```typescript
// app/dashboard/page.tsx
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  return <div>Welcome {session.user.name}</div>
}
```

**Server Action with Auth**:
```typescript
// app/posts/actions.ts
'use server'
import { auth } from '@/auth'
import { db } from '@/lib/db'

export async function createPost(formData: FormData) {
  const session = await auth()

  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  // Validate and create post
  const data = postSchema.parse(Object.fromEntries(formData))

  return await db.post.create({
    data: {
      ...data,
      authorId: session.user.id
    }
  })
}
```

**Client Component Sign In/Out**:
```typescript
// components/AuthButtons.tsx
'use client'
import { signIn, signOut } from 'next-auth/react' // Still from react for client

export function SignInButton() {
  return <button onClick={() => signIn()}>Sign In</button>
}

export function SignOutButton() {
  return <button onClick={() => signOut()}>Sign Out</button>
}
```

---

## TAILWIND 4 PATTERNS

### New Tailwind 4 Syntax [HIGH confidence]

**Import CSS** (Tailwind 4 uses CSS imports):
```css
/* app/globals.css */
@import "tailwindcss";

/* Custom theme if needed */
@theme {
  --color-brand: #0066ff;
}
```

**Utility Classes** (use only built-in utilities):
```typescript
// ✅ CORRECT - Standard utilities
<div className="flex items-center justify-between px-4 py-2 bg-white rounded-lg shadow-sm">

// ❌ WRONG - Don't use @apply in TSX
<div className="custom-card"> {/* requires @apply definition */}
```

**Responsive Design**:
```typescript
<div className="
  w-full
  md:w-1/2
  lg:w-1/3
  p-4
  md:p-6
  lg:p-8
">
```

**Dark Mode** (Tailwind 4 auto-detects):
```typescript
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
```

**Custom Styling Rules**:
- Use Tailwind utilities directly in className
- NO @apply in component files
- For truly reusable patterns, create React components
- Keep custom CSS in globals.css only for global styles

---

## UPLOADTHING PATTERNS

### File Upload Configuration

**Route Handler**:
```typescript
// app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { auth } from '@/auth'

const f = createUploadthing()

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth()
      if (!session?.user) throw new Error('Unauthorized')
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // SECURITY: Validate file on server after upload
      await db.upload.create({
        data: {
          url: file.url,
          userId: metadata.userId,
          size: file.size,
          name: file.name
        }
      })
      return { uploadedBy: metadata.userId }
    })
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
```

**Route Handler Export**:
```typescript
// app/api/uploadthing/route.ts
import { createRouteHandler } from 'uploadthing/next'
import { ourFileRouter } from './core'

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter
})
```

**Client Component**:
```typescript
// components/FileUploader.tsx
'use client'
import { UploadButton } from '@uploadthing/react'
import type { OurFileRouter } from '@/app/api/uploadthing/core'

export function FileUploader() {
  return (
    <UploadButton<OurFileRouter>
      endpoint="imageUploader"
      onClientUploadComplete={(res) => {
        console.log('Files: ', res)
      }}
      onUploadError={(error: Error) => {
        alert(`ERROR! ${error.message}`)
      }}
    />
  )
}
```

---

## RAZORPAY INTEGRATION PATTERNS

### Payment Flow [HIGH confidence]

**Server Action for Order Creation**:
```typescript
// app/checkout/actions.ts
'use server'
import Razorpay from 'razorpay'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!
})

const createOrderSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default('INR')
})

export async function createOrder(raw: unknown) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const { amount, currency } = createOrderSchema.parse(raw)

  const order = await razorpay.orders.create({
    amount: amount * 100, // Razorpay uses paise
    currency,
    receipt: `order_${Date.now()}`
  })

  // Store order in DB
  await db.order.create({
    data: {
      razorpayOrderId: order.id,
      amount,
      currency,
      userId: session.user.id,
      status: 'PENDING'
    }
  })

  return order
}
```

**Payment Verification**:
```typescript
// app/api/payment/verify/route.ts
import { db } from '@/lib/db'
import crypto from 'crypto'

export async function POST(request: Request) {
  const body = await request.json()

  const signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${body.razorpay_order_id}|${body.razorpay_payment_id}`)
    .digest('hex')

  if (signature !== body.razorpay_signature) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Update order status
  await db.order.update({
    where: { razorpayOrderId: body.razorpay_order_id },
    data: {
      razorpayPaymentId: body.razorpay_payment_id,
      status: 'COMPLETED'
    }
  })

  return Response.json({ success: true })
}
```

---

## NEXT-INTL PATTERNS

### i18n Configuration [HIGH confidence]

**Middleware**:
```typescript
// middleware.ts
import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  locales: ['en', 'hi', 'pa'], // Add your locales
  defaultLocale: 'en',
  localePrefix: 'as-needed' // Only add prefix for non-default
})

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}
```

**Layout with i18n**:
```typescript
// app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

**Usage in Server Components**:
```typescript
// app/[locale]/page.tsx
import { useTranslations } from 'next-intl'

export default function HomePage() {
  const t = useTranslations('HomePage')

  return <h1>{t('title')}</h1>
}
```

**Messages Structure**:
```json
// messages/en.json
{
  "HomePage": {
    "title": "Welcome to our app"
  },
  "Common": {
    "save": "Save",
    "cancel": "Cancel"
  }
}
```

---

## TIPTAP RICH TEXT EDITOR PATTERNS

### Editor Setup [MED confidence - depends on requirements]

**Editor Component**:
```typescript
// components/RichTextEditor.tsx
'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start writing...'
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder })
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    }
  })

  if (!editor) return null

  return (
    <div className="border rounded-lg">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} className="prose max-w-none p-4" />
    </div>
  )
}

function EditorToolbar({ editor }: { editor: any }) {
  return (
    <div className="flex gap-2 p-2 border-b">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'bg-gray-200' : ''}
      >
        Bold
      </button>
      {/* Add more toolbar buttons */}
    </div>
  )
}
```

**Integration with Forms**:
```typescript
// app/posts/components/PostForm.tsx
'use client'
import { useState } from 'react'
import { RichTextEditor } from '@/components/RichTextEditor'
import { createPost } from '../actions'

export function PostForm() {
  const [content, setContent] = useState('')

  async function handleSubmit(formData: FormData) {
    formData.set('content', content) // Add rich text content
    await createPost(formData)
  }

  return (
    <form action={handleSubmit}>
      <input name="title" placeholder="Title" required />
      <RichTextEditor content={content} onChange={setContent} />
      <button type="submit">Publish</button>
    </form>
  )
}
```

---

## TESTING PATTERNS

### Jest Configuration

**Unit Tests with Testing Library**:
```typescript
// components/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react'
import { Button } from '../Button'

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    screen.getByRole('button').click()
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

**Testing Server Actions**:
```typescript
// app/users/__tests__/actions.test.ts
import { createUser } from '../actions'
import { db } from '@/lib/db'

jest.mock('@/lib/db', () => ({
  db: {
    user: {
      create: jest.fn()
    }
  }
}))

describe('createUser', () => {
  it('creates user with valid data', async () => {
    const formData = new FormData()
    formData.set('email', 'test@example.com')
    formData.set('name', 'Test User')

    await createUser(formData)

    expect(db.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: 'test@example.com',
        name: 'Test User'
      })
    })
  })

  it('throws on invalid data', async () => {
    const formData = new FormData()
    formData.set('email', 'invalid')

    await expect(createUser(formData)).rejects.toThrow()
  })
})
```

### Playwright E2E Tests

**Basic E2E Pattern**:
```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('user can sign in', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('text=Welcome')).toBeVisible()
  })
})
```

---

## ENV CONFIGURATION

### Type-Safe Environment Variables

**env.mjs** (already in your dependencies):
```typescript
// env.mjs
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(32),
    NEXTAUTH_URL: z.string().url(),
    RAZORPAY_KEY_ID: z.string(),
    RAZORPAY_KEY_SECRET: z.string(),
    UPLOADTHING_SECRET: z.string(),
    UPLOADTHING_APP_ID: z.string(),
    SMTP_HOST: z.string(),
    SMTP_PORT: z.string(),
    SMTP_USER: z.string(),
    SMTP_PASS: z.string()
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string()
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    UPLOADTHING_SECRET: process.env.UPLOADTHING_SECRET,
    UPLOADTHING_APP_ID: process.env.UPLOADTHING_APP_ID,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
  }
})
```

**Usage**:
```typescript
import { env } from './env.mjs'

// Type-safe, validated at build time
const dbUrl = env.DATABASE_URL
```

---

## EMAIL PATTERNS (NODEMAILER)

### Transactional Email Setup

**Email Utility**:
```typescript
// lib/email.ts
import nodemailer from 'nodemailer'
import { env } from '../env.mjs'

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: parseInt(env.SMTP_PORT),
  secure: env.SMTP_PORT === '465',
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS
  }
})

export async function sendEmail({
  to,
  subject,
  html
}: {
  to: string
  subject: string
  html: string
}) {
  // IMPORTANT: Rate limit email sends
  await transporter.sendMail({
    from: env.SMTP_USER,
    to,
    subject,
    html
  })
}
```

**Usage in Server Action**:
```typescript
'use server'
import { sendEmail } from '@/lib/email'
import { auth } from '@/auth'

export async function sendWelcomeEmail() {
  const session = await auth()
  if (!session?.user?.email) throw new Error('Unauthorized')

  await sendEmail({
    to: session.user.email,
    subject: 'Welcome!',
    html: '<h1>Welcome to our platform</h1>'
  })
}
```

---

## PERFORMANCE PATTERNS

### Caching Strategies

**LRU Cache for Expensive Operations**:
```typescript
// lib/cache.ts
import { LRUCache } from 'lru-cache'

const cache = new LRUCache<string, any>({
  max: 500,
  ttl: 1000 * 60 * 5 // 5 minutes
})

export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = cache.get(key)
  if (cached !== undefined) return cached

  const data = await fetcher()
  cache.set(key, data)
  return data
}
```

**Usage**:
```typescript
import { getCachedData } from '@/lib/cache'
import { db } from '@/lib/db'

export async function getPopularPosts() {
  return getCachedData('popular-posts', async () => {
    return await db.post.findMany({
      where: { published: true },
      orderBy: { views: 'desc' },
      take: 10
    })
  })
}
```

**Route-Level Caching**:
```typescript
// app/blog/page.tsx
export const revalidate = 3600 // 1 hour ISR

export default async function BlogPage() {
  const posts = await db.post.findMany()
  return <PostList posts={posts} />
}
```

---

## COMMON ANTI-PATTERNS TO AVOID

### ❌ NEXTAUTH V5 MISTAKES

```typescript
// ❌ WRONG - v4 pattern
import { getServerSession } from 'next-auth'

// ✅ CORRECT - v5 pattern
import { auth } from '@/auth'
const session = await auth()
```

### ❌ PRISMA MISTAKES

```typescript
// ❌ WRONG - N+1 query
const users = await db.user.findMany()
for (const user of users) {
  user.posts = await db.post.findMany({ where: { userId: user.id } })
}

// ✅ CORRECT - Include relation
const users = await db.user.findMany({
  include: { posts: true }
})
```

### ❌ TAILWIND 4 MISTAKES

```typescript
// ❌ WRONG - Trying to use @apply
<div className="custom-class" /> // Needs @apply definition

// ✅ CORRECT - Direct utilities
<div className="flex items-center px-4 py-2 bg-white rounded-lg" />
```

### ❌ VALIDATION MISTAKES

```typescript
// ❌ WRONG - Trusting input types
'use server'
export async function createUser(data: CreateUserInput) {
  return db.user.create({ data })
}

// ✅ CORRECT - Validate with Zod
'use server'
export async function createUser(raw: unknown) {
  const data = createUserSchema.parse(raw) // Runtime validation
  return db.user.create({ data })
}
```

---

## STACK-SPECIFIC CHECKLIST

Before suggesting any change, verify:

- [ ] Using Prisma client from singleton (`@/lib/db`)
- [ ] NextAuth v5 patterns (NOT v4)
- [ ] Zod validation at all boundaries
- [ ] Tailwind 4 utilities (no @apply)
- [ ] Named exports only
- [ ] Server/Client boundaries correct
- [ ] No N+1 queries
- [ ] Types explicit on all functions
- [ ] Error handling present
- [ ] Cache directives set
- [ ] Rule of three followed
- [ ] Comments for AI context

---

## QUICK REFERENCE

### Import Patterns
```typescript
// Database
import { db } from '@/lib/db'

// Auth
import { auth, signIn, signOut } from '@/auth'

// Validation
import { z } from 'zod'

// Env
import { env } from '@/env.mjs'

// Email
import { sendEmail } from '@/lib/email'

// Cache
import { getCachedData } from '@/lib/cache'
```

### File Structure
```
/app
  /[locale]           # next-intl routes
    /dashboard
      /components     # Feature components
      actions.ts      # Server Actions
      schema.ts       # Zod schemas
      page.tsx        # Route
/lib
  db.ts              # Prisma singleton
  email.ts           # Email utility
  cache.ts           # LRU cache
/auth.ts             # NextAuth config
/env.mjs             # Environment validation
/middleware.ts       # Auth + i18n middleware
```

---

## CONFIDENCE LEVELS

When suggesting changes, indicate confidence:

**[HIGH CONFIDENCE]** - Standard patterns, type safety, validation
**[MEDIUM CONFIDENCE]** - Architecture decisions, performance tradeoffs
**[LOW CONFIDENCE]** - Edge cases, unusual requirements

If confidence is MEDIUM or LOW, explain the uncertainty and alternative approaches.
