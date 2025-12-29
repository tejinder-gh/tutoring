# big O  Web - Tutoring Platform

A modern, full-stack tutoring and education management platform built with Next.js 16, Prisma, and PostgreSQL.

## 🚀 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** NextAuth.js (v5 Beta)
- **Internationalization:** next-intl
- **Containerization:** Docker & Docker Compose

## 📋 Prerequisites

Ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (v20 or higher)
- [Docker](https://www.docker.com/) & Docker Compose
- [Git](https://git-scm.com/)

## 🛠️ Getting Started (Local Development)

Follow these steps to set up the project locally without Docker.

### 1. Clone the Repository

```bash
git clone <repository-url>
cd future-ready-web
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory. You can use `.env.example` (if available) as a reference. Ensure the following variables are set:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tutoring"

# Authentication
AUTH_SECRET="your-super-secure-secret-key" # Run `npx auth secret` to generate
AUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST=true
```

### 4. Database Setup

Ensure you have a local PostgreSQL instance running (or update DATABASE_URL to point to a remote one).

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed the database
node scripts/seed.js
```

### 5. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🐳 Running with Docker (Recommended)

Docker provides a consistent environment with the database and application pre-configured.

### 1. Build and Run

To start the application and the database:

```bash
docker compose up --build
```

> **Important:** The `--build` flag is crucial. Without it, Docker may launch an older version of your application from a cached image instead of compiling your latest code changes.

### 2. Accessing the App

- **Web App:** [http://localhost:3000](http://localhost:3000)
- **Database:** Port `5432`

### 3. Stopping the Containers

```bash
docker compose down
```

To stop and remove volumes (reset database):
```bash
docker compose down -v
```

## 🗄️ Database Management

### Prisma Studio
Browse and edit your data via a GUI:
```bash
npx prisma studio
```

### Migrations
If you make changes to `prisma/schema.prisma`:
```bash
npx prisma migrate dev --name <migration-name>
```

## 📂 Project Structure

- `/src/app`: App Router pages and layouts
- `/src/components`: Reusable UI components
- `/prisma`: Database schema and migrations
- `/messages`: Localization (i18n) files
- `/public`: Static assets
- `/scripts`: Utility scripts (e.g., database seeding)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
