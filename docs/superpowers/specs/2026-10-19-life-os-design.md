# Life OS — Design Document
_2026-10-19_

---

## Intent & Why

Pedro juggles two jobs, university, a learning backlog, sports, and personal life. The core problem is **context-switching**: trying to make progress on multiple obligations simultaneously means nothing gets finished. The app's job is to give Pedro a single place where the full picture of all life areas is always visible, so he can make smarter decisions about what to focus on next — without losing track of anything else.

This is not a productivity methodology enforcer. It is a personal command center.

---

## Goals

- See the status of all life areas at a glance from one home screen
- Track tasks, projects, and progress within each area using a Kanban board
- Track learning items (books, courses, certifications) with progress indicators
- Access the app from both desktop browser and mobile phone
- Never have to open multiple tools to know where things stand

## Non-Goals

- Collaboration / sharing with others
- Calendar integration (v1)
- Time tracking or Pomodoro timers (v1)
- Notifications / reminders (v1)
- Native mobile app — responsive web is sufficient

## Anti-Goals

- Anything that adds friction to capturing a task
- Feature creep that makes it feel like work to maintain

---

## Life Areas

Six fixed areas, each with its own color identity:

| Area | Color | Kanban columns |
|---|---|---|
| Job 1 | Indigo `#6366f1` | To Do · In Progress · Done |
| Job 2 | Violet `#8b5cf6` | To Do · In Progress · Done |
| University | Emerald `#10b981` | To Do · In Progress · Done |
| Learning | Amber `#f59e0b` | Backlog · In Progress · Done |
| Sports | Teal `#14b8a6` | Planned · Done |
| Personal | Pink `#ec4899` | To Do · In Progress · Done |

Learning cards carry an extra **progress bar** (e.g. chapter X of Y, % complete) and a **type badge** (Book / Course / Certification / Video).

Every card (all areas) has an **urgency level**: Low / Medium / High. Default is Medium.

---

## Layout & Navigation

### Shell

- **Narrow icon sidebar** on the left (desktop) / **bottom tab bar** (mobile)
- Icons are colored squares representing each area + a home icon at top
- Clicking an icon navigates to that area's Kanban; the home icon returns to the Dashboard
- Active area is highlighted with a glow ring

### Home — Dashboard

The default view when the app opens.

**Stats row** (top): three tiles — _Tasks remaining_, _Due today_ (amber), _Done today_ (green).

**Area cards grid** (below stats): one card per life area in a 2×3 grid (desktop) / single column (mobile). Each card shows:
- Area name + color accent (top border)
- The single most urgent open task (nearest due date; tiebroken by urgency level High > Medium > Low; then most recently added)
- Count of open tasks
- For Learning: progress bar of the active item

Clicking a card navigates to that area's Kanban.

### Area View — Kanban Board

Standard kanban: columns laid out horizontally (desktop) / horizontally scrollable (mobile).

Each **card** on the board shows:
- Title
- Urgency badge (Low / Medium / High)
- Due date (if set), highlighted amber if due today, red if overdue
- Progress bar (Learning area only)
- Type badge (Learning area only)

When a card is moved to a Done column, a **completion timestamp** (ISO datetime, browser local) is stored. This powers the "Done today" stat on the dashboard.

_Builder call: due dates stored as ISO date strings (date only, no time); comparison uses browser local date. Cards are permanently scoped to one area — no cross-area moves in v1. Done cards older than 90 days are archived (hidden from board, excluded from stats) to keep storage lean._

Cards are **draggable** between columns to update status.

A **+ Add** button at the top of each column opens a minimal inline form: title, optional due date, optional notes.

---

## Tech Stack

- **Backend:** Node.js + Express (or Fastify) with a small REST API; SQLite database via Prisma for v1 — simple, zero-infra, file-based. Upgradeable to Postgres later.
- **Auth:** Single-user, simple password or PIN to protect personal data. No multi-user needed.
- **Frontend:** React + TypeScript, Vite
- **Styling:** Tailwind CSS (dark theme by default)
- **Data sync:** Frontend talks to backend API; data lives in the database, not localStorage. Works across all devices (desktop + phone) via the same URL.
- **Responsive:** Mobile-first CSS, works in any modern browser on desktop and phone
- **Deployment:** Railway (free $5/month credit tier) — persistent volume for SQLite, backend + frontend served together; accessible from phone via URL

---

## Visual Style

- **Theme:** Dark — deep navy background (`#0f172a`), dark slate cards (`#1e293b`)
- **Typography:** System sans-serif stack, clean and tight
- **Colors:** Each area has one vivid accent color (see table above); used for top borders, badges, and sidebar icons
- **Density:** Compact — more information visible without scrolling
- **Design phase:** Use `frontend-design` skill before building any UI component

---

## Screens Summary

1. **Home / Dashboard** — stats row + 2×3 area cards grid
2. **Area / Kanban** — full kanban board for one area (navigated to from sidebar or card click)
3. _(v2)_ Weekly view — timeline across all areas

---

## Open Builder Calls

- Exact breakpoints for mobile/desktop layout (standard Tailwind `sm`/`lg`)
- REST API schema and database models (builder designs from the card data model above)
- Animation/transition style for card drag (subtle, nothing distracting)
- Empty state illustrations (keep it minimal)
