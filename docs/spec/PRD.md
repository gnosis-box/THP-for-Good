# THP for Good — Product & Implementation Plan

## What is THP for Good

THP for Good is a community fund created to promote coding for projects of common interest. Its mission: remove the financial and technical barriers that prevent talented people with social-impact ideas from pursuing them.

**How the fund works today:**
- External donations collected in a dedicated account fund the Développeur++ training program (21 weeks of coursework + 8 weeks in a company, leading to an RNCP diploma)
- Every three months the fund selects individuals with open-source, socially-useful projects — voted on by the THP community (current students and alumni) — and covers their training in full

**Who benefits:** the funded students themselves, THP's community (which gains diverse profiles and meaningful projects), and society at large through open-source social-impact work.

**This mini-app** creates a new, on-chain revenue stream for the fund: a mentorship marketplace where anyone can book domain-specific guidance by paying in CRC. All booking revenue flows to the THP for Good group treasury and is used to fund more training places.

---

## User Flows

### 1. Find & book a mentor (anyone)
Anyone — not just students or THP members — who wants quick access to domain-specific mentorship can:  
Connect via Circles host → filter mentors by skill domain → pick a mentor → view their profile and available slots (Google Calendar link) → PAY X CRC → booking recorded → calendar link opens to finalise the slot

### 2. Become a mentor (anyone)
Anyone who wants to offer mentorship can:  
Connect wallet → fill registration form (name, bio, skills, Google Cal link, CRC price per session) → submit → appear in the public mentor listing

### 3. Post-call (both sides)
Open "My Calls" → see past bookings → click **TRUST [mentor]** to endorse them on the Circles network

### 4. Admin — group organiser
Access the admin page (wallet-gated to a whitelist of organiser addresses) to:
- View all registered mentors and edit their details (name, bio, skills tags, cal link, price)
- Add or remove skill tags globally (the canonical tag list used across the app)
- See all bookings with booker address, tx hash, and timestamp
- Remove or suspend a mentor from the public listing

---

## Architecture

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 16 App Router (already in place) | Boilerplate |
| Database | SQLite via `better-sqlite3` | Zero infra for hackathon; swap to Turso for Vercel post-launch |
| API | Next.js Route Handlers | Already in stack |
| Auth | Wallet address from `useWallet()` | Address is identity; no passwords |
| Admin gate | Hardcoded organiser address whitelist (env var) | Simple for MVP |
| Payments | `sendTransactions` from `@aboutcircles/miniapp-sdk` | Host-level Safe tx |
| Booking slots | Google Calendar link per mentor | Mentor pastes their own link; no scheduling backend needed |
| Trust | `sdk.getAvatar(addr).trust.add(mentorAddr)` | Circles SDK write path |

**Treasury address (all CRC payments go here):**
`0x2b5E4045936ef12250a8c01e4Cbf71E9bEE69e00`

> **CRC transfer note**: `sendTransactions` takes raw `{ to, data?, value? }`. CRC is ERC20-like on Gnosis Chain — calldata must be ABI-encoded for the Hub/token contract. Before writing `PayButton`, run a Node probe script (see AGENTS.md pattern) to confirm the exact contract address and encoding. `viem` may be needed for encoding; check if it resolves transitively before adding.

---

## Database Schema

`lib/schema.sql`

```sql
CREATE TABLE IF NOT EXISTS skill_tags (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT    UNIQUE NOT NULL   -- e.g. "AI", "Dev", "Legal"
);

CREATE TABLE IF NOT EXISTS mentors (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  circles_address TEXT    UNIQUE NOT NULL,
  name            TEXT    NOT NULL,
  bio             TEXT,
  calendar_link   TEXT    NOT NULL,   -- Google Cal appointment/invite URL
  price_crc       INTEGER DEFAULT 100,
  active          INTEGER DEFAULT 1,  -- 0 = suspended by admin
  created_at      TEXT    DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS mentor_skills (
  mentor_id INTEGER NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  tag_id    INTEGER NOT NULL REFERENCES skill_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (mentor_id, tag_id)
);

CREATE TABLE IF NOT EXISTS bookings (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  mentor_id       INTEGER NOT NULL REFERENCES mentors(id),
  booker_address  TEXT    NOT NULL,
  tx_hash         TEXT,
  created_at      TEXT    DEFAULT (datetime('now'))
);
```

`lib/db.ts` — opens the SQLite file, runs schema migration on startup, exports typed query helpers.

`scripts/seed.ts` — seeds initial skill tags (AI, Dev, Legal, Backend, Data, Image, RoR, Photo) and mentors (Zet, Flo, Dimitry, Vincent) with real Circles addresses and sample cal links.

> **Vercel note**: SQLite file won't persist across serverless deployments. For the hackathon demo, run locally or on a VPS. Post-hackathon, swap to Turso (`@libsql/client`) — schema is identical.

---

## Routes

### Pages

| Route | File | Description |
|---|---|---|
| `/` | `app/page.tsx` *(replace)* | Hero tagline → "Which domain you want be helped with" label → text search + skill chip filter → 2-column mentor card grid |
| `/mentor/[id]` | `app/mentor/[id]/page.tsx` *(new)* | Back button → mentor name → skill chips in circular-avatar row → bio → slot picker → PAY button (slot must be selected first) |
| `/mentor/register` | `app/mentor/register/page.tsx` *(new)* | Self-registration form (wallet required) |
| `/history` | `app/history/page.tsx` *(new)* | "Your last calls" — past bookings + TRUST buttons |
| `/admin` | `app/admin/page.tsx` *(new)* | Organiser dashboard — mentor list, booking overview, tag management |

`app/profile/` and `app/actions/` are removed from nav (kept on disk, just not linked).

### API Routes

| Method | Path | File | Purpose |
|---|---|---|---|
| GET | `/api/mentors` | `app/api/mentors/route.ts` | List active mentors; `?skill=AI` filter |
| POST | `/api/mentors` | same | Register a new mentor |
| GET | `/api/mentors/[id]` | `app/api/mentors/[id]/route.ts` | Single mentor by id |
| PATCH | `/api/mentors/[id]` | same | Edit mentor (admin only) |
| DELETE | `/api/mentors/[id]` | same | Suspend/remove mentor (admin only) |
| GET | `/api/bookings` | `app/api/bookings/route.ts` | `?address=0x…` returns my bookings; no param = all (admin only) |
| POST | `/api/bookings` | same | Record a booking after payment |
| GET | `/api/tags` | `app/api/tags/route.ts` | List all skill tags |
| POST | `/api/tags` | same | Add a new tag (admin only) |
| DELETE | `/api/tags/[id]` | `app/api/tags/[id]/route.ts` | Remove a tag (admin only) |

---

## Components

| Component | Path | Notes |
|---|---|---|
| `MentorCard` | `components/mentors/MentorCard.tsx` | Avatar (Circles profile image), name, skill chips, CRC price, Book link |
| `MentorSearch` | `components/mentors/MentorSearch.tsx` | Text input; client-side filters mentor list by name, bio, and skill tags; works in combination with `SkillFilter` |
| `SkillFilter` | `components/mentors/SkillFilter.tsx` | Horizontal chip row driven by `skill_tags` table; active chip filters grid |
| `MentorDetail` | `components/mentors/MentorDetail.tsx` | Mentor name → skills as circular avatar-style badges in a row → bio → `SlotPicker` → `PayButton` |
| `SlotPicker` | `components/mentors/SlotPicker.tsx` | Visual time-slot grid (days × times). Selecting a slot enables the PAY button. After successful payment, opens `mentor.calendar_link` in a new tab to finalise the actual calendar booking. Full Google Calendar API integration is post-MVP. |
| `PayButton` | `components/mentors/PayButton.tsx` | Enabled only once a slot is selected; calls `sendTransactions`; if the Circles SDK/host does not surface a clear "insufficient balance" error natively, show an error toast "Not enough CRC"; on success POST booking |
| `BookingHistory` | `components/bookings/BookingHistory.tsx` | List of past bookings with mentor info and TRUST button |
| `TrustButton` | `components/bookings/TrustButton.tsx` | `sdk.getAvatar(me).trust.add(mentor)` on click |
| `RegisterForm` | `components/mentors/RegisterForm.tsx` | Controlled form; guarded by wallet connection; POSTs to `/api/mentors` |
| `AdminMentorTable` | `components/admin/AdminMentorTable.tsx` | Editable table of all mentors with suspend/edit actions |
| `AdminBookingTable` | `components/admin/AdminBookingTable.tsx` | Read-only table of all bookings (address, mentor, tx hash, date) |
| `AdminTagManager` | `components/admin/AdminTagManager.tsx` | Add/remove global skill tags; shows which mentors use each tag |

---

## Nav (`lib/nav.ts`)

```ts
export const NAV = [
  { href: '/',                label: 'Mentors'         },
  { href: '/history',         label: 'My Calls'        },
  { href: '/mentor/register', label: 'Become a Mentor' },
];
```

`/admin` is not in the nav — accessed directly. The page renders a "not authorised" message if the connected wallet is not in the organiser whitelist (`ADMIN_ADDRESSES` env var, comma-separated).

---

## Key Implementation Details

### Booking flow (corrected order)
```
1. User selects a slot in SlotPicker → PAY button becomes active
2. User clicks PAY
3. sendTransactions([{ to: <contract>, data: <encoded CRC transfer> }])
4. If the SDK/host returns an insufficient-balance error → show toast "Not enough CRC"
   (probe first: check whether the Safe tx rejection already surfaces a clear message before adding custom guard)
5. On success → POST /api/bookings { mentor_id, booker_address, tx_hash }
6. Open mentor.calendar_link in new tab
```

### Home page copy (from wireframe)
The browse page opens with two lines of hero text above the filter:
> Get a call with a mentor, Pay in CRC, help someone get a free bootcamp tuition

Followed by the filter section label:
> Which domain do you want help with?

Then the skill chip row and mentor grid below.

### Circles avatar enrichment
On the browse page, after loading mentors from the DB, call `sdk.rpc.profile.getProfileView(mentor.circles_address)` client-side to pull avatar image and trust stats. Degrade gracefully when `avatarInfo` is undefined.

### PayButton flow
```
1. Guard: isConnected — else show "Open in Circles to book"
2. Probe & encode CRC transfer calldata to treasury address
3. sendTransactions([{ to: <hub/token contract>, data: <encoded>, value: '0' }])
4. On success: POST /api/bookings { mentor_id, booker_address, tx_hash }
5. window.open(mentor.calendar_link)
6. Show success state
```

### TrustButton flow
```ts
'use client'
// inside click handler:
const { Sdk } = await import('@aboutcircles/sdk');
const sdk = new Sdk();
const avatar = await sdk.getAvatar(myAddress);
await avatar.trust.add(mentorAddress);
```
Wrap in try/catch; show feedback on success/error.

### Admin gate (server-side)
```ts
// In each admin API route and the admin page:
const ADMINS = (process.env.ADMIN_ADDRESSES ?? '').toLowerCase().split(',');
if (!ADMINS.includes(callerAddress.toLowerCase())) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

---

## New Dependencies

```bash
pnpm add better-sqlite3
pnpm add -D @types/better-sqlite3
```

Check transitively for `viem` before adding it for ABI encoding.

---

## Tasks

Tasks are grouped by wave. All tasks within a wave can run in parallel. A wave starts only when every task it depends on is complete.

---

### Wave 0 — No dependencies (start immediately, all in parallel)

**T01 — Install dependencies + database foundation**
- `pnpm add better-sqlite3 && pnpm add -D @types/better-sqlite3`
- Create `lib/schema.sql` (full schema: `skill_tags`, `mentors`, `mentor_skills`, `bookings`)
- Create `lib/db.ts` (open SQLite file, run schema migration on startup, export typed helpers)
- Create `scripts/seed.ts` (seed tags: AI, Dev, Legal, Backend, Data, Image, RoR, Photo; seed mentors: Zet, Flo, Dimitry, Vincent)

**T02 — Probe CRC transfer encoding**
- Write a one-off Node probe script (see AGENTS.md pattern) against the live Circles RPC
- Goal: confirm the Hub/token contract address and the exact ABI calldata needed to transfer CRC via `sendTransactions`
- Output: a code comment or inline constant in `components/mentors/PayButton.tsx` with the confirmed encoding

**T03 — Update navigation**
- Edit `lib/nav.ts` to: `Mentors (/)`, `My Calls (/history)`, `Become a Mentor (/mentor/register)`
- Remove `/profile` and `/actions` from nav (leave files on disk)

---

### Wave 1 — Depends on T01

**T04 — API: mentors read**
- `GET /api/mentors` — list active mentors with optional `?skill=` filter; join `mentor_skills` + `skill_tags`
- `GET /api/mentors/[id]` — single mentor with skills array
- _Depends on: T01_

**T05 — API: mentors write**
- `POST /api/mentors` — register new mentor (insert mentor + mentor_skills rows)
- `PATCH /api/mentors/[id]` — edit mentor fields and skills (admin only, wallet-gated)
- `DELETE /api/mentors/[id]` — set `active = 0` (admin only)
- _Depends on: T01_

**T06 — API: bookings**
- `GET /api/bookings?address=0x…` — bookings for one wallet (my calls)
- `GET /api/bookings` (no param, admin only) — all bookings
- `POST /api/bookings` — record a booking `{ mentor_id, booker_address, tx_hash }`
- _Depends on: T01_

**T07 — API: skill tags**
- `GET /api/tags` — list all tags
- `POST /api/tags` — add tag (admin only)
- `DELETE /api/tags/[id]` — remove tag and cascade mentor_skills (admin only)
- _Depends on: T01_

---

### Wave 2 — Depends on Wave 1 tasks (mix, all in parallel)

**T08 — Home page `/`**
- Replace `app/page.tsx`
- Hero text: "Get a call with a mentor, Pay in CRC, help someone get a free bootcamp tuition"
- Filter label: "Which domain do you want help with?"
- `MentorSearch` text input + `SkillFilter` chip row (both filter the client-side list; tags fetched from `/api/tags`)
- 2-column `MentorCard` grid (fetches from `/api/mentors`)
- `MentorCard`: avatar placeholder, name, skill chips, CRC price, link to `/mentor/[id]`
- _Depends on: T04, T07, T03_

**T09 — Mentor detail page `/mentor/[id]`**
- `app/mentor/[id]/page.tsx` — fetches mentor from `/api/mentors/[id]`
- `MentorDetail`: back button, mentor name, circular-avatar skill badges row, bio
- `SlotPicker`: static visual time-slot grid; selecting a slot enables the PAY button
- `PayButton`: enabled only after slot selected; uses CRC encoding from T02; calls `sendTransactions`; if SDK doesn't surface a clear balance error natively, show toast "Not enough CRC"; on success POSTs to `/api/bookings` then opens `mentor.calendar_link`
- _Depends on: T04, T06, T02_

**T10 — Register page `/mentor/register`**
- `app/mentor/register/page.tsx`
- `RegisterForm`: name, bio, skills multi-select (from `/api/tags`), Google Cal link input, CRC price input
- Guard: wallet must be connected; submit POSTs to `/api/mentors`
- Success: redirect to `/mentor/[newId]`
- _Depends on: T05, T07_

**T11 — History page `/history`**
- `app/history/page.tsx`
- Fetches `/api/bookings?address=<connectedAddress>`
- `BookingHistory`: list of booking cards — mentor avatar, name, skill chips, date
- `TrustButton` per card: dynamically imports `@aboutcircles/sdk`, calls `avatar.trust.add(mentorAddress)`
- _Depends on: T06_

**T12 — Admin page `/admin`**
- `app/admin/page.tsx` — wallet-gated to `ADMIN_ADDRESSES` env var; shows 403 message otherwise
- `AdminMentorTable`: list all mentors (including inactive), edit name/bio/skills/price/cal link inline, suspend/restore toggle
- `AdminBookingTable`: all bookings — booker address, mentor name, tx hash, date; no edit
- `AdminTagManager`: add new tag (text input + submit), remove tag (with warning: cascades off all mentors), tag usage count
- _Depends on: T05, T06, T07_

---

### Wave 3 — Depends on Wave 2

**T13 — Circles avatar enrichment**
- On `MentorCard` (home) and `MentorDetail` (detail page): after initial render, call `sdk.rpc.profile.getProfileView(mentor.circles_address)` client-side
- Replace avatar placeholder with Circles profile image if `avatarInfo` exists; degrade silently if not
- _Depends on: T08, T09_

**T14 — Lint, build, deploy**
- `pnpm lint` — fix all ESLint errors
- `pnpm build` — confirm all routes appear in prerender output
- `pnpm dev` smoke test: browse, filter, mentor detail, register form, history, admin
- Deploy to VPS (SQLite) or Vercel + Turso migration
- `pkill -f "next dev"` when done
- _Depends on: T08, T09, T10, T11, T12, T13_
