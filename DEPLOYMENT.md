# Internship Platform - Deployment Guide

## Table of Contents
1. [Development Setup](#development-setup)
2. [Production Deployment](#production-deployment)
3. [Deployment Options](#deployment-options)
4. [Testing Before Deployment](#testing-before-deployment)
5. [Rollback Plan](#rollback-plan)
6. [Monitoring & Logging](#monitoring--logging)
7. [Troubleshooting](#troubleshooting)

## Development Setup

### Prerequisites
- Node.js 18 LTS or higher
- npm 9 or higher
- PostgreSQL 14 or higher
- Git latest stable version

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd internship-tutoring
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Update `.env.local`** with your values:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/internship_dev
   JWT_SECRET=your_secret_key_here
   RESUME_PARSER_API_KEY=your_api_key_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. **Setup database**
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

### Running Tests Locally
```bash
# Run all tests
npm test

# Run with coverage
npm test:coverage

# Watch mode
npm test:watch
```

## Production Deployment

### Pre-Deployment Checklist
- [ ] All tests pass: `npm test`
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] Code committed to main branch
- [ ] Environment variables configured
- [ ] Database backups created
- [ ] CI/CD pipeline passed

### Build Process
```bash
npm run build
npm start
```

### Database Setup
```bash
DATABASE_URL="postgresql://user:password@host:5432/db" \
npx prisma migrate deploy
```

### Environment Variables for Production
```env
DATABASE_URL=postgresql://user:password@prod-host:5432/internship_production
JWT_SECRET=<strong-random-secret>
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
PORT=3000
```

## Deployment Options

### Option 1: Vercel (Recommended)
1. Create Vercel account at https://vercel.com
2. Connect your GitHub repository
3. Add environment variables in Project Settings
4. Push to main branch - Vercel auto-deploys

### Option 2: Docker + Cloud Run
```bash
docker build -t internship-platform:latest .
docker tag internship-platform:latest gcr.io/PROJECT_ID/internship-platform:latest
docker push gcr.io/PROJECT_ID/internship-platform:latest

gcloud run deploy internship-platform \
  --image gcr.io/PROJECT_ID/internship-platform:latest \
  --platform managed \
  --region us-central1 \
  --set-env-vars DATABASE_URL="postgresql://..."
```

### Option 3: Self-Hosted
1. Install Node.js, PostgreSQL, Nginx, PM2
2. Clone repository and install dependencies
3. Configure environment variables
4. Run `npm run build`
5. Setup PM2: `pm2 start npm --name "internship-platform" -- start`
6. Configure Nginx as reverse proxy
7. Setup SSL with Let's Encrypt

## Testing Before Deployment

### Run Full Test Suite
```bash
npm test
npm test:coverage
```

### Manual Smoke Tests
- User Registration and Login
- Resume Upload and Parsing
- Application Creation and Tracking
- Recommendations Calculation
- Interview Calendar Generation

### Production Health Checks
```bash
curl https://yourdomain.com/api/health
psql $DATABASE_URL -c "SELECT 1"
```

## Rollback Plan

### Immediate Rollback
**Vercel:**
```bash
vercel rollback
```

**Self-Hosted:**
```bash
pm2 stop internship-platform
git checkout v1.0.0
npm ci && npm run build
pm2 start internship-platform
```

### Database Rollback
```bash
npx prisma migrate resolve --rolled-back <migration-name>
npx prisma migrate deploy
```

## Monitoring & Logging

### Application Logs
- **Vercel**: `vercel logs --tail`
- **Self-Hosted (PM2)**: `pm2 logs internship-platform`
- **Docker**: `docker logs -f container-id`

### Setup Error Tracking
Use Sentry for error tracking:
1. Create account at https://sentry.io
2. Add Sentry DSN to environment variables
3. `npm install @sentry/nextjs`

### Metrics to Monitor
- Response time
- Error rate
- Database connections
- CPU/Memory usage
- Disk space

## Troubleshooting

### Application Won't Start
```bash
npm start
env | grep -E "DATABASE|JWT"
node --version
```

### Database Connection Errors
```bash
psql $DATABASE_URL -c "SELECT 1"
npx prisma diagnose
rm -rf node_modules/.prisma && npm install
```

### Build Fails
```bash
rm -rf .next
rm -rf node_modules package-lock.json
npm install
npm run build
```

### High Memory Usage
```bash
NODE_OPTIONS="--max-old-space-size=2048" npm start
```

---

For more information, refer to:
- Next.js Documentation: https://nextjs.org/docs
- Prisma Documentation: https://www.prisma.io/docs/
- PostgreSQL Documentation: https://www.postgresql.org/docs/
