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
| **dev** | https://dev.thp.gnosis.box | Coolify branch `dev`; SQLite volume on `/app/data` |
| **Circles playground + dev** | https://circles.gnosis.io/playground?url=https://dev.thp.gnosis.box | Wallet, PAY, TRUST |
| **Local dev** | http://localhost:3000 | `pnpm dev`; “Not connected” outside host is expected |

---

## Product spec (repo)

| Document | Path / link |
|----------|-------------|
| **PRD MVP (source of truth index)** | [`spec/PRD-MVP.md`](PRD-MVP.md) |
| **Analytics strategy (Umami + `/stats` + Explorer)** | [`spec/analytics-strategy.md`](analytics-strategy.md) |
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
| **FEAT-L4-07** | Expert session languages (spoken & call) | [#64](https://github.com/gnosis-box/THP-for-Good/issues/64) |

### Related L4 / spikes (existing)

| Issue | Topic |
|-------|-------|
| [#53](https://github.com/gnosis-box/THP-for-Good/issues/53) | SPIKE-L4-02 — trust-eligible CRC at booking |
| [#31](https://github.com/gnosis-box/THP-for-Good/issues/31) | SPIKE-L4-01 — cal.diy feasibility |
| [#57](https://github.com/gnosis-box/THP-for-Good/issues/57) | DIV-L4-UI — dark theme + booking UX |

---

### On-chain / config (MVP)

| Role | Address | Used in app |
|------|---------|-------------|
| **THP for Good Circles group** | `0x2b5E4045936ef12250a8c01e4Cbf71E9bEE69e00` | `GROUP_ADDRESS` env → admin **Promote** member list ([`/api/admin/members`](../app/api/admin/members/route.ts)); community **join** link (Metri) |
| **THP for Good organization (treasury leg)** | `0xc02D5aaCA64dE428D571dA42538232C431E0CDeD` | [`FOUNDATION_ADDRESS`](../lib/crc-pay.ts) — split **PAY**, donations ([`DonationSection`](../components/about/DonationSection.tsx)), trust-path simulation sink |
| Chain ID | `100` (Gnosis) | All Circles SDK / RPC calls |

> **Do not conflate group vs org.** The **group** is the Circles membership avatar (who belongs to THP for Good). The **organization** is the treasury sink encoded in booking payments. PRD text that says “foundation `0x2b5E…`” refers to the group name/history; **live PAY code sends the treasury leg to `0xc02D…`**.

---

## THP for Good — Circles identity & onboarding

| Resource | URL | Relevance | Notes |
|----------|-----|-----------|-------|
| **Join THP group (Metri)** | https://app.metri.xyz/0x2b5E4045936ef12250a8c01e4Cbf71E9bEE69e00 | **Core** | Onboarding link for users to join the THP Circles group before trusting / paying within the network |
| **Group explorer (THP group)** | https://explorer.aboutcircles.com/avatar/0x2b5e4045936ef12250a8c01e4cbf71e9bee69e00 | **High** | Public profile, members, trust graph entry point for `0x2b5E…` |
| **Group checker** | https://aboutcircles.github.io/CirclesTools/groupChecker.html | **High** | Verify group config: fee collector, treasury, mint rules — use when debugging split PAY or group policy |
| **Org explorer (treasury org)** | https://explorer.aboutcircles.com/avatar/0xc02d5aac64de428d571da42538232c431e0cded | **High** | Inspect organization avatar that receives the treasury leg in [`crc-pay.ts`](../lib/crc-pay.ts) |

---

## Circles dashboards

| Resource | URL | Relevance | Notes |
|----------|-----|-----------|-------|
| **Circles app dashboard** | https://app.aboutcircles.com/dashboard | **High** | Official wallet / trust / activity UI — reference UX for trust states ([#63](https://github.com/gnosis-box/THP-for-Good/issues/63)) |
| **Lionfish dashboard** | https://lionfish-app-eypqs.ondigitalocean.app/ | **Low** | Third-party / hackathon dashboard on DigitalOcean — not maintained by THP repo; verify before relying on data |
| **Dune — Gnosis app overview** | https://dune.com/gnosischain_team/gnosis-app-overview | **Low** | External ecosystem dashboard only — **not wired in THP** ([#61](https://github.com/gnosis-box/THP-for-Good/issues/61)) |

---

## Trust graph, paths & scores

| Resource | URL | Relevance | Notes |
|----------|-----|-----------|-------|
| **Trust path viewer** | https://data.aboutcircles.com/path-viewer | **Core** | Visualize CRC/trust paths between avatars — same problem space as [`TrustPathPanel`](../components/booking/TrustPathPanel.tsx) / [#53 SPIKE-L4-02](https://github.com/gnosis-box/THP-for-Good/issues/53) |
| **Sybil resistance explainer** | https://data.aboutcircles.com/sybilresistance | **Medium** | Educational — why trust limits matter; good copy reference for `/about` and booking disclaimers |
| **Trust score explorer** | https://aboutcircles.github.io/CirclesTools/trustScoreExplorer.html | **High** | Debug trust scores / reputation between addresses — useful when implementing card trust badges ([#63](https://github.com/gnosis-box/THP-for-Good/issues/63)) |
| **Flow visualization** | https://flow-viz-bm3ge.ondigitalocean.app/flow-visualization/ | **Medium** | CRC flow diagrams — inspiration for [#61](https://github.com/gnosis-box/THP-for-Good/issues/61) analytics, not wired to THP DB |
| **Example trust graphs (team)** | [Max](https://explorer.aboutcircles.com/avatar/0xc9cabd666e282159c88753eda101d7485caada51/graph) · [Paul](https://explorer.aboutcircles.com/avatar/0x2f0476ddad86ccbc4de77e0ae161ddb3d5fd860c/graph) | **Low** | Sandbox avatars for manual trust-path testing — replace with your own wallet in path viewer |

---

## CirclesTools (community ops)

Hub: https://aboutcircles.github.io/CirclesTools/

| Tool | URL | Relevance | Notes |
|------|-----|-----------|-------|
| **Group checker** | https://aboutcircles.github.io/CirclesTools/groupChecker.html | **High** | See above |
| **Trust score explorer** | https://aboutcircles.github.io/CirclesTools/trustScoreExplorer.html | **High** | See above |
| **LBP starter** | https://aboutcircles.github.io/CirclesTools/lbpStarter.html | **Low** | Liquidity Bootstrapping Pool setup for Circles groups — **not** used by THP miniapp MVP; only if THP launches a group token LBP |

---

## Wallets, Safe & dev utilities

| Resource | URL | Relevance | Notes |
|----------|-----|-----------|-------|
| **Gnosis Safe — owners API** | https://safe-transaction-gnosis-chain.safe.global/#/owners/owners_safes_retrieve | **Medium** | Circles miniapp wallets are Safes — lookup safes by owner when debugging `sendTransactions` / PAY failures |
| **CRC auto-minter** | https://github.com/mjadach-iv/crc-auto-minter | **Low** | Community tool to mint CRC on test setups — dev/test only, not production user flow |
| **CirclesUBI (legacy GitHub)** | https://github.com/CirclesUBI | **Low** | Original Circles v1 repo — historical; active SDK is [`aboutcircles`](https://github.com/aboutcircles) |

---

## Circles / Gnosis ecosystem (SDK & docs)

| Resource | URL |
|----------|-----|
| Circles (about) | https://aboutcircles.com |
| Circles playground | https://circles.gnosis.io/playground |
| Circles RPC (Gnosis Chain) | https://rpc.aboutcircles.com/ |
| Circles data / explorer hub | https://explorer.aboutcircles.com/ |
| **Explorer — avatar events** | `https://explorer.aboutcircles.com/avatar/{address}/events?startBlock=` — on-chain CRC activity (no custom indexer) |
| **THP ops avatar events (example)** | https://explorer.aboutcircles.com/avatar/0xC19BC204eb1c1D5B3FE500E5E5dfaBaB625F286c/events?startBlock=46309369 |
| Gnosis Chain | https://www.gnosis.io/ |
| Miniapps marketplace PR | https://github.com/aboutcircles/CirclesMiniapps |
| NPM `@aboutcircles/miniapp-sdk` | https://www.npmjs.com/package/@aboutcircles/miniapp-sdk |
| NPM `@aboutcircles/sdk` | https://www.npmjs.com/package/@aboutcircles/sdk |

### Relevance legend

| Tag | Meaning |
|-----|---------|
| **Core** | Directly supports THP app behaviour, onboarding, or PAY/trust implementation |
| **High** | Admin, debugging, or UX parity with official Circles apps |
| **Medium** | Education, analytics planning, or optional ops |
| **Low** | Historical, third-party, or niche — bookmark only if needed |

---

## GitHub issue templates (repo)

After merge to integration branch `dev`:

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

*Last updated: 2026-05-21 — Circles ecosystem links curated; group vs org addresses clarified.*
