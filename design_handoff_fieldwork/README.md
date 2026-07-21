# Handoff: Fieldwork — Internship Platform Redesign

## Overview
Fieldwork is a complete visual + interaction redesign of the `spandanc201/internship-tutoring`
app: a platform for college students to discover internships matched to their résumé, track
applications end-to-end, and follow an interview-prep schedule. This package documents the
redesign so it can be rebuilt in the real codebase (Next.js App Router + React, per the existing repo).

The redesign replaces the stock create-next-app styling (blue/gray Tailwind, emoji) with an
**editorial, book-like design system ("Classical")**: Cormorant Garamond headings over Lora body,
hairline rules, color applied as stroke rather than fill, bordered (never solid-filled) cards and
buttons, and a soft near-white ground.

## About the Design Files
The files in this bundle are **design references created in HTML** — a single interactive prototype
(`Fieldwork.dc.html`) showing the intended look and behavior. They are **not production code to copy
directly**. The prototype is authored in a bespoke HTML component runtime (`support.js`) with an
inline-styled template and a logic class; do **not** port that runtime.

The task is to **recreate these designs in the existing repo's environment** — Next.js App Router,
React function components, and whatever styling layer the repo already uses (it currently uses
Tailwind v4). Reproduce the visual system below using CSS variables / Tailwind theme tokens; keep
the app's existing data layer, API routes, Prisma models, and auth untouched — this is a UI reskin
plus the interaction refinements noted below.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, and interactions are specified. Recreate
the UI pixel-closely using the repo's libraries and patterns. Exact token values are in the
**Design Tokens** section; they come from the Classical `styles.css` (reproduced there).

---

## Design Tokens

All values below are the source of truth. In the repo, define these as CSS variables (e.g. in
`app/globals.css` under `:root`) or map them into the Tailwind v4 `@theme` block.

### Color (mono accent scheme — one gold accent, applied as STROKE not fill)
```
--color-bg:        #f3f2f2   /* page ground */
--color-surface:   #eae9e9   /* raised/inset panels, expanded rows, plate mats */
--color-text:      #201f1d
--color-accent:    #b68235   /* gold — borders, rules, icons, large numerals only */
--color-divider:   rgba(32,31,29,0.16)  /* = color-mix(#201f1d 16%, transparent) */

/* Neutral ramp */
--color-neutral-100:#f8f4f4  --color-neutral-200:#eae7e7  --color-neutral-300:#d7d3d3
--color-neutral-400:#bab6b6  --color-neutral-500:#9b9797  --color-neutral-600:#7d7979
--color-neutral-700:#605d5d  --color-neutral-800:#444141  --color-neutral-900:#2d2b2b

/* Accent (gold) ramp */
--color-accent-100:#fff3e4  --color-accent-200:#ffe3bf  --color-accent-300:#facb8d
--color-accent-400:#e1ad66  --color-accent-500:#c28d41  --color-accent-600:#a06f24
--color-accent-700:#7d5411  --color-accent-800:#5a3b0a  --color-accent-900:#3a270d
```
Usage rules: light steps (100–300) for tinted fills/hovers/subtle borders; 500 as base; dark steps
(700–900) for text on tinted fills and pressed states. **Body-size text in gold must use
`--color-accent-700`** (the raw accent only meets 3:1, fine for icons/large text/chrome, not paragraphs).
The login panel uses a deeper warm near-black `#1a1815` (a shade below neutral-900) with text `#b2aa9d`
and muted label `#7a7266`.

### Typography
```
--font-heading: "Cormorant Garamond", system-ui, sans-serif;   weights 400, 600
--font-body:    "Lora", system-ui, sans-serif;                 weights 400, 600
```
Load via Google Fonts: `Cormorant+Garamond:wght@400;600` and `Lora:wght@400;600`.
Rules:
- Headings are **semibold (600) max** at interface sizes; **display sizes (≥40px) set at 400 (normal)**
  — the bigger the text, the lighter it sets. Letter-spacing `-0.015em` to `-0.02em` on large headings.
- Base body: 15px, line-height 1.55, weight 400.
- **Numbers that stand as figures/columns are tabular**: `font-feature-settings:'tnum'` on kickers,
  stat numerals, table figures, calendar day numbers. Running prose keeps default (proportional) figures.
- Heading scale: h1 42, h2 32, h3 25, h4 20, h5 16, h6 13 (h6 uppercase, letter-spacing 0.08em).
- "Kicker" pattern: 10–11px, letter-spacing 0.1–0.14em, uppercase, color `--color-accent`.

### Spacing scale (density 1.15×)
```
--space-1:4.6px  --space-2:9.2px  --space-3:13.8px  --space-4:18.4px  --space-6:27.6px  --space-8:36.8px
```
Main content padding: `40px 48px`. Content max-width: `1060px`, centered.

### Radius
```
--radius-sm:2px  --radius-md:4px  --radius-lg:7px
```
Cards/inputs/buttons use `--radius-md` (4px); dialogs use `--radius-lg` (7px).

### Elevation (whisper-soft, ink-tinted — never heavy)
```
--shadow-sm: 0 1px 2px  rgba(45,43,43,0.14)
--shadow-md: 0 3px 10px rgba(45,43,43,0.16)
--shadow-lg: 0 12px 32px rgba(45,43,43,0.22)
```

### Component classes (from Classical `styles.css` — reproduce these as components/utilities)
- `.btn` + `.btn-primary` (gold outline on transparent, **never filled**), `.btn-secondary`
  (divider-colored outline), `.btn-ghost` (gold text, minimal padding), `.btn-icon` (34×34), `.btn-block`.
  Hover = accent tint via `color-mix(accent 12%, transparent)`; pressed one step darker.
- `.tag` + `.tag-accent` (accent-100 bg / accent-800 text), `.tag-accent-2` (reads same as accent),
  `.tag-neutral` (neutral-100/800), `.tag-outline` (1px accent border, transparent).
- `.field` + `label` + `.input` (transparent bg, 1px divider border, gold caret + focus border).
- `.radio` + `.dot`, and `.seg` + `.seg-opt` (segmented control — checked option gets inset accent box-shadow).
- `.card` (bordered, unfilled, transparent bg) + `.card-kicker/-title/-body/-meta`; `.elev-sm/md/lg`.
- `.table` (uppercase 11px header, divider row rules, hover row tint 4%).
- `.dialog-backdrop` (fixed, neutral-900 50% scrim, grid-centered) + `.dialog` (surface bg, shadow-lg,
  max 440px) + `.dialog-title/-body/-actions`.
- `.hr` (1px divider rule). `.plate` (image wrapper: sepia(0.22) saturate(0.82) contrast(1.05),
  6px surface border + 1px divider outline — a tipped-in book-plate look).

### Focus / selection (do not use browser defaults)
```
:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }
::selection    { background: color-mix(in srgb, var(--color-accent) 30%, transparent); }
```

### Icons
**Lucide** (https://lucide.dev), stroke `currentColor`, ~1.6–1.9 stroke width, 14–22px. Icons used:
`layout-dashboard`, `compass`, `briefcase`, `calendar`, `file-text`, `log-out`, `map-pin`, `banknote`
(salary), `clock`, `chevron-right/left`, `plus`, `check`, `upload`. The current app used emoji
(📍💰📅) — replace all with Lucide.

---

## Global Layout / App Shell
Authenticated views use a **fixed left sidebar (250px) + scrolling main**.

- **Sidebar** (`width:250px`, right border 1px divider, `position:sticky; top:0; height:100vh`,
  padding `26px 0`):
  - Brand row: a 26px gold-outlined circle enclosing an 8px gold dot, + "Fieldwork" (Cormorant 20px/600).
  - Hairline `.hr`.
  - Nav items (Dashboard, Find Internships, My Applications, Prep Calendar, Résumé): each a full-width
    button, Lucide icon (18px, opacity .75) + label (Cormorant 14.5px/600), padding `10px 14px 10px 18px`,
    2px transparent left border. **Hover**: bg `color-mix(text 6%, transparent)`, text→accent.
    **Active**: text→accent, left border→accent, bg `color-mix(accent 9%, transparent)`, icon opacity 1.
  - Bottom (margin-top:auto): hairline, user chip (34px round monogram "SC" in surface w/ gold text +
    name "Spandan C." / "Junior · CS"), then a "Sign out" nav-style button (log-out icon).
- **Main**: `flex:1; padding:40px 48px`. Each view is centered at `max-width:1060px` and fades in
  (`translateY(6px)`→0, opacity 0→1, 0.35s ease).

Login/Signup does NOT use the shell (full-bleed two-column, see below).

---

## Screens / Views

### 1. Landing page (unauthenticated) + Sign in / Sign up
- **Purpose**: a marketing long-scroll landing that ends in the auth card; toggles sign-in / create-account.
- **Structure** (single vertical scroll, `max-width:1120px` content, centered; sections parted by hairlines):
  1. **Sticky top bar** — brand mark (gold-outlined circle + dot) + "Fieldwork"; right-side nav links
     (How it works, Features) and a `.btn-secondary` "Sign in". Anchors scroll to `#how` / `#features` / `#start`.
  2. **Hero** — 2-col (`1.08fr .92fr`). Left: gold rule kicker "THE INTERNSHIP SEASON, IN ORDER", display h1
     (64px/400, "The whole internship season, set on one page."), 18px muted lede, a `.btn-primary`
     "Create your account" + a text "See how it works" link with arrow. Right: the **live showcase card**
     (dark `#1a1815`, radius-lg, shadow-lg) that auto-cycles every 3.6s through 3 scenes — Sourcing (match
     card w/ filling score bar + skill chips), Tracking (three status rows), Preparation (weekly prep bar
     chart) — a pulsing "live" dot + caption, and clickable Sourcing/Tracking/Preparation indicators.
  3. **Stats band** (`--color-surface`, hairline top/bottom) — 4 tabular figures divided by 1px rules:
     1,240 roles indexed · 40+ industries · 3 match tiers · 1 ledger for it all.
  4. **Features** (`#features`) — three alternating 2-col sections (text ↔ mockup), each **revealing on
     scroll** (fade + 28px rise) with its mockup animating in-view: **01 Sourcing** (score bar grows,
     chips pop), **02 Tracking** (a `.table` of application rows pop in), **03 Preparation** (prep bars
     grow from baseline). Each has a numbered gold kicker, 38px/400 h2, muted body, and two gold-check bullets.
  5. **How it works** (`#how`, `--color-surface`) — centered heading "Three steps, start to offer." over a
     3-col row with big gold ghost numerals (01/02/03, opacity .35) + step titles/descriptions, hairline-parted.
  6. **Colophon quote** — dark `#1a1815` band, oversized gold open-quote, 32px italic Cormorant testimonial,
     gold rule, attribution.
  7. **Start** (`#start`) — 2-col: left editorial pitch ("Start your season."), right the **auth card**
     (bordered, radius-lg): kicker + title, Email (`you@university.edu`), Password (`••••••••`), a
     Confirm-password field **only in signup mode**, a `.btn-primary.btn-block` submit, `.hr`, and a footer
     line with a gold link toggling auth mode.
  8. **Footer** — brand mark + "Sourcing · Tracking · Preparation", hairline top.
- **Copy (auth card)**: sign-in → kicker "Welcome back", title "Sign in to Fieldwork", CTA "Sign in", footer
  "New to Fieldwork? Create one". signup → "Create your account" / "Start your season" / "Create account" /
  "Already have an account? Sign in". (The hero "Create your account" button pre-switches the card to signup.)
- **Motion**: scroll-reveal via IntersectionObserver toggling a persistent `data-in="1"` attribute (NOT a
  className — React re-renders would strip a class); CSS keys the reveal + child bar/chip animations off
  `[data-in="1"]`. The hero showcase auto-cycles on a 3.6s interval (paused once authed).
- **Behavior**: submitting the form authenticates and routes to Dashboard. In the real repo, wire to the
  existing `/api/auth` login/signup routes; keep validation from the PRD (required fields, clear errors).
  In Next.js this is the marketing `/` (or `/login`) route; the authenticated app lives behind it.

### 2. Dashboard
- **Purpose**: at-a-glance status + entry points.
- **Layout**: kicker (today's date, e.g. "SUNDAY, JULY 19"), h1 greeting "Good afternoon, Spandan." (44px/400),
  a muted lede summarizing upcoming interviews + prep hours (bold spans in `--color-text`).
  - **Stat strip**: 4 equal cells in a 1px-divider grid inside a bordered rounded container. Each cell:
    large tabular numeral (Cormorant 40px/400; the "Good-fit roles" numeral is `--color-accent-700`) +
    muted 12.5px label. Stats: Applications (count), Interviewing (count), Good-fit roles (count), Offers (count).
  - **Two-column body** (`1.5fr 1fr`, gap 36):
    - Left "Continue where you left off": uppercase section head, then a 2×2 grid of `.card.elev-sm`
      **buttons** (Lucide icon in accent, card-title, card-body). Navigate to Find / Applications / Calendar / Résumé.
    - Right "Next up": bordered card containing an agenda list; each row = a date block (tabular day numeral +
      uppercase month) + title (Cormorant 14.5px/600) + muted sub, divider between rows.

### 3. Find Internships
- **Purpose**: browse résumé-matched recommendations in three tiers.
- **Layout**: h1 "Find Internships" (40px/400) + muted lede.
  - **Filter bar**: bordered rounded row (`flex-wrap`, gap 14, padding `16px 18px`) with four `.field`s:
    Location (`select`), Skill (`select`), Company (text `input`), Sort by (`select`:
    Match score / Most recent / Salary / Company).
  - **Tabs**: three buttons over a bottom divider, gap 28. Each: label + a count pill (Good Fit → accent-100
    pill; Stretch → neutral-100 pill; Long Shot → outlined pill). Active tab: text→accent + 2px accent
    bottom-border.
  - **Recommendation cards** (stack, gap 16): `.card.elev-sm`, `padding:0` with a 20/22px inner pad.
    - Header row: left = kicker "COMPANY · INDUSTRY" + role title (Cormorant 23px/600); right = big tabular
      match numeral (30px/600, colored by tier: ≥75 `accent-700`, ≥50 `neutral-700`, else `neutral-500`)
      over a tiny "MATCH" label.
    - Reason paragraph (14px, max 62ch).
    - Meta row (12.5px muted, gap 18): map-pin + location, banknote + salary (`$Xk–$Yk/mo`), clock +
      "Posted Nd ago", and an accent-700 "Deadline Mon D, YYYY".
    - Skill tags (`.tag.tag-neutral`, wrap, gap 7).
    - Actions: `.btn-secondary` "View posting" / "Hide posting" (toggles), `.btn-primary` "Log application"
      (+ plus icon; becomes "Logged ✓" once tracked).
    - **Expanded** (`--color-surface` panel, top divider): "THE POSTING" head + justified description (13.5px).
  - Tiers: **Good Fit** = score ≥75, **Stretch** = 50–74, **Long Shot** = <50. Empty state: dashed-border
    panel with muted message.

### 4. My Applications
- **Purpose**: track every application; add/edit/delete.
- **Layout**: header row = h1 "My Applications" + muted count summary on the left, `.btn-primary`
  "Log application" (plus icon) on the right. Two filter `.field`s: Status (`select`) and Sort by (`select`:
  Date applied / Company / Status).
  - **Table** (`.table` in a bordered rounded container): columns Company, Role, Status, Applied, Actions.
    - Company cell = a button with a gold chevron that **rotates 90° when expanded** + company name (Cormorant 600).
    - Status = a `.tag`: applied→neutral, interviewing→accent, offer→accent-2, accepted→accent,
      rejected/declined→outline.
    - Applied = date ("Mon D, YYYY") + muted relative ("1w ago"/"today").
    - Actions = `.btn-ghost` "Edit" + `.btn-ghost` "Delete" (delete in neutral-600).
    - **Expanded row** (`--color-surface`, colspan 5): two columns — "NOTES" and "INTERVIEWS" (list joined
      by ` · `) + muted "Updated …".
  - Empty state message when a filter yields nothing.
- **Add/Edit dialog** (`.dialog`, 460px): title "Log an application" / "Edit application". 2×2 field grid:
  Company* + Role* (required), Status (`select`), Applied date (`type=date`); then a full-width **Notes**
  multi-line field; inline error "Company and role are required." Actions: `.btn-secondary` Cancel +
  `.btn-primary` "Save application". (In this prototype's runtime the notes control had to be built as a
  React element to render — in the real repo a normal `<textarea>` is correct.)
- **Delete confirm dialog**: title "Delete this application?", body naming the row, Cancel + a neutral-toned
  Delete.

### 5. Prep Calendar
- **Purpose**: interview-timed + general prep schedule with three views.
- **Layout**: header = h1 "Prep Calendar" + lede, `.btn-primary` "Add task" (plus icon).
  - Controls row: left = prev/next `.btn-icon.btn-secondary` chevrons around a centered month label
    (Cormorant 26px/600, min-width 200, centered); right = a `.seg` segmented control Month / Week / List.
  - Legend row: three swatch+label chips — Interview prep (solid accent), General prep (solid neutral-500),
    Custom (accent-outlined).
  - **Month view**: bordered container. 7-col weekday header (surface bg, uppercase 11px). Weeks as 7-col
    grids; each day cell `min-height:104px`, right+bottom dividers; today cell tinted `accent 6%` with
    accent day number. Up to 2 event chips per day (left-border colored by type: interview=accent,
    general=neutral-500, custom=accent-300; interview chips get an accent-12% bg; completed chips get
    line-through + 55% opacity), then "+N more". Chips open the event dialog.
  - **Week view**: an intensity panel (label "Prep intensity · Nh scheduled", accent-700 intensity word
    Light/Moderate/Heavy/Intensive, and a progress bar `width = min(total/25*100, 100)%` in accent) above a
    7-col grid of day cards (weekday + tabular date, event chips, per-day hour total footer).
  - **List view**: `.table` with a completion checkbox (accent-color), task title button (line-through when
    done), due date, a type `.tag`, and hours. Sorted by date.
- **Event dialog**: kicker "TYPE · Mon D, YYYY", title (line-through if done), body (a type-specific line +
  "Estimated Nh of focused work."), actions "Snooze a day" (pushes due date +1) + "Mark complete/not done".
- **Add-task dialog**: Task text, Date (`type=date`), Hours (`type=number`, step 0.5); creates a `custom` event.

### 6. Résumé
- **Purpose**: manage résumé versions that drive recommendations.
- **Layout**: h1 "Résumé" + lede. Two columns (`1.5fr 1fr`, gap 32):
  - Left: a bordered card for the **active résumé** — a 44×54 file-glyph tile (surface bg) + filename
    (Cormorant 17px/600) + "Active · uploaded Mon D, YYYY" + an "Active" `.tag.tag-accent`. Hairline, then
    "EXTRACTED SKILLS" (`.tag.tag-neutral` wrap) and "INTERESTS" (`.tag.tag-outline` wrap). Below, a
    **dashed-border upload dropzone** (`label`) with an upload icon + "Upload a new version" + hint copy.
  - Right: "VERSION HISTORY" — a stack of bordered rows (active row gets an accent border). Each: filename
    + "Uploaded …", and either an "Active" tag or a `.btn-secondary` "Make active" button.
- **Behavior**: "Make active" switches the active version (and, per PRD, re-runs recommendations); upload adds
  a new version set active. Both show a confirmation toast.

---

## Interactions & Behavior
- **Navigation**: sidebar items switch views (SPA-style here; in Next.js these are routes —
  `/dashboard`, `/find-internships`, `/applications`, `/prep-calendar`, `/resume`). Navigating closes any
  open dialog.
- **Toast/flash**: bottom-center pill (`#1a1815` bg, `#f4efe6` text, Cormorant 600, shadow-lg, gold check
  icon) shown ~2.6s after log/save/delete/upload/activate/snooze actions.
- **Expand/collapse**: recommendation cards and application rows toggle a detail panel; the row chevron
  rotates 90° (0.15s).
- **Dialogs**: click backdrop or Cancel to close; inner click stops propagation. Add-app validates that
  Company and Role are non-empty.
- **View fade-in**: each view mounts with the `fwFade` keyframe (opacity+translateY, 0.35s ease).
- **Hover/active/focus**: use the Classical states (accent tints, 2px accent `:focus-visible` ring) — never
  browser defaults.

## State Management
The real repo already has server data (Prisma + API routes). UI state to hold client-side:
- `authed` / auth mode (or use existing session).
- Active view/route.
- Find: active tier tab, filters `{location, skill, company, sort}`, expanded card id, per-card "logged" flag.
- Applications: list, status filter, sort key, expanded row id, add/edit dialog `{open, mode, id, draft, error}`,
  delete target id.
- Calendar: current month date, view mode (monthly/weekly/list), events list, open event id, add-task draft.
- Résumé: versions list with an active flag, upload state.
- Transient flash/toast message.
Wire these to the existing endpoints (`/api/recommendations`, `/api/applications`, `/api/calendar`,
`/api/resume`); the PRD in the repo (`docs/prd-internship-platform.md`) is the behavioral spec.

## Assets
- **Fonts**: Google Fonts — Cormorant Garamond + Lora.
- **Icons**: Lucide (inline SVG in the prototype; use `lucide-react` in the repo).
- **No raster images** are used. Where a photo appears in the design system it uses the `.plate` treatment,
  but this app has none. The gold circle mark in the sidebar/login is pure CSS/SVG.

## Files
- `Fieldwork-standalone.html` — **open this in any browser** to click through every screen and flow
  (self-contained, no dependencies). This is the primary visual reference.
- `Fieldwork.dc.html` — the prototype source (bespoke runtime + inline styles; reference only, do not lift).
- `design-system/styles.css` — the Classical design-system stylesheet (all token values + component
  classes). Authoritative source for colors, type, spacing, radius, shadows.
- `design-system/readme.md` — the design-system guide.

> Note: `Fieldwork.dc.html` depends on a bespoke runtime and inline styles — treat it as a
> reference, not code to lift. Rebuild in the repo's React/Tailwind environment using the tokens and specs above.
