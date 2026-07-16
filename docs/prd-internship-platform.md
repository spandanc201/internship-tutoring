# PRD: End-to-End Internship Sourcing, Preparation & Support Platform

## Overview
A comprehensive platform for college students to manage the entire internship application and preparation process: tracking applications, discovering role recommendations based on their resume and interests, following a personalized preparation schedule for interviews, and eventually accessing tutoring support. Phase 1 focuses on application tracking, role recommendations, and interview prep calendar. The tutor marketplace (Phase 2) is deferred.

## Goals
- Reduce overwhelm by centralizing internship discovery, application tracking, and interview preparation in one place
- Help students identify internships they're well-positioned for, while also highlighting ambitious stretch roles aligned with their interests
- Provide personalized, timeline-aware interview prep schedules based on when students have interviews and how much time they can commit
- Surface relevant internship opportunities from across the web, keeping the database fresh and comprehensive
- Enable students to organize, annotate, and track their application journey end-to-end

## Non-Goals
- Tutor marketplace (Phase 2)
- Company/university integrations
- School verification or student authentication
- Job posting platform (we scrape, not host)
- Resume writing, cover letter generation, or other writing assistance

## Behavior

### Feature 1: Application Tracker

#### Happy Path
1. Student signs up with email
2. Student navigates to "My Applications" section
3. Student logs a new application: enters company, role, internship description (or selects from a scraped posting)
4. Application is stored with status "Applied" and application date
5. When student has an interview scheduled, they update the entry with interview date and notes
6. When the interview concludes or an offer arrives, they update status, add notes, and record salary/offer details if applicable
7. Student can view all their applications in a list/table, sorted by company, date, status, or other fields
8. Student can view a single application in detail, edit it, and add/update notes at any time

#### Edge Cases
- **No internship description provided:** student can add one later, or leave blank (system allows optional field)
- **Multiple interviews for same role:** each interview logged as a separate update to the same application entry, with notes specifying which round
- **Application rejected:** status updates to "Rejected," student can leave notes on why or what they learned
- **Offer received but awaiting details:** status is "Offer," but salary/offer letter not yet added; student can add later
- **Duplicate application (same company/role):** system warns but allows; student may apply multiple years or to different teams

#### Error Handling
- **Missing required fields (company, role):** form validation prevents submission; user sees clear error message
- **Invalid dates (interview date before application date):** system flags and asks for correction
- **Data loss on navigation:** form auto-saves as user types; if user navigates away, draft is preserved

---

### Feature 2: Role Recommendations Engine

#### Happy Path
1. Student signs up and navigates to "Find Internships"
2. System prompts student to upload resume (PDF or DOC)
3. System parses resume using third-party API (fallback: manual parsing if API fails)
4. System extracts: technical skills, prior internships, projects, inferred GPA/major if available
5. Student reviews extracted data and can:
   - Confirm/edit skills extracted from resume
   - Add additional skills not on resume
   - Select interests from a predefined list (e.g., "Backend," "Machine Learning," "Data Science," "Frontend," "Mobile," "DevOps," etc.)
   - Manually add custom interests if not in list
6. System scores and recommends internships from the database using scoring system (see Data Model section)
7. Results displayed in two tabs: "Good Fit" (75+) and "Stretch" (50-74), with roles below 50 shown in a third "Long Shot" tab
8. Each recommendation shows: company, role title, match score, key reason for match (e.g., "You have 3/4 required skills"), link to full posting
9. Student can filter by: location, company, required skills, estimated difficulty, salary range (if available)
10. Student can rank/sort: by match score, by recency, by salary, by company, by interest
11. Student can click a recommended role to view the full job posting and optionally log an application in the tracker

#### Edge Cases
- **Resume parsing fails:** system shows error and offers manual input form (student enters skills, prior internships, projects)
- **Student has no prior internships:** system still ranks based on skills and projects; experience weight is 0
- **No projects listed:** projects weight is 0 for that student; recommendation based only on skills and experience
- **Resume uploaded multiple times:** see Feature 5 (Resume Management) for versioning behavior
- **Job posting has vague or missing skill requirements:** keyword parsing extracts what it can; incomplete matches still scored but flagged to student
- **Student has very different interests than their skills suggest:** system shows both "fitted" recommendations and "stretch" roles matching interests; student sees both paths
- **No internships in database match criteria:** system shows empty state with message and option to check back later or create alerts

#### Error Handling
- **Resume upload fails (network error):** user sees retry button; queued for processing if async
- **Third-party parsing API times out:** fallback to manual entry form
- **Student provides incomplete interests/skills data:** form allows submission but flags which fields are weak (e.g., "No interests selected; recommendations will be generic")
- **Recommendation score is NaN or invalid:** system logs error, shows "Unable to calculate match" with explanation, but still displays posting to user

---

### Feature 3: Prep Calendar

#### Happy Path - Interview-Specific Prep
1. Student logs an interview date in the application tracker
2. System detects new interview date and generates a prep schedule from today until the interview date
3. Student navigates to "Prep Calendar" and sees the interview-specific prep plan
4. Prep plan auto-generated based on:
   - Role type (backend, frontend, ML, etc.)
   - Time until interview (e.g., 4 weeks)
   - Student's available hours per week (manually input by student)
5. Calendar shows recommended prep tasks (e.g., "Practice coding problems," "Study system design," "Prepare behavioral answers")
6. Tasks are distributed across the timeline to fit available hours
7. Student can mark tasks complete, snooze, or skip
8. Student can add custom prep tasks and notes to any day

#### Happy Path - General Prep Calendar
1. Student also has a 6-month rolling "general prep" calendar
2. This is a default prep schedule suggesting topics/skills to maintain (e.g., "Review data structures," "Practice coding problems," "Read about new technologies")
3. Student can customize this calendar or ignore it
4. General prep is independent of specific interviews

#### Edge Cases
- **Student logs interview date but hasn't input available hours/week:** system uses a default (e.g., 5 hours/week) and warns student to customize
- **Interview is very soon (< 1 week):** system creates an intensive prep plan; warns student that time is limited
- **Interview is very far away (> 6 months):** system still generates prep, but may suggest lighter initial schedule
- **Student updates interview date after prep calendar generated:** system regenerates the prep schedule
- **Student has multiple interviews at different dates:** each interview gets its own prep plan; system shows all in a timeline view
- **Student has no upcoming interviews:** general prep calendar is available; interview-specific prep grayed out until interview scheduled
- **System-generated templates don't fit student's available hours:** student can manually adjust or create custom prep plan

#### Error Handling
- **Student inputs invalid available hours (negative, 0, or >168/week):** form validation and error message
- **Calendar event fails to save:** system shows error, allows retry or draft save
- **Prep template is missing data:** system uses generic template and logs error; user sees notice that template may be incomplete

---

### Feature 4: Resume Management

#### Happy Path
1. Student uploads resume (first time or updated version)
2. System extracts skills, internships, projects into student's profile
3. Student can view extracted data and manually edit/confirm
4. System stores the resume file and all extracted metadata
5. Student can upload another resume version later
6. System stores all versions and allows student to "make active" which version to use
7. When student switches active resume:
   - Role recommendations are re-run against the new resume
   - Application tracker remains unchanged (historical record)
   - Student can see side-by-side comparison of old vs. new recommendations

#### Edge Cases
- **Student uploads multiple versions in quick succession:** system stores all; student can select which to use
- **Student uploads resume with no extracted skills:** system shows warning and offers manual input form
- **Student edits extracted skills/interests but then switches resume version:** edited custom skills are preserved; extracted data reverts to new resume's extraction

#### Error Handling
- **Resume file is corrupted:** system shows error, prompts to re-upload
- **Resume upload exceeds size limit:** form validation prevents upload, shows limit
- **Student deletes a resume version:** system allows deletion; if that version was active, switches to most recent

---

### Feature 5: Job Posting Database & Scraping

#### Data Sourcing
- **Automated scraping:** system scrapes multiple job boards (e.g., LinkedIn, Glassdoor, Internshala, Company Careers pages, etc.) on a regular schedule (e.g., weekly)
- **User submissions:** students can submit internship postings manually (role title, company, description, link)
- **Deduplication:** if same posting appears on multiple sources, system identifies duplicates and keeps single entry; metadata includes all original links
- **Data extracted:** title, company, description, required skills, location, salary/compensation (if available), internship duration, application deadline, link to original posting

#### Keyword Parsing for Skills
- System parses job description for technical skills (e.g., "Python," "React," "SQL," "AWS")
- Uses predefined skill dictionary plus learned patterns from descriptions
- Skills are tagged with confidence level; high-confidence skills used for scoring

#### Freshness & Lifecycle
- Postings are re-scraped weekly to update deadline, status, and remove stale postings
- Postings older than 30 days (or past deadline) are archived but remain queryable

#### Error Handling
- **Scrape fails for a particular source:** system logs error, retries later, still serves other sources
- **Skill extraction misses or hallucmates skills:** system allows manual tagging; feedback loop used to improve extraction

---

## Data Model

### User
```
- id (UUID)
- email (string, unique)
- created_at (timestamp)
- updated_at (timestamp)
```

### Resume
```
- id (UUID)
- user_id (foreign key)
- file_path (string) — location of uploaded file
- uploaded_at (timestamp)
- is_active (boolean) — which version is currently used
- extracted_data (JSON object):
  - skills (array of strings)
  - prior_internships (array of objects: {company, title, duration, skills})
  - projects (array of objects: {title, description, skills, link})
  - inferred_gpa (float, optional)
  - inferred_major (string, optional)
```

### StudentProfile
```
- id (UUID)
- user_id (foreign key)
- active_resume_id (foreign key to Resume)
- interests (array of strings) — selected from predefined list
- custom_interests (array of strings) — student-added
- skills (array of strings) — derived from active resume + manual additions
- available_hours_per_week (integer) — for prep calendar
- created_at (timestamp)
- updated_at (timestamp)
```

### Application
```
- id (UUID)
- user_id (foreign key)
- company (string)
- role (string)
- description (string, optional)
- source (enum: "manual", "recommendation", "user_submission")
- status (enum: "applied", "interviewing", "rejected", "offer", "accepted", "declined")
- applied_date (date)
- interview_dates (array of dates, optional)
- interview_notes (text, optional)
- offer_details (JSON: {salary, equity, bonus, start_date, etc.}, optional)
- personal_notes (text)
- created_at (timestamp)
- updated_at (timestamp)
```

### InternshipPosting
```
- id (UUID)
- company (string)
- role_title (string)
- description (text)
- required_skills (array of strings) — extracted via keyword parsing
- location (string, optional)
- salary_range (JSON: {min, max, currency}, optional)
- duration (string, e.g., "10 weeks")
- application_deadline (date, optional)
- original_links (array of URLs) — from all scraped sources
- source_boards (array of strings) — e.g., ["LinkedIn", "Glassdoor"]
- posted_date (date)
- scraped_at (timestamp)
- is_archived (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

### RecommendationScore
```
- id (UUID)
- user_id (foreign key)
- posting_id (foreign key)
- skill_match_score (float: 0-100)
- experience_score (float: 0-100)
- project_alignment_score (float: 0-100)
- education_score (float: 0-100)
- final_score (float: 0-100)
- category (enum: "good_fit", "stretch", "long_shot")
- reason (string) — human-readable explanation (e.g., "You have 3/4 required skills")
- calculated_at (timestamp)
```

### PrepCalendarEvent
```
- id (UUID)
- user_id (foreign key)
- application_id (foreign key, optional) — if tied to specific interview
- event_type (enum: "interview_prep", "general_prep", "custom")
- title (string)
- description (text, optional)
- due_date (date)
- estimated_hours (float)
- is_completed (boolean)
- source (enum: "auto_generated", "system_template", "student_created")
- created_at (timestamp)
- updated_at (timestamp)
```

### UserSubmittedPosting
```
- id (UUID)
- user_id (foreign key) — who submitted
- company (string)
- role_title (string)
- description (text)
- link (URL)
- submitted_at (timestamp)
- is_verified (boolean) — admin review (Phase 2?)
```

---

## Integration Points

### Resume Parsing
- **Third-party API:** call parsing API (e.g., Lever, Ashby, or similar) on upload
- **Fallback:** if API fails or returns partial data, prompt user for manual entry
- **Storage:** extracted data stored in Resume table; file stored securely

### Job Board Scraping
- **Targets:** LinkedIn, Glassdoor, Internshala, Company career pages, etc. (as many as feasible)
- **Frequency:** weekly or more often
- **Deduplication logic:** URL-based fingerprinting to identify same posting across sources
- **Error handling:** failed scrapes logged; still serve previously cached data
- **Keyword extraction:** parse job descriptions for skill mentions; refine dictionary over time

### Scoring Engine
- **Trigger:** when student loads recommendations or switches resume version
- **Input:** student profile (active resume data + interests + available hours) + posting
- **Output:** RecommendationScore record + category (good fit/stretch/long shot)
- **Algorithm:** see scoring system details in Phase 2 section below

### Prep Calendar Generation
- **Trigger:** when student logs an interview date in application tracker
- **Input:** role type (inferred from posting), time until interview, available hours/week
- **Output:** PrepCalendarEvent records for interview-specific prep
- **Templates:** pre-built templates for common roles (backend, frontend, ML, etc.); system can also suggest custom events

---

## UI/UX (High Level)

### Dashboard / Home
- Welcome message for first-time users
- Quick links to: "Find Internships," "My Applications," "Prep Calendar," "My Resume"
- Summary stats (applications submitted, interviews scheduled, etc.)

### Upload Resume / Edit Profile
- File upload for resume
- Display extracted skills, internships, projects
- Ability to edit/confirm extracted data
- Interest selection (multi-select from predefined list + free-text custom interests)
- Input for available hours per week

### Find Internships
- Two main tabs: "Good Fit," "Stretch," "Long Shot"
- Each role card shows: company, title, match score, key reason, location, deadline
- Filters: location, company, required skills, match difficulty
- Sort options: by score, recency, salary, company name
- Click to expand: full job posting, option to log application

### My Applications
- Table/list view: company, role, status, applied date, next action
- Filters/sort: by status, date, company
- Click to view/edit details: add interview dates, notes, offers, salary
- Bulk actions: export list, share with friend (if feature added)

### Prep Calendar
- Calendar view showing events for current month/quarter
- Switch between: interview-specific prep, general prep, or all events
- Ability to mark tasks complete, snooze, or add custom events
- Timeline view showing prep intensity over time

### Resume Versions
- List of uploaded resumes with upload dates
- Ability to view extracted data for each version
- "Make Active" button to switch versions
- Side-by-side comparison of recommendations after switching

---

## Testing Strategy

### Happy Path Tests
- **Application Tracker:** create application → update with interview date → mark complete
- **Role Recommendations:** upload resume → view extracted data → see recommendations → filter and sort → log application
- **Prep Calendar:** log interview → auto-generate prep schedule → mark tasks complete
- **Resume Management:** upload resume v1 → upload resume v2 → switch active version → see updated recommendations

### Edge Case Tests
- Resume parsing failure → fallback to manual entry
- Student with no prior internships → recommendations still generated
- Interview very soon (< 1 week) → intensive prep schedule generated
- Multiple interviews at different dates → multiple prep plans shown
- Duplicate application → system warns but allows

### Error Tests
- Invalid form inputs → validation messages displayed
- Upload failure → retry mechanism works
- Network timeout → graceful degradation
- Missing data (e.g., no skills extracted) → system handles gracefully

### Integration Tests
- Resume version switch → recommendations re-calculated
- New interview date logged → prep calendar auto-generated
- Posting archived (> 30 days) → no longer appears in recommendations

### Performance Tests
- Scoring engine: calculate match for 1000 postings against 1 student in < 2s
- Scraping: fetch and parse 10k new postings weekly without errors
- Resume parsing: handle 10MB PDFs + extract data in < 10s

---

## Open Questions
1. **Resume parsing accuracy:** what's the acceptable error rate? If extracted skills are wrong, how much does that break recommendations?
2. **Prep calendar personalization:** how specific should templates be? Can system learn from student behavior (e.g., how long they actually take to complete tasks)?
3. **Job board scraping scope:** which boards are highest priority? How many should we start with?
4. **Deduplication robustness:** how do we handle the same role listed with slight variations (e.g., "Software Engineer" vs. "SWE Intern")?
5. **Recommendation timing:** should recommendations be pre-calculated when resume is uploaded, or on-demand each time user views?
6. **User feedback loop:** should system collect feedback on recommendations (e.g., "did you apply?" "did you get the offer?") to improve scoring over time?
7. **Data retention:** how long do we keep archived postings? How long do we keep old resume versions?
8. **Mobile experience:** web-only MVP or mobile app as well?

---

## Status
- [ ] PRD reviewed and approved by user
- [ ] Implementation authorized
