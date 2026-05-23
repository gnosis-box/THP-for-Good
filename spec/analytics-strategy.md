# Analytics & statistics strategy — THP for Good

Planning document for [FEAT-L4-03 #61](https://github.com/gnosis-box/THP-for-Good/issues/61).  
**Status:** Phase 1 **merged to `dev`** (PR [#67](https://github.com/gnosis-box/THP-for-Good/pull/67)). Phase 2 app scope **implemented** on `impl/l4-03-analytics` — pending PR → `dev` + Coolify rebuild. Infra Umami prod : `https://stats.thp.gnosis.box`.

**Core principle:** CRC volume, payment splits, treasury inflows, and TRUST edges are **on-chain facts**. SQLite and Umami add **context** (who booked whom, which skill, UX funnel) — they must not be the source of truth for money metrics.

---

## 1. Goals

| Audience | Needs |
|----------|--------|
| **Foundation / admin** | **On-chain** CRC volume, expert vs treasury legs, treasury org balance, trust graph growth |
| **Experts** (optional v2) | **On-chain** CRC received, trusts received (`trustStats`) |
| **Product** | Funnel browse → PAY → TRUST (Umami); off-chain booking intent vs confirmed txs |
| **Hackathon / Gnosis** | Public, verifiable activity — Circles Explorer + `/stats` |

---

## 2. Source-of-truth model

```
                    ┌─────────────────────────────────────┐
                    │     ON-CHAIN (primary)              │
                    │  Circles RPC · Explorer              │
                    ├─────────────────────────────────────┤
                    │ CRC transferred (per tx / leg)      │
                    │ Split: expert avatar + org 0xc02D…  │
                    │ TrustRelations (trust.add)          │
                    │ Treasury / org CRC balance            │
                    │ Donations → FOUNDATION_ADDRESS      │
                    └──────────────┬──────────────────────┘
                                   │ enrich via tx_hash
                    ┌──────────────▼──────────────────────┐
                    │     OFF-CHAIN (secondary)           │
                    │  SQLite · Umami                     │
                    ├─────────────────────────────────────┤
                    │ mentor_id, skills, slot_label       │
                    │ booker_address (link only)            │
                    │ page views, pay_drawer_open, etc.   │
                    └─────────────────────────────────────┘
```

| Metric type | Primary source | Secondary (enrichment) |
|-------------|----------------|------------------------|
| **CRC volume** | On-chain transfers | SQLite `bookings.tx_hash` → join |
| **Expert vs THP split** | Decode split legs from tx batch | `mentor_share_percent` for expected vs actual |
| **TRUST edges** | `TrustRelations` (Circles RPC) | `trust_attestations` audit row |
| **Treasury balance** | Org avatar `getProfileView` / RPC | — |
| **Booking count (paid)** | Count distinct `tx_hash` on-chain | SQLite rows with non-null `tx_hash` |
| **Top experts by CRC** | Aggregate transfers **to** expert addresses | Map address → `mentors` table |
| **Tags / skills** | — | SQLite only |
| **Page funnel** | — | Umami only |

---

## 3. Recommended stack

| Layer | Tool | Role | Phase |
|-------|------|------|-------|
| **Live chain reads** | **Circles RPC** + **Explorer** | Balances, trust state, tx detail, path viewer | **1** |
| **Web analytics** | **[Umami](https://umami.is/)** | Pages, referrers, UX events (not CRC totals) | **1** |
| **Admin UI** | **`/stats`** (public) | On-chain links + SQLite enrichment; in [`lib/nav.ts`](../lib/nav.ts) NAV | **1** |

SQLite **`SUM(price_crc)` is deprecated as a KPI** — use only for “listed price” or reconciliation warnings when chain ≠ DB.

---

## 4. On-chain data sources

### 4.1 Per-avatar activity — Circles Explorer (no custom indexer)

**We do not need to build or maintain our own on-chain indexer** for CRC transfers and avatar events. [Circles Explorer](https://explorer.aboutcircles.com/) already indexes activity per avatar.

**Events feed (primary drill-down):**

```
https://explorer.aboutcircles.com/avatar/{address}/events?startBlock={block}
```

Example (THP-related avatar — verify role in ops):

https://explorer.aboutcircles.com/avatar/0xC19BC204eb1c1D5B3FE500E5E5dfaBaB625F286c/events?startBlock=46309369

| Query param | Use |
|-------------|-----|
| `{address}` | Org, group, expert, or app avatar |
| `startBlock` | Cut noise before THP launch / hackathon (set once, document in env or spec) |

**Other explorer routes (same indexer, no app code):**

| Route | Use |
|-------|-----|
| `/avatar/{address}` | Profile, balance summary |
| `/avatar/{address}/events` | Transfers, trust, mint — **CRC volume per address** |
| `/avatar/{address}/graph` | Trust graph |
| `/tx/{hash}` | Single PAY batch detail (join with `bookings.tx_hash`) |

**Implication for `/stats` (public):** link out to explorer events for treasury org, group, and each expert — do not replicate event ingestion in SQLite or a custom job.

### 4.2 Watch addresses (links only — not a local index)

| Role | Address | Explorer events |
|------|---------|-----------------|
| **Treasury org (PAY leg)** | `0xc02D5aaCA64dE428D571dA42538232C431E0CDeD` | [events](https://explorer.aboutcircles.com/avatar/0xc02d5aac64de428d571da42538232c431e0cded/events) — split PAY + donations ([`FOUNDATION_ADDRESS`](../lib/crc-pay.ts)) |
| **THP Circles group** | `0x2b5E4045936ef12250a8c01e4Cbf71E9bEE69e00` | [events](https://explorer.aboutcircles.com/avatar/0x2b5e4045936ef12250a8c01e4cbf71e9bee69e00/events) — membership / group activity |
| **Expert avatars** | `mentors.circles_address` | `/avatar/{address}/events` — one link per expert from admin |
| **THP app / ops avatar** (example) | `0xC19BC204eb1c1D5B3FE500E5E5dfaBaB625F286c` | [events from block 46309369](https://explorer.aboutcircles.com/avatar/0xC19BC204eb1c1D5B3FE500E5E5dfaBaB625F286c/events?startBlock=46309369) — confirm ownership in triage |

### 4.3 Tools & endpoints

| Tool | URL | Use for |
|------|-----|---------|
| **Circles explorer — events** | `…/avatar/{address}/events?startBlock=` | **Default** per-address CRC / activity (no custom indexer) |
| **Circles explorer (tx)** | https://explorer.aboutcircles.com/tx/{hash} | Already linked from `/calls` (`tx_hash`) |
| **Circles RPC** | https://rpc.aboutcircles.com/ | Live balance (`getProfileView`), `TrustRelations` for trust UI |
| **Trust path viewer** | https://data.aboutcircles.com/path-viewer | Path capacity / trust-bound transfers |
| **Group checker** | https://aboutcircles.github.io/CirclesTools/groupChecker.html | Verify group treasury / fee config |
| **GnosisScan** | https://gnosisscan.io/ | Raw L2 fallback if explorer lags |

### 4.4 What each PAY stores today

[`buildSplitPayTransactions`](../lib/crc-pay.ts) emits **one `sendTransactions` batch** with up to two legs:

1. `constructAdvancedTransfer(from → FOUNDATION_ADDRESS, foundationWei)`
2. `constructAdvancedTransfer(from → mentor, mentorWei)` (if share > 0)

[`PayButton`](../components/mentors/PayButton.tsx) persists **`bookings.tx_hash`** — deep link to [`/tx/{hash}`](https://explorer.aboutcircles.com/) for leg detail; org/expert totals live on each avatar **`/events`** page.

### 4.5 TRUST on-chain

| Signal | Source |
|--------|--------|
| Trust edge booker → expert | Circles RPC / `TrustRelations` |
| Trust tx hash (optional) | Extend `POST /api/trust` to store `trust_tx_hash` ([`schema.sql`](../lib/schema.sql) column exists) |
| Mutual / two-way | Bidirectional query (same as [`TrustButton`](../components/bookings/TrustButton.tsx)) |

### 4.6 In-app reads (minimal)

| Need | Approach |
|------|----------|
| Treasury balance on admin home | One RPC `getProfileView(FOUNDATION_ADDRESS)` |
| Per-booking detail | Link to explorer `/tx/{tx_hash}` — already on `/calls` |
| Per-expert / org CRC history | **Link** to explorer `/avatar/…/events` — no ingestion |
| Reconciliation | Compare SQLite `tx_hash` + listed price vs explorer tx page |

Avoid building a server loop that re-indexes explorer events.

---

## 5. Dune — out of scope

**Removed from THP (2026-05-23).** Circles Explorer per-avatar `/events` + RPC balances on `/stats` are sufficient; Dune added ops cost without distinct value for this MVP.

External reference only (not wired in app): [Gnosis app overview on Dune](https://dune.com/gnosischain_team/gnosis-app-overview).

---

## 6. Umami — UX layer only

[Umami](https://umami.is/) tracks **behaviour**, not money:

- **Single prod instance** on Coolify env **production**: `https://stats.thp.gnosis.box` — all deploy envs (mestryx, dev, staging, …) use the **same** `NEXT_PUBLIC_UMAMI_*` (one website, hostname distinguishes envs in Umami)
- Env (app): `NEXT_PUBLIC_UMAMI_WEBSITE_ID`, `NEXT_PUBLIC_UMAMI_SCRIPT_URL`, `NEXT_PUBLIC_UMAMI_DASHBOARD_URL`, `NEXT_PUBLIC_UMAMI_SHARE_URL` (public read-only link on `/stats`)
- **Public share URL (prod):** `https://stats.thp.gnosis.box/share/JAi7kUoC7s6BvPah` — set as `NEXT_PUBLIC_UMAMI_SHARE_URL` on all Coolify app envs (build-time) ; admin login stays on `DASHBOARD_URL`
- **Do not** send CRC amounts as authoritative metrics in Umami — use `pay_success` as **event count** only; financial truth stays on-chain.

| Event | Purpose | Implementation |
|-------|---------|----------------|
| `expert_view` | Funnel top | [`MentorDetail.tsx`](../components/mentors/MentorDetail.tsx) |
| `pay_drawer_open` | Intent | [`MentorDetail.tsx`](../components/mentors/MentorDetail.tsx) drawer |
| `pay_success` | UX conversion | [`PayButton.tsx`](../components/mentors/PayButton.tsx) |
| `trust_click` | UX | [`TrustButton.tsx`](../components/bookings/TrustButton.tsx) |

**App code:** [`lib/analytics-umami.ts`](../lib/analytics-umami.ts), [`components/analytics/UmamiScript.tsx`](../components/analytics/UmamiScript.tsx), CSP via [`lib/csp-umami.ts`](../lib/csp-umami.ts).

**Deploy:** Umami Docker on Coolify + dedicated Postgres; gate script on `NEXT_PUBLIC_UMAMI_WEBSITE_ID`. Inside Circles iframe, CSP allows the analytics host when env is set at build time. No wallet addresses in event payloads.

---

## 7. Public `/stats` dashboard

**Public** transparency page (not admin-gated). In [`lib/nav.ts`](../lib/nav.ts) NAV as **Stats**; also linked from `/about` and `/admin`.

### Layout (implemented)

| Panel | Source | Phase 1 |
|-------|--------|:-------:|
| **Treasury org balance** | RPC `getProfileView(FOUNDATION_ADDRESS).v2Balance` via `GET /api/stats` | ✅ |
| **CRC activity (org, group, experts)** | Deep links → [Circles Explorer `/events`](https://explorer.aboutcircles.com/) per address (`THP_ANALYTICS_START_BLOCK`) | ✅ |
| **Recent PAY txs** | SQLite `bookings` with `tx_hash` → explorer `/tx/{hash}` (no booker address) | ✅ |
| **Reconciliation alert** | Count only: bookings without `tx_hash` > 24h | ✅ |
| **Tags / active experts** | SQLite aggregates (labeled off-chain) | ✅ |
| **Umami** | Share iframe + link on `/stats` | ✅ |
| **Group CRC balance** | RPC `getProfileView(GROUP_ADDRESS)` | ✅ |
| **Expert CRC balances** | RPC per active expert (`THP_STATS_MAX_EXPERT_BALANCES`) | ✅ |

### API

| Route | Auth | Source |
|-------|------|--------|
| `GET /api/stats` | Public | Treasury + group RPC, expert balances, explorer URLs, enrichment, reconcile |
| `GET /api/me/stats` | Wallet header (`x-wallet-address`) | Expert self-service stats (active mentors only) |
| `POST /api/trust` | Public | Persists `trust_attestations` (+ optional `trust_tx_hash`) |

Implementation: [`app/api/stats/route.ts`](../app/api/stats/route.ts), [`app/api/me/stats/route.ts`](../app/api/me/stats/route.ts), [`lib/analytics-explorer.ts`](../lib/analytics-explorer.ts), [`components/stats/StatsDashboard.tsx`](../components/stats/StatsDashboard.tsx), [`components/profile/ExpertStatsPanel.tsx`](../components/profile/ExpertStatsPanel.tsx).

No custom on-chain indexer. **No `SUM(price_crc)` as KPI.** Reconcile detail with wallet addresses remains admin-only future work if needed.

### 7.1 Recommendations — next increments on `/stats`

Priority order (stay **on-chain first** ; no financial KPIs from SQLite/Umami API in-page unless clearly labelled off-chain/UX).

| Priority | Panel / change | Source | Effort |
|----------|----------------|--------|--------|
| **P1** | Show `meta.startBlock` in UI | env + `GET /api/stats` meta | S |
| **P1** | **Group avatar CRC balance** (RPC `getProfileView`) | Same pattern as treasury | S |
| **P2** | **Per-expert CRC balance** (RPC, active experts only) | Circles RPC — public on-chain | M |
| **P2** | **Booking intent** count (bookings sans `tx_hash`, all ages) | SQLite — label « off-chain intent » | S |
| **P3** | Umami **share dashboard** iframe | Umami share URL + CSP `frame-src` | S |
| **—** | Do **not** expose `booker_address`, Umami API keys, or `SUM(price_crc)` on public `/stats` | Privacy / doctrine | — |

**Already public and sufficient for hackathon transparency:** treasury balance, explorer deep links (org / group / experts / txs), off-chain snapshot (counts, tags), reconcile warning (count only), Umami public share link.

### 7.2 Next sprint — branch `impl/l4-03-analytics`

Continue on this branch **before** rebase/merge to `dev` (blocked until team resolves `dev` branch sync). Order:

| Lot | Task | Output | Status |
|-----|------|--------|:------:|
| **0 — Hygiene** | Commit Umami share URL + doc | `getUmamiShareUrl()`, `.env.example`, ui-copy | ⬜ commit |
| **0 — Ops** | `NEXT_PUBLIC_UMAMI_SHARE_URL` on all Coolify THP apps + rebuild | Link live on mestryx → dev → prod after merge | ⬜ |
| **1 — P1 on-chain** | Group CRC balance (RPC) | `group.balanceCrc` in `GET /api/stats` + UI | ✅ |
| **1 — P1 UX** | Show `meta.startBlock` in UI | « Analytics depuis le block … » | ✅ |
| **2 — P2 off-chain** | Booking intent count | `bookingIntentCount` in enrichment, labelled off-chain | ✅ |
| **2 — P2 on-chain** | Expert CRC balances (active only) | RPC per expert ; cap via `THP_STATS_MAX_EXPERT_BALANCES` | ✅ |
| **3 — P3** | Umami iframe on `/stats` | Share URL iframe + CSP | ✅ |
| **C — Phase 2** | `trust_tx_hash` + `POST /api/trust` | [`TrustButton`](../components/bookings/TrustButton.tsx) | ✅ |
| **D — Phase 2** | Expert stats `/profile` | `GET /api/me/stats` | ✅ |

### 7.3 Phase 1 definition of done

| Done | Criterion |
|:----:|-----------|
| ✅ | Umami share committed + env documented |
| ⬜ | `NEXT_PUBLIC_UMAMI_SHARE_URL` on all Coolify apps + rebuild |
| ✅ | Active expert CRC balances |
| ⬜ | Smoke test dev/prod `/stats` |
| ✅ | PR [#67](https://github.com/gnosis-box/THP-for-Good/pull/67) merged to `dev` |
| ⬜ | Phase 2 PR merged + prod rebuild |
| ✅ | `trust_tx_hash` persistence |
| ✅ | Expert self-service stats on `/profile` |

---

## 8. Tool comparison (revised)

| Capability | On-chain (RPC/Explorer) | SQLite | Umami |
|------------|:-----------------------:|:------:|:-----:|
| CRC volume (truth) | ✅ primary | ⚠️ reconcile only | — |
| Split expert / treasury | ✅ | expected % only | — |
| Trust edges | ✅ | audit | — |
| Treasury balance | ✅ | — | — |
| Expert name / skills | join | ✅ | — |
| Page funnel | — | — | ✅ |
| Public verifiable activity | ✅ Explorer links on `/stats` | — | share iframe |

---

## 9. Phased roadmap

### Phase 1 — Hackathon-ready (on-chain first)

| Done | Task | Output |
|:----:|------|--------|
| ✅ | Explorer deep links in **`/stats`** | Org, group, each expert `/events?startBlock=` |
| ✅ | Document `THP_ANALYTICS_START_BLOCK` env | Coolify + `.env.example` ; exposed in `GET /api/stats` `meta.startBlock` |
| ✅ | **`/stats`** enrichment + reconcile | SQLite tags, paid count, recent txs, pending `tx_hash` > 24h (count only, public) |
| ✅ | **`GET /api/stats`** public | No `booker_address`, no `SUM(price_crc)` |
| ✅ | Nav + discovery | **Stats** in [`lib/nav.ts`](../lib/nav.ts) ; links from `/about`, `/admin` |
| ✅ | Umami app code | Script, CSP, events (`expert_view`, `pay_drawer_open`, `pay_success`, `trust_click`) |
| ✅ | Umami infra prod | Single instance `stats.thp.gnosis.box` ; shared `NEXT_PUBLIC_UMAMI_*` on all Coolify apps |
| ✅ | Umami public share link (code) | `NEXT_PUBLIC_UMAMI_SHARE_URL` — see §6 |
| ✅ | Merge **`impl/l4-03-analytics` → `dev`** | PR [#67](https://github.com/gnosis-box/THP-for-Good/pull/67) |
| ⬜ | Phase 2 follow-up PR → `dev` | Expert balances, Umami iframe, trust_tx, me/stats |
| ⬜ | Tracking live on **prod** | Merge `dev` → `master` + rebuild |

### Phase 2

| Done | Task | Output |
|:----:|------|--------|
| ✅ | Store `trust_tx_hash` on attest | [`POST /api/trust`](../app/api/trust/route.ts) + [`TrustButton`](../components/bookings/TrustButton.tsx) |
| ✅ | Expert self-service stats | [`GET /api/me/stats`](../app/api/me/stats/route.ts) + [`ExpertStatsPanel`](../components/profile/ExpertStatsPanel.tsx) |
| ✅ | Umami iframe embed on `/stats` | Share URL iframe + CSP |

---

## 10. KPI catalog (on-chain primary)

| KPI | Primary | Enrichment |
|-----|---------|------------|
| CRC volume (total moved) | **Explorer / RPC** | — |
| CRC to THP org | **On-chain** → `0xc02D…` | — |
| CRC to experts | **On-chain** → mentor addresses | `mentors.name` |
| Actual split % | **Decode tx legs** | `mentor_share_percent` expected |
| Paid session count | **Distinct PAY txs** | SQLite `bookings.tx_hash` |
| TRUST edges | **TrustRelations** | `trust_attestations` |
| Treasury balance | **getProfileView** | — |
| Booking intent (unpaid) | — | SQLite rows without `tx_hash` |
| Top skills | — | SQLite tags |
| Page views / funnel | — | Umami |
| Playground vs standalone | — | Umami referrer |

---

## 11. Open decisions (`DIV-L4-03`)

| # | Question | Decision |
|---|----------|----------|
| 1 | **On-chain first** for CRC KPIs? | ✅ **Yes** — explorer + RPC ; SQLite reconcile only |
| 2 | Dune | ❌ **Out of scope** — removed from app ; Explorer + RPC sufficient |
| 3 | Umami scope | ✅ UX events only ; no financial totals |
| 4 | Phase 1 must-ship | ✅ **Merged to `dev`** — Phase 2 code on branch pending PR |
| 5 | Expert stats Phase 1? | ✅ No — public `/stats` only ; expert tab Phase 2 |

---

## 12. References

| Resource | URL |
|----------|-----|
| Umami | https://umami.is/ |
| Circles data / explorer | https://explorer.aboutcircles.com/ |
| Circles RPC | https://rpc.aboutcircles.com/ |
| Epic GitHub | [#61 FEAT-L4-03](https://github.com/gnosis-box/THP-for-Good/issues/61) |
| Useful links | [`spec/useful-links.md`](useful-links.md) |
| PRD L4 | [`spec/PRD-MVP.md`](PRD-MVP.md) § L4 |

---

*Last updated: 2026-05-23 — Dune removed ; stack = Explorer + RPC + Umami + `/stats`.*
