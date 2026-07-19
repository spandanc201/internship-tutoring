# Task 10: Find Internships UI

## Overview

Build a browsable UI for displaying job recommendations with filtering, sorting, and integration with the application tracker.

## Requirements

### Display
- **3 tabs**: "Good Fit" (score 75+), "Stretch" (score 50-74), "Long Shot" (score <50)
- **Recommendation cards** showing:
  - Company name
  - Role/title
  - Recommendation score (visual + numeric)
  - Match reason (skills/experience/projects)
  - Location
  - Application deadline
  - Link to job posting (if available)

### Filters
- **Location filter** (multi-select)
- **Company filter** (multi-select)
- **Skills filter** (multi-select)

### Sorting
- Sort by score (descending)
- Sort by recency (newest first)
- Sort by salary (high to low, if available)

### Actions
- **"Log Application" button** on each card
  - Opens modal/form to create application
  - Pre-fills company and role from recommendation
  - Saves application to database via POST /api/applications

### States
- **Loading state** while fetching recommendations
- **Error state** with retry option
- **Empty state** if no recommendations match filters

## Files to Create

- `app/(dashboard)/find-internships/page.tsx` - Main page component
- `components/RecommendationCard.tsx` - Card component for single recommendation
- `components/RecommendationList.tsx` - List/grid of recommendations with tabs
- `components/RecommendationFilters.tsx` - Filters and sort controls

## API Endpoints to Use

- `GET /api/recommendations` - Fetch all recommendations (already implemented in Task 9)
  - Returns: `{ goodFit: [...], stretch: [...], longShot: [...] }`
  - Each item: `{ id, postingId, score, reason, company, role, location, deadline, salaryMin?, salaryMax? }`

- `POST /api/applications` - Log an application
  - Body: `{ postingId, status, notes?, appliedDate? }`
  - Returns: created application object

## Acceptance Criteria

- [ ] Page loads and displays recommendations in 3 tabs
- [ ] Filters work: location, company, skills (applied to all tabs)
- [ ] Sort works: by score, by recency, by salary
- [ ] "Log Application" button creates application and updates state
- [ ] Loading/error/empty states display correctly
- [ ] UI is responsive (mobile-friendly)
- [ ] All TypeScript types are correct
- [ ] No console errors or warnings

## Technical Patterns

- Use React hooks (useState, useEffect) for state management
- Fetch recommendations on mount with error handling
- Apply filters client-side (recommendations are paginated)
- Create applications via API with loading state
- Use TailwindCSS for styling (consistent with existing components)
- Authentication: already handled by layout middleware

## Notes

- Recommendations are pre-computed by scoring engine (Task 9)
- Scores are absolute (no normalization needed)
- Can assume 50-200 recommendations per user (pagination not required for MVP)
- Salary data is optional (if missing, don't show salary sort/filter)
