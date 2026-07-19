# Task 11: Prep Calendar Generation

## Overview

Auto-generate interview prep schedules based on upcoming interviews. When interview dates are logged in applications, the system distributes preparation tasks across available hours/week.

## Requirements

### Calendar Generation Logic

#### Interview-Specific Prep
- **Triggered** when user logs an application with an interview date
- **Duration**: From now until interview date
- **Tasks distributed** across available hours per week (configurable, default 10 hours/week)
- **Role-specific templates** (backend, frontend, ML, general):
  - Backend: system design, algorithms, database design, API design, debugging
  - Frontend: React patterns, CSS/DOM, state management, performance, accessibility
  - ML: statistics, model architecture, training/evaluation, hyperparameter tuning, edge cases
  - General: 6-month rolling calendar (described below)

#### General 6-Month Rolling Prep Calendar
- Evergreen prep activities (interview prep, leetcode, portfolio building, networking)
- Distributed across weeks (configurable, default 5 hours/week)
- Always running in background, independent of specific interviews

#### Edge Cases
- **Very soon** (<7 days until interview): Compress schedule, prioritize high-value tasks
- **Far away** (>6 months): Distribute tasks evenly, don't waste effort in early weeks
- **Overlapping interviews**: Merge schedules intelligently, avoid double-booking
- **Cancelled interviews**: Remove associated prep tasks

### Task Templates

#### Backend Interview Template (Role ID: 1)
1. System Design (2 weeks)
2. LeetCode Hard problems (4 weeks)
3. Database Design patterns (2 weeks)
4. API Design principles (1 week)
5. Debug & troubleshoot session (1 week)

#### Frontend Interview Template (Role ID: 2)
1. React deep dive (2 weeks)
2. CSS & DOM patterns (2 weeks)
3. Performance & optimization (2 weeks)
4. State management (1 week)
5. Accessibility (1 week)

#### ML Interview Template (Role ID: 3)
1. Statistics & probability (2 weeks)
2. Model architectures (3 weeks)
3. Training & evaluation (2 weeks)
4. Hyperparameter tuning (1 week)
5. Edge cases & deployment (1 week)

#### General Interview Template (Evergreen)
1. Behavioral questions (1 week, repeat monthly)
2. Company research (1 week, repeat 2 weeks before each interview)
3. LeetCode medium (2 weeks, repeat every 4 weeks)
4. Portfolio building (2 weeks, repeat every 6 weeks)
5. Networking/cold outreach (1 week, repeat monthly)

### Data Model

```prisma
model PrepCalendarEvent {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  title         String     // "System Design Interview Prep", "Behavioral Questions", etc.
  description   String?
  startDate     DateTime
  endDate       DateTime   // Can be same day for single-day tasks
  
  type          String     // "interview", "general", "custom"
  interviewId   String?    // Reference to Application if this is interview-specific
  interview     Application? @relation(fields: [interviewId], references: [id], onDelete: SetNull)
  
  category      String     // "system-design", "leetcode", "behavioral", "portfolio", etc.
  hoursEstimate Int       // Expected hours to complete
  
  isCompleted   Boolean    @default(false)
  completedDate DateTime?
  
  isSnoozed     Boolean    @default(false)
  snoozeUntil   DateTime?
  
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
}
```

Add to `prisma/schema.prisma`:
```prisma
model Application {
  // ... existing fields ...
  prepEvents    PrepCalendarEvent[]
}

model User {
  // ... existing fields ...
  prepEvents    PrepCalendarEvent[]
}
```

## Files to Create

- `lib/calendar-generator.ts` - Core generation logic + templates
- `app/api/calendar/route.ts` - GET list, POST create/generate
- `app/api/calendar/[id]/route.ts` - PUT update, DELETE remove

## API Endpoints

### GET /api/calendar?type=interview|general|all&fromDate=ISO&toDate=ISO
- List calendar events for user
- Filters: `type` (interview|general|all), date range
- Returns: `PrepCalendarEvent[]`

### POST /api/calendar/generate
- Trigger calendar generation for a new interview
- Body: `{ applicationId: string, roleType: "backend"|"frontend"|"ml"|"general" }`
- Returns: `{ success: boolean, eventsCreated: number, events: PrepCalendarEvent[] }`

### POST /api/calendar
- Create custom prep event
- Body: `{ title, description?, startDate, endDate, category, hoursEstimate, type }`
- Returns: created `PrepCalendarEvent`

### PUT /api/calendar/[id]
- Update event (mark complete, snooze, edit)
- Body: `{ isCompleted?: boolean, isSnoozed?: boolean, snoozeUntil?: string, title?: string, ... }`
- Returns: updated `PrepCalendarEvent`

### DELETE /api/calendar/[id]
- Delete event
- Returns: `{ success: boolean }`

## Acceptance Criteria

- [ ] Prisma schema updated with PrepCalendarEvent model
- [ ] Calendar generation triggered when application logs interview date
- [ ] Interview-specific tasks distributed across weeks before interview
- [ ] Role-specific templates generate correct task sequences
- [ ] General 6-month prep calendar exists and updates
- [ ] Edge cases handled (soon <7d, far >6mo, overlaps, cancellations)
- [ ] All 4 API endpoints implemented with auth + ownership checks
- [ ] Tests cover generation logic (at least 3 test cases per template)
- [ ] No console errors, TypeScript strict mode passes

## Technical Notes

- Use `date-fns` for date math (already in package.json)
- Distribution logic: spread tasks evenly across available weeks
- For "soon" interviews: reduce spacing, skip lower-priority tasks
- For "far" interviews: front-load with broad topics, defer specifics
- All dates in UTC, convert to user's timezone in UI (Task 12)
- Tasks are immutable until user marks complete/snooze (no edit except custom events)

## Database Migration

After updating schema, run:
```bash
npx prisma migrate dev --name add_prep_calendar
npx prisma generate
```

## Acceptance Notes

- Generation can be automatic (triggered in application POST) or explicit (manual trigger)
- Recommend explicit trigger in Task 11 API, then integrate auto-trigger in Task 12 UI
- Each template should have consistent weekly hour estimates
- Overlapping interviews should not double-book same hours
