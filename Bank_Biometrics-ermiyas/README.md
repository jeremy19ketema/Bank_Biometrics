# Aegis Biometric Banking Verification System

Production-ready enterprise monorepo architecture for high-security biometric banking operations.

## Repository Architecture

```
Bank-Biometrics/
├── frontend/           # Next.js 15 App Router, TypeScript, Tailwind CSS, shadcn/ui
├── backend/            # Express.js, TypeScript, Prisma ORM, JWT, RBAC scaffold
├── database/           # PostgreSQL init schemas, migrations, seed data, & backups
├── nginx/              # Nginx production reverse proxy gateway & TLS setup
├── docker/             # Production multi-stage Dockerfiles
├── docs/               # System architecture, REST API specs, & DB models
└── scripts/            # Automation & environment helper scripts
```

## Quick Start

### Local Development
```bash
# 1. Install workspace dependencies
npm install

# 2. Run frontend development server
npm run dev:frontend
```

### Docker Container Deployment
```bash
# Launch multi-container stack (Postgres, Backend, Frontend, Nginx)
docker-compose up -d --build
```
