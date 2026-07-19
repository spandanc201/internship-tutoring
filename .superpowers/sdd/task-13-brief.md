# Task 13: Testing & Deployment

## Overview

Comprehensive testing and production setup for the internship platform. Covers unit tests, API integration tests, CI/CD pipeline, containerization, and deployment documentation.

## Testing Requirements

### Unit Tests

#### Scoring Algorithm Tests (tests/lib/scoring.test.ts)
Test the recommendation scoring engine from Task 9:
- [ ] Calculate score correctly: skills 50%, exp 20%, projects 15%, edu 15%
- [ ] Handle missing fields gracefully (null/undefined)
- [ ] Score boundaries: 0-100 range
- [ ] Categorization: good_fit (75+), stretch (50-74), long_shot (<50)
- [ ] Weight edge cases: all zeros, all ones, partial matches

#### Calendar Generator Tests (tests/lib/calendar-generator.test.ts)
Test prep calendar generation from Task 11:
- [ ] Generate backend interview tasks (role type 1)
- [ ] Generate frontend interview tasks (role type 2)
- [ ] Generate ML interview tasks (role type 3)
- [ ] Generate general 6-month calendar
- [ ] Distribute tasks across weeks correctly
- [ ] Handle "soon" interviews (<7 days)
- [ ] Handle "far" interviews (>6 months)

### API Integration Tests

#### Resume Endpoints (tests/api/resume.test.ts)
- [ ] POST /api/resume/upload - Happy path, invalid file, unauthorized
- [ ] POST /api/resume/parse - Valid resume, invalid format
- [ ] Auth required: Should return 401 without token

#### Applications Endpoints (tests/api/applications.test.ts)
- [ ] GET /api/applications - Returns user's applications, sorted
- [ ] POST /api/applications - Create application, validate inputs
- [ ] PUT /api/applications/[id] - Update application, authorization check
- [ ] DELETE /api/applications/[id] - Delete application, authorization check
- [ ] 404 for non-existent IDs
- [ ] 401 for unauthorized access

#### Recommendations Endpoint (tests/api/recommendations.test.ts)
- [ ] GET /api/recommendations - Returns categorized recommendations
- [ ] Scores calculated correctly
- [ ] Requires authentication
- [ ] Empty results if no jobs/resume

#### Calendar Endpoints (tests/api/calendar.test.ts)
- [ ] GET /api/calendar - List events, filtering by type
- [ ] POST /api/calendar/generate - Generate interview prep
- [ ] POST /api/calendar - Create custom event
- [ ] PUT /api/calendar/[id] - Update event
- [ ] DELETE /api/calendar/[id] - Delete event
- [ ] Authorization checks

## Files to Create

- `jest.config.js` - Jest configuration
- `tests/setup.ts` - Test setup, mocks, fixtures
- `tests/lib/scoring.test.ts` - Scoring algorithm tests
- `tests/lib/calendar-generator.test.ts` - Calendar generation tests
- `tests/api/resume.test.ts` - Resume API tests
- `tests/api/applications.test.ts` - Applications API tests
- `tests/api/recommendations.test.ts` - Recommendations API tests
- `tests/api/calendar.test.ts` - Calendar API tests
- `.github/workflows/ci.yml` - GitHub Actions CI/CD pipeline
- `Dockerfile` - (Optional) Docker image for containerization
- `DEPLOYMENT.md` - Deployment guide and runbook

## Jest Configuration (jest.config.js)

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  collectCoverageFrom: [
    'lib/**/*.ts',
    'app/api/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};
```

## GitHub Actions CI/CD (.github/workflows/ci.yml)

Pipeline:
1. **Checkout** code
2. **Setup** Node.js (use LTS version)
3. **Install** dependencies (npm install)
4. **Lint** code (npm run lint, if eslint configured)
5. **Type check** (tsc --noEmit)
6. **Run tests** (npm test, must pass with >70% coverage)
7. **Build** (npm run build, must succeed)
8. **Upload coverage** to Codecov (optional)

Trigger on: push to main, all PRs

## Dockerfile (Optional)

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Build app
COPY . .
RUN npm run build

# Start app
EXPOSE 3000
CMD ["npm", "start"]
```

## Acceptance Criteria

- [ ] Jest configured and working
- [ ] Unit tests pass: scoring algorithm, calendar generation
- [ ] API integration tests pass: all 7 endpoint suites
- [ ] Test coverage >= 70% (branches, functions, lines, statements)
- [ ] `npm test` runs all tests successfully
- [ ] `npm run build` succeeds with no errors
- [ ] GitHub Actions CI/CD pipeline configured
- [ ] CI passes on main branch (green checkmark)
- [ ] DEPLOYMENT.md is complete and accurate
- [ ] No console errors, all tests clean

## Deployment Guide (DEPLOYMENT.md)

Should cover:

### Development Setup
- Prerequisites (Node.js 18+, PostgreSQL 14+)
- Clone repo, install dependencies
- Environment variables (.env.local)
- Database setup (prisma migrate deploy)
- Run dev server (npm run dev)

### Production Deployment
- Build: `npm run build`
- Environment variables: list all required vars
- Database migrations: `prisma migrate deploy`
- Start: `npm start` or container deployment
- Monitoring: log levels, error tracking (Sentry, etc.)

### Deployment Options
- Option 1: Vercel (recommended for Next.js)
  - Connect repo to Vercel
  - Set env vars in dashboard
  - Auto-deploy on push to main
- Option 2: Docker + Cloud Run / Heroku
  - Build and push image
  - Set env vars in platform
  - Scale as needed
- Option 3: Self-hosted (VM/dedicated server)
  - Clone repo, install deps
  - Run migrations
  - Start via PM2 or systemd

### Testing Before Deploy
- Run full test suite: `npm test`
- Build check: `npm run build`
- Manual smoke test: sign up → upload resume → get recommendations → log application
- Check logs for errors

### Rollback Plan
- Keep previous version tagged in git
- Database migrations are forward-only (create restore point before major changes)
- If critical issue, revert to previous tag and redeploy

## Test Data & Fixtures (tests/setup.ts)

Should provide:
- Mock user with resume
- Mock job postings (3+ entries)
- Mock recommendations (good_fit, stretch, long_shot)
- Mock applications (various statuses)
- Helper functions: createUser, createPosting, etc.

## Running Tests

```bash
# Run all tests
npm test

# Run single test file
npm test -- tests/api/applications.test.ts

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## Notes

- Tests should be independent (no shared state between tests)
- Use descriptive test names: "should create application and log to database"
- Mock external APIs (third-party parsing, LinkedIn scraper)
- Use test fixtures for consistent data
- Database tests: use test database or in-memory SQLite (if possible)
- Coverage target: 70% minimum, aim for 85%+
- CI/CD should prevent merging without passing tests

## Acceptance Notes

- All 8 test suites must pass
- Coverage report must show >= 70% in all categories
- Build must succeed with no warnings
- CI pipeline must be green
- Deployment guide must be complete and tested
- No hardcoded credentials in code or tests
