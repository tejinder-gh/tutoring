# 🗄️ Database Setup Guide

This project uses **PostgreSQL 15** as the database, running in Docker.

---

## Quick Start

### 1. Start PostgreSQL

```bash
# Start only the database container
docker-compose up -d db

# Verify it's running
docker ps | grep future-ready-db
```

### 2. Configure Environment

Ensure your `.env` file has the correct `DATABASE_URL`:

```env
# For local development (connecting to Docker container from host)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tutoring"

# For Docker-to-Docker communication (used in docker-compose.yml)
# DATABASE_URL="postgresql://postgres:postgres@db:5432/tutoring"
```

> **⚠️ Important:** When running the Next.js app locally (not in Docker), use `localhost`. When running inside Docker, use `db` as the hostname.

### 3. Run Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed the database (if applicable)
npx prisma db seed
```

---

## Database Connection Details

| Property | Value |
|----------|-------|
| **Host** | `localhost` (from host) / `db` (from Docker) |
| **Port** | `5432` |
| **Database** | `tutoring` |
| **Username** | `postgres` |
| **Password** | `postgres` |
| **Connection String** | `postgresql://postgres:postgres@localhost:5432/tutoring` |

---

## Common Commands

### Docker Commands

```bash
# Start database only
docker-compose up -d db

# Start entire stack (app + database)
docker-compose up -d

# Stop all containers
docker-compose down

# Stop and remove volumes (⚠️ DELETES ALL DATA)
docker-compose down -v

# View database logs
docker logs -f future-ready-db

# Connect to PostgreSQL CLI inside container
docker exec -it future-ready-db psql -U postgres -d tutoring
```

### Prisma Commands

```bash
# Generate Prisma Client after schema changes
npx prisma generate

# Create a new migration
npx prisma migrate dev --name <migration_name>

# Apply migrations to production database
npx prisma migrate deploy

# Reset database (⚠️ DELETES ALL DATA)
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio

# Validate schema
npx prisma validate

# Format schema file
npx prisma format

# Seed database
npx prisma db seed
```

---

## Schema Overview

The database schema supports a complete tutoring center operating system:

### Core Models

```
├── User Management
│   ├── User              # All users (students, teachers, staff)
│   ├── StudentProfile    # Student-specific data
│   ├── TeacherProfile    # Teacher-specific data
│   └── StaffProfile      # HR, Payroll, Marketing, etc.
│
├── Course Management
│   ├── Roadmap           # Learning paths
│   ├── Course            # Individual courses
│   ├── Module            # Course sections
│   ├── Lesson            # Individual lessons
│   ├── LessonResource    # Attachments & resources
│   └── Assignment        # Course assignments
│
├── Enrollment & Attendance
│   ├── Batch             # Student cohorts
│   ├── Enrollment        # Student-Course tracking
│   ├── Attendance        # Lesson attendance
│   └── Submission        # Assignment submissions
│
├── Financial Management
│   ├── PaymentReceipts   # Student fee payments
│   ├── Salary            # Staff salary config
│   └── SalaryReceipt     # Salary payments
│
├── Marketing & Leads
│   ├── Lead              # Prospective students
│   ├── LeadActivity      # Lead interactions
│   └── Campaign          # Marketing campaigns
│
└── System
    ├── Announcement      # System announcements
    ├── Query             # Support tickets
    ├── Notification      # User notifications
    ├── AuditLog          # Action logging
    └── Setting           # System configuration
```

### User Roles

| Role | Description |
|------|-------------|
| `DIRECTOR` | Strategic oversight, full access |
| `GENERAL_MANAGER` | Full operational access |
| `ADMIN` | System administration |
| `HR_MANAGER` | Staff management, HR |
| `PAYROLL_MANAGER` | Salary & payments |
| `BUSINESS_ANALYST` | Reporting & analytics |
| `DIGITAL_MARKETING` | Leads & campaigns |
| `TEACHER` | Course delivery |
| `BACKOFFICE` | Day-to-day operations |
| `STUDENT` | Learning access |

---

## Troubleshooting

### ❌ "Can't reach database server at localhost:5432"

**Cause:** PostgreSQL container is not running.

**Fix:**
```bash
# Check if container is running
docker ps | grep future-ready-db

# If not, start it
docker-compose up -d db

# Wait a few seconds for PostgreSQL to initialize, then retry
```

### ❌ "Database 'tutoring' does not exist"

**Cause:** Container started but database wasn't created.

**Fix:**
```bash
# Recreate the container
docker-compose down db
docker-compose up -d db
```

### ❌ "Connection refused" when running app in Docker

**Cause:** App is using `localhost` instead of `db` hostname.

**Fix:** Ensure `docker-compose.yml` uses:
```yaml
DATABASE_URL=postgresql://postgres:postgres@db:5432/tutoring
```

### ❌ Migration fails with "shadow database" error

**Cause:** Prisma needs a second database for migrations.

**Fix:**
```bash
# Connect to PostgreSQL and create shadow database
docker exec -it future-ready-db psql -U postgres -c "CREATE DATABASE tutoring_shadow;"
```

---

## Backup & Restore

### Create Backup

```bash
# Backup to SQL file
docker exec -t future-ready-db pg_dump -U postgres tutoring > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Backup

```bash
# Restore from SQL file
cat backup.sql | docker exec -i future-ready-db psql -U postgres -d tutoring
```

---

## Production Considerations

1. **Change default credentials** - Never use `postgres:postgres` in production
2. **Use connection pooling** - Consider PgBouncer for high traffic
3. **Enable SSL** - Add `?sslmode=require` to connection string
4. **Regular backups** - Set up automated backup scripts
5. **Use managed PostgreSQL** - Consider AWS RDS, Supabase, or Neon for production
