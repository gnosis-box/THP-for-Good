# Useful links — THP for Good

Central index of project, product, and ecosystem URLs.  
**Maintenance:** when a new GitHub issue or deploy URL is created, add it here and in [`PRD-MVP.md`](PRD-MVP.md) § L4 if it is a tracked feature.

---

## Project management

| Resource | URL |
|----------|-----|
| **GitHub repository** | https://github.com/gnosis-box/THP-for-Good |
| **Project board (Kanban)** | https://github.com/orgs/gnosis-box/projects/1/views/1 |
| **Open issues** | https://github.com/gnosis-box/THP-for-Good/issues |
| **New issue (chooser)** | https://github.com/gnosis-box/THP-for-Good/issues/new/choose |
| **Pull requests** | https://github.com/gnosis-box/THP-for-Good/pulls |

### Workflow (from [`AGENTS.md`](../AGENTS.md))

| Column | Meaning |
|--------|---------|
| Triage → Ready → Running → Review → Blocked → Done | Issue lifecycle |
| `decision` label | `DIV-*` — product choice, no code |
| `implementation` label | `IMPL-*` — code changes |

---

## Deployments & environments

| Environment | URL | Notes |
|-------------|-----|-------|
| **Dev** | https://dev.thp.gnosis.box | Coolify; SQLite volume on `/app/data` |
| **Circles playground + dev** | https://circles.gnosis.io/playground?url=https://dev.thp.gnosis.box | Wallet, PAY, TRUST |
| **Local dev** | http://localhost:3000 | `pnpm dev`; “Not connected” outside host is expected |

---

## Product spec (repo)

| Document | Path / link |
|----------|-------------|
| **PRD MVP (source of truth index)** | [`spec/PRD-MVP.md`](PRD-MVP.md) |
| UI redesign decisions | [`spec/UI-REDESIGN.md`](UI-REDESIGN.md) |
| Design tokens | [`spec/design-tokens.md`](design-tokens.md) |
| Seed data (admins + mentors) | [`spec/seed.md`](seed.md), [`scripts/seed.ts`](../scripts/seed.ts) |
| UI mockup | [`spec/mockup.png`](mockup.png) |
| shadcn inventory | [`spec/UI-SHADCN-INVENTORY.md`](UI-SHADCN-INVENTORY.md) |
| cal.diy spike | [`docs/spike-cal-diy.md`](../docs/spike-cal-diy.md) |

### App routes (target)

| Route | Purpose |
|-------|---------|
| `/` | Expert browser (home) |
| `/mentor/[id]` | Book / PAY flow |
| `/mentor/register` | Offer expertise (self-register) |
| `/calls` | Emitted + Received sessions; post-call TRUST |
| `/admin` | Admin panel (hidden from public nav) |
| `/about` | Product explainer |

---

## L4 backlog — new issues (2026-05-21)

| ID | Title | Issue |
|----|-------|-------|
| **FEAT-L4-03** | Analytics & statistics (planning epic) | [#61](https://github.com/gnosis-box/THP-for-Good/issues/61) |
| **FEAT-L4-04** | In-app “Report issue” + GitHub templates | [#62](https://github.com/gnosis-box/THP-for-Good/issues/62) |
| **IMPL-L4-06** | Expert card trust status & two-way trust | [#63](https://github.com/gnosis-box/THP-for-Good/issues/63) |

### Related L4 / spikes (existing)

| Issue | Topic |
|-------|-------|
| [#53](https://github.com/gnosis-box/THP-for-Good/issues/53) | SPIKE-L4-02 — trust-eligible CRC at booking |
| [#31](https://github.com/gnosis-box/THP-for-Good/issues/31) | SPIKE-L4-01 — cal.diy feasibility |
| [#57](https://github.com/gnosis-box/THP-for-Good/issues/57) | DIV-L4-UI — dark theme + booking UX |

---

## Circles / Gnosis ecosystem

| Resource | URL |
|----------|-----|
| Circles (about) | https://aboutcircles.com |
| Circles playground | https://circles.gnosis.io/playground |
| Circles RPC (Gnosis Chain) | https://rpc.aboutcircles.com/ |
| Gnosis Chain | https://www.gnosis.io/ |
| Miniapps marketplace PR | https://github.com/aboutcircles/CirclesMiniapps |
| NPM `@aboutcircles/miniapp-sdk` | https://www.npmjs.com/package/@aboutcircles/miniapp-sdk |
| NPM `@aboutcircles/sdk` | https://www.npmjs.com/package/@aboutcircles/sdk |

### On-chain / config (MVP)

| Item | Value |
|------|-------|
| Foundation treasury (split PAY) | `0x2b5E4045936ef12250a8c01e4Cbf71E9bEE69e00` |
| Chain ID | `100` (Gnosis) |

---

## GitHub issue templates (repo)

After merge to default branch:

| Template | File |
|----------|------|
| Bug report | [`.github/ISSUE_TEMPLATE/bug_report.yml`](../.github/ISSUE_TEMPLATE/bug_report.yml) |
| Feature request | [`.github/ISSUE_TEMPLATE/feature_request.yml`](../.github/ISSUE_TEMPLATE/feature_request.yml) |
| User feedback (in-app) | [`.github/ISSUE_TEMPLATE/user_feedback.yml`](../.github/ISSUE_TEMPLATE/user_feedback.yml) |
| Config | [`.github/ISSUE_TEMPLATE/config.yml`](../.github/ISSUE_TEMPLATE/config.yml) |

Suggested env for in-app link (see [#62](https://github.com/gnosis-box/THP-for-Good/issues/62)):

```bash
NEXT_PUBLIC_GITHUB_ISSUES_URL=https://github.com/gnosis-box/THP-for-Good/issues/new/choose
```

---

## Dev commands

```bash
pnpm dev      # http://localhost:3000
pnpm build    # production build
pnpm lint     # ESLint
pnpm start    # run production server locally
```

Seed DB (local):

```bash
pnpm tsx scripts/seed.ts
```

---

## Key code references (trust & stats)

| Area | Location |
|------|----------|
| Trust button (`/calls`) | [`components/bookings/TrustButton.tsx`](../components/bookings/TrustButton.tsx) |
| Expert card (trustedBy count) | [`components/mentors/MentorCard.tsx`](../components/mentors/MentorCard.tsx) |
| Trust-eligible CRC panel | [`components/booking/TrustPathPanel.tsx`](../components/booking/TrustPathPanel.tsx) |
| Admin panel | [`components/admin/AdminPanel.tsx`](../components/admin/AdminPanel.tsx) |
| DB schema | [`lib/schema.sql`](../lib/schema.sql) |
| API routes | [`app/api/`](../app/api/) |

---

## External scheduling (post-MVP)

| Service | URL |
|---------|-----|
| cal.diy (Cal.com CE) install docs | https://www.cal.diy/installation |
| Google Calendar (manual link today) | per-expert `calendar_link` in DB |

---

*Last updated: 2026-05-21 — issues #61–#63, GitHub templates, useful-links index.*
