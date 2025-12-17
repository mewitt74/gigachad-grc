# GigaChad GRC - Quick Start Guide

Get up and running with GigaChad GRC in under 10 minutes.

---

## 🚀 Just Want to Try It?

**Skip the setup!** Use our one-click demo to explore the platform immediately:

```bash
git clone https://github.com/YOUR_ORG/gigachad-grc.git
cd gigachad-grc
./scripts/start-demo.sh
```

Or try it in your browser with [Gitpod](https://gitpod.io/#https://github.com/YOUR_ORG/gigachad-grc) (no install required).

➡️ See the [Demo & Sandbox Guide](./DEMO.md) for full details on demo features and sample data.

---

## Prerequisites

- **Docker Desktop** (v24+) - [Download](https://www.docker.com/products/docker-desktop)
- **Node.js** (v18+) - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/)

## 1. Clone the Repository

```bash
git clone https://github.com/your-org/gigachad-grc.git
cd gigachad-grc
```

## 2. Start Infrastructure

Start PostgreSQL, Redis, and Keycloak:

```bash
docker compose up -d postgres redis keycloak
```

Wait for services to be healthy:

```bash
docker compose ps
# All services should show "healthy" or "running"
```

## 3. Initialize Database

```bash
# Run initialization scripts
docker exec -i grc-postgres psql -U grc_user -d gigachad_grc < database/init/01-init.sql
docker exec -i grc-postgres psql -U grc_user -d gigachad_grc < database/init/02-soft-delete-migration.sql
docker exec -i grc-postgres psql -U grc_user -d gigachad_grc < database/init/03-database-enums.sql
docker exec -i grc-postgres psql -U grc_user -d gigachad_grc < database/init/04-junction-tables.sql
docker exec -i grc-postgres psql -U grc_user -d gigachad_grc < database/init/05-notification-configuration.sql
docker exec -i grc-postgres psql -U grc_user -d gigachad_grc < database/init/10-employee-compliance.sql
docker exec -i grc-postgres psql -U grc_user -d gigachad_grc < database/init/11-performance-indexes.sql
```

## 4. Install Dependencies

```bash
# Root dependencies
npm install

# Service dependencies (run in parallel for speed)
cd services/shared && npm install && cd ../..
cd services/controls && npm install && npx prisma generate && cd ../..
cd services/frameworks && npm install && npx prisma generate && cd ../..
cd services/policies && npm install && npx prisma generate && cd ../..
cd services/tprm && npm install && npx prisma generate && cd ../..
cd services/trust && npm install && npx prisma generate && cd ../..
cd services/audit && npm install && npx prisma generate && cd ../..

# Frontend dependencies
cd frontend && npm install && cd ..
```

## 5. Configure Environment

### Backend Services

Each service uses environment variables. For local development, the defaults work:

| Variable | Default | Description |
|----------|---------|-------------|
| DATABASE_URL | `postgresql://grc_user:grc_password@localhost:5432/gigachad_grc` | PostgreSQL connection |
| REDIS_URL | `redis://localhost:6379` | Redis connection |
| NODE_ENV | `development` | Environment |

### Frontend

Create `frontend/.env.local`:

```bash
# For development with auth bypass
VITE_ENABLE_DEV_AUTH=true
VITE_API_URL=
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=gigachad-grc
VITE_KEYCLOAK_CLIENT_ID=grc-frontend
```

## 6. Start Services

### Option A: Docker (Recommended)

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f
```

### Option B: Local Development

Open multiple terminals:

```bash
# Terminal 1: Controls service
cd services/controls && npm run start:dev

# Terminal 2: Frameworks service
cd services/frameworks && npm run start:dev

# Terminal 3: Frontend
cd frontend && npm run dev
```

## 7. Access the Application

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Dev Login (click "Dev Login" button) |
| **Keycloak Admin** | http://localhost:8080 | admin / admin |
| **API Health** | http://localhost:3001/api/health | - |

## 8. Seed Sample Data (Optional)

```bash
cd scripts
npm install
npx ts-node seed-database.ts
```

This creates:
- Sample controls
- Sample risks
- Sample evidence
- Demo user

## Common Commands

```bash
# Start everything
docker compose up -d

# Stop everything
docker compose down

# View logs
docker compose logs -f [service-name]

# Rebuild a service
docker compose up -d --build [service-name]

# Reset database
docker compose down -v
docker compose up -d postgres
# Re-run init scripts from step 3
```

## Troubleshooting

### Port already in use

```bash
# Find what's using the port
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Database connection failed

```bash
# Check PostgreSQL is running
docker compose ps postgres

# Test connection
docker exec grc-postgres pg_isready
```

### Services can't connect to each other

When running locally (not Docker), services use localhost. In Docker, use service names:

```bash
# Local: localhost:5432
# Docker: postgres:5432
```

## Next Steps

1. **Explore the UI** - Navigate through Controls, Risks, Evidence
2. **Import a framework** - Go to Frameworks and import SOC 2 or ISO 27001
3. **Read the docs** - Check `/docs` folder for detailed guides

## Getting Help

- 📖 [Full Documentation](./docs/)
- 🐛 [Troubleshooting Guide](./docs/TROUBLESHOOTING.md)
- 🚀 [Production Deployment](./docs/PRODUCTION_DEPLOYMENT.md)

