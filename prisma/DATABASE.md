# 🗄️ Database Architecture & Guide

A comprehensive guide to the Coaching Center OS database schema, design decisions, and operational procedures.

---

## 📖 Table of Contents

- [Quick Start Commands](#-quick-start-commands)
- [Connection Configuration](#-connection-configuration)
- [Schema Overview](#-schema-overview)
- [Domain Models](#-domain-models)
- [Entity Relationship Diagrams](#-entity-relationship-diagrams)
- [Design Decisions & Rationale](#-design-decisions--rationale)
- [Common Patterns](#-common-patterns)
- [Query Optimization](#-query-optimization)
- [Data Integrity & Constraints](#-data-integrity--constraints)
- [Migration Guide](#-migration-guide)
- [Backup & Recovery](#-backup--recovery)
- [Troubleshooting](#-troubleshooting)
- [Production Considerations](#-production-considerations)

---

## 🚀 Quick Start Commands

### Docker Database

```bash
# Start PostgreSQL container
docker compose up -d db

# Verify container is running
docker ps | grep future-ready-db

# View database logs
docker logs -f future-ready-db

# Connect to PostgreSQL CLI
docker exec -it future-ready-db psql -U postgres -d tutoring

# Stop container
docker compose down

# Stop and delete all data (DANGEROUS)
docker compose down -v
```

### Prisma Commands

```bash
# Generate Prisma Client (run after schema changes)
npx prisma generate

# Push schema to database (development - no migration history)
npx prisma db push

# Create migration (preserves history for production)
npx prisma migrate dev --name <migration_name>

# Apply migrations in production
npx prisma migrate deploy

# Reset database (DELETES ALL DATA)
npx prisma migrate reset

# Open Prisma Studio (GUI)
npx prisma studio

# Validate schema syntax
npx prisma validate

# Format schema file
npx prisma format

# Seed database with sample data
npx prisma db seed
```

---

## 🔌 Connection Configuration

### Environment Variables

```env
# Local development (app outside Docker, DB in Docker)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tutoring"

# Docker-to-Docker communication
DATABASE_URL="postgresql://postgres:postgres@db:5432/tutoring"

# Production (example with SSL)
DATABASE_URL="postgresql://username:password@host.amazonaws.com:5432/dbname?sslmode=require"
```

### Connection Details

| Property | Development | Production |
|----------|-------------|------------|
| **Host** | `localhost` / `db` | Managed DB host |
| **Port** | `5432` | `5432` |
| **Database** | `tutoring` | `<project_name>` |
| **Username** | `postgres` | Secure username |
| **Password** | `postgres` | Strong password |
| **SSL** | `off` | `require` |
| **Pooling** | Direct | PgBouncer recommended |

> ⚠️ **Important**: Never use default credentials in production!

---

## 📊 Schema Overview

The database consists of **35+ models** organized into **8 domains**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        COACHING CENTER OS DATABASE                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │  USER MANAGEMENT │  │  COURSE MANAGEMENT│  │ BATCH & ENROLLMENT│     │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤      │
│  │ User             │  │ Roadmap          │  │ Batch            │      │
│  │ Role             │  │ Course           │  │ Enrollment       │      │
│  │ Permission       │  │ Curriculum       │  │ Attendance       │      │
│  │ StudentProfile   │  │ Module           │  │ LessonProgress   │      │
│  │ TeacherProfile   │  │ Lesson           │  │ Event            │      │
│  │ StaffProfile     │  │ LessonResource   │  └──────────────────┘      │
│  │ PasswordResetToken│ │ Assignment       │                             │
│  └──────────────────┘  │ Submission       │  ┌──────────────────┐      │
│                        └──────────────────┘  │    ASSESSMENT     │      │
│  ┌──────────────────┐                        ├──────────────────┤      │
│  │    FINANCIAL     │  ┌──────────────────┐  │ Quiz             │      │
│  ├──────────────────┤  │    MARKETING     │  │ Question         │      │
│  │ Salary           │  ├──────────────────┤  │ QuestionOption   │      │
│  │ SalaryReceipt    │  │ Lead             │  │ QuizAttempt      │      │
│  │ PaymentReceipts  │  │ LeadActivity     │  │ QuestionResponse │      │
│  │ Expense          │  │ Campaign         │  └──────────────────┘      │
│  └──────────────────┘  └──────────────────┘                             │
│                                                                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │  COMMUNICATION   │  │     SYSTEM       │  │    RESOURCES     │      │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤      │
│  │ Announcement     │  │ AuditLog         │  │ Resource         │      │
│  │ Query            │  │ Setting          │  │ LessonHighlight  │      │
│  │ Notification     │  │ Branch           │  │ LessonBookmark   │      │
│  │ Leave            │  │ Todo             │  └──────────────────┘      │
│  └──────────────────┘  └──────────────────┘                             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Model Count by Domain

| Domain | Models | Purpose |
|--------|--------|---------|
| **User Management** | 7 | Authentication, profiles, roles |
| **Course Management** | 7 | Curriculum structure, content |
| **Batch & Enrollment** | 5 | Cohort management, progress |
| **Assessment** | 5 | Quizzes, grading |
| **Financial** | 4 | Payments, salaries, expenses |
| **Marketing** | 3 | Leads, campaigns |
| **Communication** | 4 | Announcements, support |
| **System** | 5 | Audit, settings, resources |

---

## 📚 Domain Models

### 1. User Management

```
┌─────────────────────────────────────────────────────────────────┐
│                           User                                   │
├─────────────────────────────────────────────────────────────────┤
│ id, email, phone, password, name, avatar                        │
│ roleId → Role, branchId → Branch                                │
│ isActive, isVerified, isDeleted, lastLoginAt                    │
├─────────────────────────────────────────────────────────────────┤
│                    ┌─────────┬─────────┬─────────┐              │
│                    ▼         ▼         ▼         │              │
│            StudentProfile  TeacherProfile  StaffProfile         │
│            (one-to-one)    (one-to-one)   (one-to-one)         │
└─────────────────────────────────────────────────────────────────┘
```

#### User Model

| Field | Type | Description |
|-------|------|-------------|
| `id` | cuid | Primary key |
| `email` | String | Unique, used for login |
| `phone` | String? | Optional, for SMS/WhatsApp |
| `password` | String | bcrypt hashed |
| `name` | String | Display name |
| `avatar` | String? | Profile picture URL |
| `roleId` | String? | Foreign key to Role |
| `branchId` | String? | Foreign key to Branch |
| `isActive` | Boolean | Can log in |
| `isVerified` | Boolean | Email/phone verified |
| `isDeleted` | Boolean | Soft delete flag |
| `lastLoginAt` | DateTime? | Security tracking |

#### Role Model (Dynamic RBAC)

| Field | Type | Description |
|-------|------|-------------|
| `id` | cuid | Primary key |
| `name` | String | Unique: DIRECTOR, ADMIN, TEACHER, etc. |
| `description` | String? | Human-readable description |
| `isSystem` | Boolean | Protected from deletion |
| `permissions` | Permission[] | Many-to-many |

#### Default Roles

| Role | Access Level | Description |
|------|--------------|-------------|
| `DIRECTOR` | Full | Strategic oversight, all permissions |
| `GENERAL_MANAGER` | Full | Operational management |
| `ADMIN` | High | System administration |
| `HR_MANAGER` | Scoped | Staff management, leaves |
| `PAYROLL_MANAGER` | Scoped | Salary, payments |
| `BUSINESS_ANALYST` | Read | Reports, analytics |
| `DIGITAL_MARKETING` | Scoped | Leads, campaigns |
| `TEACHER` | Scoped | Course delivery, attendance |
| `BACKOFFICE` | Scoped | Daily operations |
| `STUDENT` | Limited | Learning access only |

#### Profile Models

Each user type has a dedicated profile for role-specific data:

**StudentProfile**
- `enrollmentDate`: When first enrolled
- `batchId`: Current primary batch
- `discount`: Fee concession amount
- `enrollments[]`: All course enrollments

**TeacherProfile**
- `domain`: Teaching specialty (e.g., "Web Development")
- `bio`: Short biography
- `qualification`: Degrees, certifications
- `bankDetails`: JSON for payment info
- `courses[]`: Assigned courses
- `curriculums[]`: Custom curriculum versions

**StaffProfile**
- `department`: HR, Finance, Marketing, etc.
- `designation`: Job title
- `bankDetails`: JSON for payment info
- `reportingTo`: Manager's userId
- `salaries[]`: Salary configurations

---

### 2. Course Management

```
Roadmap (Learning Path)
    │
    └── Course
            │
            └── Curriculum (Versioned)
                    │
                    ├── Module
                    │       │
                    │       └── Lesson
                    │              │
                    │              ├── LessonResource
                    │              ├── LessonProgress
                    │              ├── LessonHighlight
                    │              └── LessonBookmark
                    │
                    ├── Assignment
                    │       └── Submission
                    │
                    ├── Quiz
                    │       ├── Question
                    │       │       └── QuestionOption
                    │       └── QuizAttempt
                    │               └── QuestionResponse
                    │
                    └── Resource (Shared library)
```

#### Course Model

| Field | Type | Description |
|-------|------|-------------|
| `id` | cuid | Primary key |
| `title` | String | Course name |
| `slug` | String | URL-friendly, unique |
| `description` | String? | Full description |
| `price` | Decimal | Course fee (INR) |
| `level` | Enum | BEGINNER, INTERMEDIATE, ADVANCED |
| `duration` | Int? | Hours |
| `thumbnailUrl` | String? | Cover image |
| `isActive` | Boolean | Visible to students |
| `isFeatured` | Boolean | Show on homepage |
| `whatYouWillLearn` | Json? | Array of learning outcomes |
| `features` | Json? | Array of features |

#### Curriculum Model (Versioning System)

> **Key Design**: Each course can have multiple curriculum versions:
> - **Director's Version**: `teacherId = null`, the official curriculum
> - **Teacher's Version**: `teacherId = <id>`, teacher-customized

| Field | Type | Description |
|-------|------|-------------|
| `courseId` | String | Parent course |
| `teacherId` | String? | Null = official, Set = teacher version |
| `status` | String | DRAFT, PENDING_APPROVAL, APPROVED, REJECTED |
| `versionName` | String? | Optional label |

```sql
-- Unique constraint ensures one version per teacher per course
@@unique([courseId, teacherId])
```

#### Module & Lesson

| Module Fields | Lesson Fields |
|---------------|---------------|
| `title` | `title` |
| `order` | `order` |
| `curriculumId` | `moduleId` |
| `isActive` | `contentUrl` (MDX/MD file) |
| `richTextContent` | `richTextContent` (Tiptap HTML) |
| | `videoUrl` |
| | `weightage` (progress calculation) |

---

### 3. Batch & Enrollment

```
Course
    │
    └── Batch (Cohort)
            │
            ├── Student[] (via StudentProfile.batchId)
            ├── Enrollment[] (many-to-many with students)
            ├── Event[] (calendar events)
            └── Teacher (TeacherProfile)
                    │
                    └── Attendance[] (per lesson)
```

#### Batch Model (Cohort)

| Field | Type | Description |
|-------|------|-------------|
| `name` | String | "Web Dev Jan 2024" |
| `startDate` | DateTime | Batch start |
| `endDate` | DateTime? | Optional end |
| `maxStudents` | Int | Capacity (default: 30) |
| `schedule` | Json? | Weekly schedule |
| `courseId` | String | Associated course |
| `teacherId` | String? | Assigned teacher |
| `branchId` | String? | Physical location |

**Financial Fields**:
| Field | Type | Description |
|-------|------|-------------|
| `fee` | Decimal | Course fee for batch |
| `feeFrequency` | Enum | ONE_TIME, MONTHLY |
| `teacherCompensation` | Decimal | Fixed monthly pay |
| `teacherCommission` | Decimal | Per-student bonus |
| `monthlyOverHeadCost` | Decimal | Operational costs |

#### Enrollment Model

Tracks student-course relationships:

| Field | Type | Description |
|-------|------|-------------|
| `studentProfileId` | String | Student reference |
| `courseId` | String | Course reference |
| `batchId` | String? | Assigned batch |
| `status` | Enum | ACTIVE, COMPLETED, DROPPED, ON_HOLD |
| `enrolledAt` | DateTime | Enrollment date |
| `completedAt` | DateTime? | Completion date |
| `certificateUrl` | String? | Generated certificate |
| `discount` | Decimal? | Fee discount |
| `discountType` | String? | PERCENTAGE or FIXED |

```sql
-- One enrollment per student per course
@@unique([studentProfileId, courseId])
```

#### Attendance Model

| Field | Type | Description |
|-------|------|-------------|
| `date` | DateTime | Attendance date |
| `status` | Enum | PRESENT, ABSENT, LATE, EXCUSED |
| `userId` | String | Student |
| `lessonId` | String? | Associated lesson |
| `markedById` | String? | Teacher who marked |
| `notes` | String? | Reason for absence |

```sql
-- One record per student per lesson per day
@@unique([userId, lessonId, date])
```

---

### 4. Assessment (Quiz System)

```
Quiz
  │
  ├── Question
  │     ├── type: MULTIPLE_CHOICE | MULTIPLE_SELECT | TRUE_FALSE | SHORT_ANSWER
  │     ├── points
  │     └── QuestionOption[] (for MCQ types)
  │
  └── QuizAttempt (per student)
        └── QuestionResponse[] (per question)
```

#### Quiz Model

| Field | Type | Description |
|-------|------|-------------|
| `curriculumId` | String | Parent curriculum |
| `lessonId` | String? | Associated lesson (optional) |
| `moduleId` | String? | Associated module (optional) |
| `duration` | Int? | Minutes (null = unlimited) |
| `passingScore` | Int | Percentage (default: 70) |

#### Question Types

| Type | Description | Grading |
|------|-------------|---------|
| `MULTIPLE_CHOICE` | Single correct answer | Automatic |
| `MULTIPLE_SELECT` | Multiple correct answers | Automatic |
| `TRUE_FALSE` | Binary choice | Automatic |
| `SHORT_ANSWER` | Text response | Manual |

#### QuizAttempt Model

| Field | Type | Description |
|-------|------|-------------|
| `quizId` | String | Quiz reference |
| `userId` | String | Student |
| `startedAt` | DateTime | When started |
| `submittedAt` | DateTime? | When submitted |
| `score` | Int? | Calculated 0-100 |
| `passed` | Boolean? | Met passing score |

---

### 5. Financial Management

```
┌─────────────────────────────────────────────────────────────────┐
│                      FINANCIAL FLOW                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  INCOMING                           OUTGOING                     │
│  ────────                           ────────                     │
│  PaymentReceipts ─────────┐   ┌───── Salary                     │
│  (Student fees)           │   │      (Teacher/Staff config)     │
│                           ▼   ▼                                  │
│                      ┌─────────┐                                 │
│                      │ FINANCE │───────▶ SalaryReceipt          │
│                      │ REPORTS │         (Salary payments)       │
│                      └─────────┘                                 │
│                           │                                      │
│                           └─────────▶ Expense                   │
│                                      (Operational costs)         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### PaymentReceipts (Student Fees)

| Field | Type | Description |
|-------|------|-------------|
| `userId` | String | Student |
| `courseId` | String? | Associated course |
| `amountPaid` | Decimal | Payment amount (INR) |
| `expectedAmount` | Decimal | Total fee |
| `pendingAmount` | Decimal | Remaining balance |
| `paymentDate` | DateTime | Payment date |
| `nextDueDate` | DateTime? | Next installment |
| `paymentMethod` | Enum | CASH, BANK_TRANSFER, UPI, CARD, CHEQUE |
| `reference` | String? | Transaction ID |
| `branchId` | String? | Payment location |

#### Salary Model (Configuration)

| Field | Type | Description |
|-------|------|-------------|
| `teacherProfileId` | String? | For teachers |
| `staffProfileId` | String? | For staff |
| `baseSalary` | Decimal | Monthly base |
| `allowances` | Decimal | Additional pay |
| `deductions` | Decimal | Fixed deductions |
| `effectiveFrom` | DateTime | Start date |
| `effectiveTo` | DateTime? | End date (null = current) |
| `isActive` | Boolean | Currently applicable |

#### Expense Model (Bookkeeping)

| Field | Type | Description |
|-------|------|-------------|
| `title` | String | Expense name |
| `amount` | Decimal | Amount (INR) |
| `category` | String | OPERATIONAL, RENT, UTILITIES, etc. |
| `date` | DateTime | Expense date |
| `branchId` | String? | Branch location |

---

### 6. Marketing & Leads

```
Lead ────────────────▶ LeadActivity[]
 │                     (CALL, EMAIL, MEETING, NOTE)
 │
 ├── status: NEW → CONTACTED → QUALIFIED → NEGOTIATION → CONVERTED/LOST
 │
 └── source: WEBSITE | FACEBOOK | INSTAGRAM | GOOGLE | REFERRAL | WALK_IN

Campaign
 │
 ├── type: EMAIL | SMS | SOCIAL | GOOGLE_ADS | FACEBOOK_ADS
 └── status: DRAFT → SCHEDULED → ACTIVE → PAUSED → COMPLETED
```

#### Lead Model

| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Prospect name |
| `phone` | String | Contact number |
| `email` | String? | Email address |
| `status` | Enum | Pipeline stage |
| `source` | Enum | How they found us |
| `courseInterest` | String? | Interested course |
| `assignedTo` | String? | Sales rep userId |
| `followUpAt` | DateTime? | Next follow-up |
| `convertedAt` | DateTime? | Conversion date |
| `branchId` | String? | Branch location |

#### Campaign Model

| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Campaign name |
| `type` | String | Channel type |
| `status` | Enum | Campaign status |
| `budget` | Decimal? | Allocated budget |
| `startDate` | DateTime? | Launch date |
| `endDate` | DateTime? | End date |
| `targetAudience` | Json? | Audience criteria |
| `metrics` | Json? | Performance data |

---

### 7. Communication & Support

#### Announcement Model

| Field | Type | Description |
|-------|------|-------------|
| `title` | String | Announcement title |
| `content` | String | Full content |
| `type` | String | ANNOUNCEMENT, NOTICE, ALERT |
| `effect` | String | ALL, STUDENTS, TEACHERS, SPECIFIC_COURSE |
| `courseId` | String? | For course-specific |
| `authorId` | String | Who posted |
| `expiresAt` | DateTime? | Auto-hide date |

#### Query Model (Support Tickets)

| Field | Type | Description |
|-------|------|-------------|
| `subject` | String | Ticket subject |
| `message` | String | Student message |
| `status` | Enum | OPEN, IN_PROGRESS, RESOLVED, CLOSED |
| `priority` | Enum | LOW, NORMAL, HIGH, URGENT |
| `studentId` | String | Student who asked |
| `resolvedById` | String? | Staff who resolved |
| `response` | String? | Staff response |

#### Notification Model

| Field | Type | Description |
|-------|------|-------------|
| `userId` | String | Recipient |
| `title` | String | Notification title |
| `message` | String | Content |
| `type` | Enum | INFO, SUCCESS, WARNING, ERROR, REMINDER |
| `isRead` | Boolean | Read status |
| `link` | String? | Action URL |

---

### 8. System & Administration

#### AuditLog Model

| Field | Type | Description |
|-------|------|-------------|
| `userId` | String | Who performed action |
| `action` | String | CREATE, UPDATE, DELETE, LOGIN, LOGOUT |
| `entity` | String | Model name |
| `entityId` | String? | Record ID |
| `oldValue` | Json? | Previous state |
| `newValue` | Json? | New state |
| `ipAddress` | String? | Client IP |
| `userAgent` | String? | Browser info |

#### Setting Model (Key-Value Store)

| Field | Type | Description |
|-------|------|-------------|
| `key` | String | Unique identifier (e.g., "site.name") |
| `value` | Json | Any JSON value |
| `category` | String | general, email, payment, etc. |

---

## 📐 Entity Relationship Diagrams

### User Domain

```
                    ┌─────────────┐
                    │    Role     │
                    ├─────────────┤
                    │ id          │
                    │ name        │◀────┐
                    │ permissions │     │ many-to-many
                    └─────────────┘     │
                          ▲             │
                          │1            │
                          │             │
                    ┌─────┴─────┐ ┌─────┴──────┐
                    │   User    │ │ Permission │
                    ├───────────┤ ├────────────┤
                    │ id        │ │ action     │
                    │ email     │ │ subject    │
                    │ roleId ───┘ └────────────┘
                    │ branchId ─────────────────────┐
                    └───────────┘                   │
                          │                         ▼
          ┌───────────────┼───────────────┐   ┌─────────┐
          │               │               │   │ Branch  │
          ▼ 0..1          ▼ 0..1          ▼   └─────────┘
    ┌───────────┐   ┌───────────┐   ┌───────────┐
    │ Student   │   │ Teacher   │   │ Staff     │
    │ Profile   │   │ Profile   │   │ Profile   │
    └───────────┘   └───────────┘   └───────────┘
```

### Course Domain

```
┌─────────────┐
│   Roadmap   │───── many-to-many ─────┐
└─────────────┘                        │
                                       ▼
                                ┌─────────────┐
                                │   Course    │
                                └──────┬──────┘
                                       │ 1
                                       │
                                       ▼ ∞
                                ┌─────────────┐
                                │ Curriculum  │────▶ TeacherProfile (optional)
                                └──────┬──────┘
                                       │ 1
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼ ∞                ▼ ∞                ▼ ∞
             ┌──────────┐       ┌──────────────┐    ┌──────────┐
             │  Module  │       │  Assignment  │    │   Quiz   │
             └────┬─────┘       └──────────────┘    └────┬─────┘
                  │ 1                                     │ 1
                  ▼ ∞                                     ▼ ∞
             ┌──────────┐                           ┌──────────┐
             │  Lesson  │                           │ Question │
             └──────────┘                           └────┬─────┘
                                                         │ 1
                                                         ▼ ∞
                                                    ┌──────────────┐
                                                    │QuestionOption│
                                                    └──────────────┘
```

---

## 🎯 Design Decisions & Rationale

### 1. Dynamic Roles Instead of Enum

**Decision**: Use a `Role` model with `Permission` many-to-many instead of a hardcoded enum.

**Rationale**:
- ✅ Add/modify roles without schema migration
- ✅ Granular permission control per role
- ✅ UI for role management possible
- ✅ Audit trail for permission changes
- ⚠️ Slightly more complex queries

**Implementation**:
```typescript
// Check permission
const hasAccess = await db.permission.findFirst({
  where: {
    action: 'manage',
    subject: 'finance',
    roles: { some: { id: user.roleId } }
  }
})
```

### 2. Curriculum Versioning System

**Decision**: Separate `Curriculum` model that can be teacher-specific.

**Rationale**:
- ✅ Directors set official curriculum
- ✅ Teachers can customize for their batches
- ✅ Approval workflow for customizations
- ✅ Students see teacher's version if approved, else default
- ⚠️ Complex "effective curriculum" logic

**Query Pattern**:
```typescript
// Get effective curriculum for student
const curriculum = await db.curriculum.findFirst({
  where: {
    courseId,
    OR: [
      { teacherId: batchTeacherId, status: 'APPROVED' },
      { teacherId: null } // Fallback to director's version
    ]
  },
  orderBy: { teacherId: 'desc' } // Prefer teacher's version
})
```

### 3. Profile Separation Pattern

**Decision**: Separate `StudentProfile`, `TeacherProfile`, `StaffProfile` instead of nullable fields on User.

**Rationale**:
- ✅ Clean separation of concerns
- ✅ Type-safe profile-specific data
- ✅ No wasted nullable columns
- ✅ Easy to extend profile fields
- ⚠️ Extra join for profile access

### 4. JSON for Flexible Data

**Decision**: Use `Json` type for schedule, bankDetails, whatYouWillLearn, etc.

**Rationale**:
- ✅ Schema-less flexibility
- ✅ No migrations for structure changes
- ✅ Works well for display-only data
- ⚠️ No database-level validation
- ⚠️ Zod validation required at app level

**Examples**:
```typescript
// Batch schedule
schedule: {
  "mon": "10:00-12:00",
  "wed": "10:00-12:00",
  "fri": "14:00-16:00"
}

// Bank details
bankDetails: {
  "bankName": "HDFC Bank",
  "accountNumber": "1234567890",
  "ifsc": "HDFC0001234",
  "accountType": "savings"
}
```

### 5. Soft Delete Pattern

**Decision**: Use `isDeleted` boolean instead of actual deletion.

**Rationale**:
- ✅ Recoverable data
- ✅ Audit trail preserved
- ✅ Foreign key integrity maintained
- ⚠️ Must filter in all queries
- ⚠️ Database grows over time

**Query Pattern**:
```typescript
// Always filter soft deletes
const users = await db.user.findMany({
  where: { isDeleted: false }
})
```

### 6. CUID for Primary Keys

**Decision**: Use `cuid()` instead of auto-increment integers.

**Rationale**:
- ✅ Database-agnostic
- ✅ No ID collisions across environments
- ✅ Can be generated client-side
- ✅ Non-sequential (security)
- ⚠️ Larger storage than integers
- ⚠️ Less human-readable

---

## 🔧 Common Patterns

### Prisma Singleton

```typescript
// src/lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error']
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}
```

### N+1 Prevention

```typescript
// ❌ N+1 Problem
const users = await db.user.findMany()
for (const user of users) {
  const profile = await db.studentProfile.findUnique({
    where: { userId: user.id }
  })
}

// ✅ Single Query
const users = await db.user.findMany({
  include: { studentProfile: true }
})
```

### Pagination

```typescript
async function getUsers(page: number = 1, pageSize: number = 20) {
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
    data: users,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  }
}
```

### Transactions

```typescript
// Atomic enrollment creation
const result = await db.$transaction(async (tx) => {
  const enrollment = await tx.enrollment.create({
    data: { studentProfileId, courseId, batchId }
  })

  await tx.notification.create({
    data: {
      userId: studentProfile.userId,
      title: 'Enrollment Confirmed',
      message: `You are now enrolled in ${course.title}`
    }
  })

  await tx.auditLog.create({
    data: {
      userId: adminId,
      action: 'CREATE',
      entity: 'Enrollment',
      entityId: enrollment.id
    }
  })

  return enrollment
})
```

---

## ⚡ Query Optimization

### Index Usage

The schema includes strategic indexes:

```prisma
// User lookups
@@index([email])
@@index([roleId])
@@index([isActive, isDeleted])

// Attendance queries
@@index([userId])
@@index([lessonId])
@@index([date])

// Financial reports
@@index([paymentDate])
@@index([branchId])
```

### Common Query Patterns

```typescript
// Active users by role
await db.user.findMany({
  where: {
    isActive: true,
    isDeleted: false,
    role: { name: 'TEACHER' }
  }
})

// Batch with all relations
await db.batch.findUnique({
  where: { id },
  include: {
    course: true,
    teacher: { include: { user: true } },
    students: { include: { user: true } },
    enrollments: true
  }
})

// Date range queries
await db.attendance.findMany({
  where: {
    date: {
      gte: startOfMonth,
      lte: endOfMonth
    }
  }
})
```

---

## 🔒 Data Integrity & Constraints

### Unique Constraints

| Model | Constraint | Purpose |
|-------|-----------|---------|
| User | `email` | One account per email |
| Role | `name` | No duplicate role names |
| Permission | `[action, subject]` | No duplicate permissions |
| Course | `slug` | Unique URLs |
| Curriculum | `[courseId, teacherId]` | One version per teacher |
| Enrollment | `[studentProfileId, courseId]` | One enrollment per course |
| Attendance | `[userId, lessonId, date]` | One record per day |
| LessonProgress | `[lessonId, userId]` | One progress per lesson |

### Cascade Deletes

| Parent | Child | On Delete |
|--------|-------|-----------|
| User | StudentProfile | Cascade |
| User | TeacherProfile | Cascade |
| User | StaffProfile | Cascade |
| Curriculum | Module | Cascade |
| Module | Lesson | Cascade |
| Quiz | Question | Cascade |
| Question | QuestionOption | Cascade |

### Safe Relations (No Cascade)

| Parent | Child | Reason |
|--------|-------|--------|
| Course | Enrollment | Preserve enrollment history |
| User | AuditLog | Preserve audit trail |
| User | Announcement | Preserve content |

---

## 📦 Migration Guide

### Creating Migrations

```bash
# Development - Create named migration
npx prisma migrate dev --name add_user_phone_field

# Preview SQL without applying
npx prisma migrate dev --create-only
```

### Production Deployment

```bash
# Apply pending migrations
npx prisma migrate deploy

# Check migration status
npx prisma migrate status
```

### Handling Breaking Changes

1. **Add new columns as nullable first**
2. **Run data migration to populate**
3. **Then make non-nullable if needed**

```prisma
// Step 1: Add as nullable
model User {
  newField String?
}

// Step 2: After data migration
model User {
  newField String @default("")
}
```

---

## 💾 Backup & Recovery

### Manual Backup

```bash
# Full database dump
docker exec -t future-ready-db pg_dump -U postgres tutoring > backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
docker exec -t future-ready-db pg_dump -U postgres tutoring | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Restore

```bash
# Restore from SQL file
cat backup.sql | docker exec -i future-ready-db psql -U postgres -d tutoring

# Restore from compressed
gunzip -c backup.sql.gz | docker exec -i future-ready-db psql -U postgres -d tutoring
```

### Automated Backups (Cron)

```bash
# Add to crontab: daily backup at 2 AM
0 2 * * * docker exec -t future-ready-db pg_dump -U postgres tutoring | gzip > /backups/tutoring_$(date +\%Y\%m\%d).sql.gz
```

---

## ❌ Troubleshooting

### "Can't reach database server at localhost:5432"

**Cause**: PostgreSQL container not running.

```bash
# Check container status
docker ps | grep future-ready-db

# Start if not running
docker compose up -d db

# Wait for startup
sleep 5 && npx prisma db push
```

### "Unique constraint failed"

**Cause**: Duplicate data violating unique constraint.

```typescript
// Handle gracefully
try {
  await db.user.create({ data })
} catch (error) {
  if (error.code === 'P2002') {
    throw new Error(`${error.meta.target} already exists`)
  }
  throw error
}
```

### "Foreign key constraint failed"

**Cause**: Referencing non-existent record.

```typescript
// Validate before insert
const course = await db.course.findUnique({ where: { id: courseId } })
if (!course) {
  throw new Error('Course not found')
}
```

### "Migration failed"

**Cause**: Schema conflicts or database state mismatch.

```bash
# Check current state
npx prisma migrate status

# Force reset (DEVELOPMENT ONLY - DELETES DATA)
npx prisma migrate reset --force
```

### "Shadow database error"

**Cause**: Prisma needs a shadow database for migrations.

```bash
# Create shadow database
docker exec -it future-ready-db psql -U postgres -c "CREATE DATABASE tutoring_shadow;"
```

---

## 🚀 Production Considerations

### 1. Connection Pooling

Use PgBouncer or Prisma Data Proxy for serverless environments:

```env
# Direct connection
DATABASE_URL="postgresql://..."

# With connection pool
DATABASE_URL="postgresql://...?connection_limit=5"
```

### 2. SSL Configuration

```env
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

### 3. Managed Database Recommendations

| Provider | Best For |
|----------|----------|
| **Supabase** | Quick setup, free tier |
| **Neon** | Serverless, branching |
| **PlanetScale** | Scalability (MySQL) |
| **AWS RDS** | Enterprise, compliance |
| **Railway** | Simple deployment |

### 4. Performance Monitoring

```typescript
// Enable query logging in production
const db = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' }
  ]
})

db.$on('query', (e) => {
  if (e.duration > 1000) {
    console.warn(`Slow query (${e.duration}ms): ${e.query}`)
  }
})
```

### 5. Regular Maintenance

```sql
-- Analyze tables for query optimization
ANALYZE;

-- Vacuum to reclaim storage
VACUUM ANALYZE;
```

---

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Schema Reference](./schema.prisma) - Full schema file
- [Main README](../README.md) - Project overview

---

<p align="center">
  Last updated: January 2026
</p>
