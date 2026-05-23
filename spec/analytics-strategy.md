# Analytics & statistics strategy — THP for Good

Planning document for [FEAT-L4-03 #61](https://github.com/gnosis-box/THP-for-Good/issues/61).  
**Status:** draft — pending `DIV-L4-03` tool choices and `IMPL-L4-*` breakdown.

**Core principle:** CRC volume, payment splits, treasury inflows, and TRUST edges are **on-chain facts**. SQLite and Umami add **context** (who booked whom, which skill, UX funnel) — they must not be the source of truth for money metrics.

---

## 1. Goals

| Audience | Needs |
|----------|--------|
| **Foundation / admin** | **On-chain** CRC volume, expert vs treasury legs, treasury org balance, trust graph growth |
| **Experts** (optional v2) | **On-chain** CRC received, trusts received (`trustStats`) |
| **Product** | Funnel browse → PAY → TRUST (Umami); off-chain booking intent vs confirmed txs |
| **Hackathon / Gnosis** | Public, verifiable dashboards — Dune + Circles explorer |

---

## 2. Source-of-truth model

```
                    ┌─────────────────────────────────────┐
                    │     ON-CHAIN (primary)              │
                    │  Dune · Circles RPC · Explorer      │
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
| **TRUST edges** | `TrustRelations` (Circles RPC / Dune) | `trust_attestations` audit row |
| **Treasury balance** | Org avatar `getProfileView` / RPC | — |
| **Booking count (paid)** | Count distinct `tx_hash` on-chain | SQLite rows with non-null `tx_hash` |
| **Top experts by CRC** | Aggregate transfers **to** expert addresses | Map address → `mentors` table |
| **Tags / skills** | — | SQLite only |
| **Page funnel** | — | Umami only |

---

## 3. Recommended stack

| Layer | Tool | Role | Phase |
|-------|------|------|-------|
| **On-chain BI** | **[Dune Analytics](https://dune.com/)** | CRC volume, split legs, treasury, public hackathon dashboard | **1** |
| **Live chain reads** | **Circles RPC** + **Explorer** | Balances, trust state, tx detail, path viewer | **1** |
| **Web analytics** | **[Umami](https://umami.is/)** | Pages, referrers, UX events (not CRC totals) | **1** |
| **Admin UI** | **`/admin/stats`** | Embeds / proxies on-chain KPIs + SQLite enrichment | **1** |
| **Deep product** | PostHog (optional) | Only if Umami insufficient | **3** |
| **Ops** | Grafana (homelab) | Uptime, 5xx — not CRC | parallel |

SQLite **`SUM(price_crc)` is deprecated as a KPI** — use only for “listed price” or reconciliation warnings when chain ≠ DB.

---

## 4. On-chain data sources

### 4.1 Addresses to index

| Role | Address | Analytics use |
|------|---------|---------------|
| **Treasury org (PAY leg)** | `0xc02D5aaCA64dE428D571dA42538232C431E0CDeD` | Inbound CRC from split PAY + donations ([`FOUNDATION_ADDRESS`](../lib/crc-pay.ts)) |
| **THP Circles group** | `0x2b5E4045936ef12250a8c01e4Cbf71E9bEE69e00` | Membership, group policy ([`useful-links.md`](useful-links.md)) |
| **Expert avatars** | `mentors.circles_address` | Per-expert inbound CRC from bookings |

### 4.2 Tools & endpoints

| Tool | URL | Use for |
|------|-----|---------|
| **Dune — Gnosis overview** | https://dune.com/gnosischain_team/gnosis-app-overview | Starting queries, ecosystem patterns |
| **Circles explorer (tx)** | https://explorer.aboutcircles.com/tx/{hash} | Already linked from `/calls` (`tx_hash`) |
| **Circles explorer (avatar)** | https://explorer.aboutcircles.com/avatar/{address}/graph | Trust graph, CRC flow per expert/org |
| **Circles RPC** | https://rpc.aboutcircles.com/ | `circles_query` → `V_Crc.TrustRelations`, profile views |
| **Trust path viewer** | https://data.aboutcircles.com/path-viewer | Path capacity / trust-bound transfers |
| **Flow visualization** | https://flow-viz-bm3ge.ondigitalocean.app/flow-visualization/ | CRC flow diagrams (reference UX) |
| **Group checker** | https://aboutcircles.github.io/CirclesTools/groupChecker.html | Verify group treasury / fee config |
| **GnosisScan** | https://gnosisscan.io/ | Raw L2 txs if Circles indexer lags |

### 4.3 What each PAY stores today

[`buildSplitPayTransactions`](../lib/crc-pay.ts) emits **one `sendTransactions` batch** with up to two legs:

1. `constructAdvancedTransfer(from → FOUNDATION_ADDRESS, foundationWei)`
2. `constructAdvancedTransfer(from → mentor, mentorWei)` (if share > 0)

[`PayButton`](../components/mentors/PayButton.tsx) persists **`bookings.tx_hash`** — the join key between app and chain.

**Dune strategy:** index transfers where `from` = booker Safes and `to` ∈ {`0xc02D…`, expert addresses from a Dune dimension table synced from `mentors.circles_address`}.

### 4.4 TRUST on-chain

| Signal | Source |
|--------|--------|
| Trust edge booker → expert | `circles_query` / Dune on `TrustRelations` |
| Trust tx hash (optional) | Extend `POST /api/trust` to store `trust_tx_hash` ([`schema.sql`](../lib/schema.sql) column exists) |
| Mutual / two-way | Bidirectional query (same as [`TrustButton`](../components/bookings/TrustButton.tsx)) |

### 4.5 Server-side chain reads (in-app)

For `/admin/stats` without waiting on Dune refresh:

```ts
// Pattern: enrich booking rows from chain
for (const b of bookingsWithTxHash) {
  // Circles explorer API or RPC — decode transfer amounts per leg
  // Compare to mentors.price_crc + mentor_share_percent
}
```

Cache results (5–15 min TTL) to avoid hammering RPC. Long-term: **materialized view** fed by Dune API or nightly indexer job.

---

## 5. Dune — primary financial dashboard

**Phase 1 deliverable** (not Phase 2): public dashboard **“THP for Good — on-chain activity”**.

### Suggested queries / widgets

| Widget | On-chain logic |
|--------|----------------|
| **Total CRC to treasury org** | Sum transfers → `0xc02D…` over time |
| **CRC to experts** | Sum transfers → known mentor addresses |
| **Split ratio (actual)** | Expert leg / (expert + treasury) per tx or aggregate |
| **Paid sessions (tx count)** | Distinct txs matching split-pay pattern from bookers |
| **Donations** | Transfers → org excluding known booking batch pattern |
| **Trust edges created** | New `TrustRelations` where trustee ∈ experts |
| **Top experts by CRC received** | Group by `to` address, join names off-chain |

### Off-chain join (optional Dune spell)

Export `mentors(circles_address, name)` as Dune **seed CSV** or API upload — maps addresses to human-readable expert names on dashboards.

Reference: [Dune — Gnosis app overview](https://dune.com/gnosischain_team/gnosis-app-overview).

---

## 6. Umami — UX layer only

[Umami](https://umami.is/) tracks **behaviour**, not money:

- Self-host on Coolify ([Umami docs](https://umami.is/docs)), Postgres backend.
- Env: `NEXT_PUBLIC_UMAMI_WEBSITE_ID`, `NEXT_PUBLIC_UMAMI_SCRIPT_URL`.
- **Do not** send CRC amounts as authoritative metrics in Umami — use `pay_success` as **event count** only; financial truth stays on-chain.

| Event | Purpose |
|-------|---------|
| `expert_view` | Funnel top |
| `pay_drawer_open` | Intent |
| `pay_success` | UX conversion (correlate count with on-chain tx count) |
| `trust_click` | UX (compare to new TrustRelations) |

See § 5 in previous draft for deployment / iframe / privacy checklist — unchanged.

---

## 7. In-app `/admin/stats` — hybrid dashboard

Admin-gated ([DIV-L1-07](https://github.com/gnosis-box/THP-for-Good/issues/15)).

### Layout (proposed)

| Panel | Source |
|-------|--------|
| **CRC volume (chain)** | Dune embed iframe **or** `GET /api/admin/stats/onchain` (RPC/cache) |
| **Treasury org balance** | `getProfileView(FOUNDATION_ADDRESS).v2Balance` |
| **Recent PAY txs** | List `bookings` where `tx_hash` set → link to Circles explorer |
| **Reconciliation alert** | SQLite booking without `tx_hash` > 24h, or chain amount ≠ listed price |
| **Tags / active experts** | SQLite only |
| **Umami snapshot** | Link out to Umami dashboard (or iframe if auth allows) |

### API sketch

| Route | Source |
|-------|--------|
| `GET /api/admin/stats/onchain?from=&to=` | RPC + optional Dune API |
| `GET /api/admin/stats/enrichment` | SQLite tags, mentors, booking metadata |
| `GET /api/admin/stats/reconcile` | Diff chain vs DB |

**No `SUM(price_crc)` in API responses** unless labeled `"listed price (off-chain)"`.

---

## 8. Tool comparison (revised)

| Capability | On-chain (Dune/RPC) | SQLite | Umami |
|------------|:-------------------:|:------:|:-----:|
| CRC volume (truth) | ✅ primary | ⚠️ reconcile only | — |
| Split expert / treasury | ✅ | expected % only | — |
| Trust edges | ✅ | audit | — |
| Treasury balance | ✅ | — | — |
| Expert name / skills | join | ✅ | — |
| Page funnel | — | — | ✅ |
| Public verifiable dashboard | ✅ Dune | — | — |

---

## 9. Phased roadmap

### Phase 1 — Hackathon-ready (on-chain first)

| Task | Output |
|------|--------|
| **Dune dashboard** THP for Good | Public CRC / treasury / expert transfers |
| Dune seed: expert addresses | Named widgets |
| `/admin/stats` on-chain panel | RPC balance + tx list + Dune embed |
| Reconciliation job | Flag DB vs chain mismatches |
| Umami deploy + events | UX funnel only |

### Phase 2

| Task | Output |
|------|--------|
| Store `trust_tx_hash` on attest | Full TRUST audit trail |
| Expert self-service stats | On-chain CRC to their avatar |
| Automated Dune → admin cache | Faster admin load |

### Phase 3

| Task | Output |
|------|--------|
| PostHog (optional) | Deep session analytics |
| Real-time indexer | If Dune latency too high for demos |

---

## 10. KPI catalog (on-chain primary)

| KPI | Primary | Enrichment |
|-----|---------|------------|
| CRC volume (total moved) | **Dune / RPC** | — |
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

| # | Question | Proposed |
|---|----------|----------|
| 1 | **On-chain first** for CRC KPIs? | **A) Yes** — Dune + RPC primary; SQLite reconcile only |
| 2 | Dune dashboard visibility | **Public** for hackathon + embed in admin |
| 3 | Umami scope | UX events only; no financial totals |
| 4 | Phase 1 must-ship | **Dune + admin on-chain panel + Umami** |
| 5 | Expert stats Phase 1? | No — admin only; expert tab uses on-chain in Phase 2 |

---

## 12. References

| Resource | URL |
|----------|-----|
| Umami | https://umami.is/ |
| Dune — Gnosis app overview | https://dune.com/gnosischain_team/gnosis-app-overview |
| Circles data / explorer | https://explorer.aboutcircles.com/ |
| Circles RPC | https://rpc.aboutcircles.com/ |
| Epic GitHub | [#61 FEAT-L4-03](https://github.com/gnosis-box/THP-for-Good/issues/61) |
| Useful links | [`spec/useful-links.md`](useful-links.md) |
| PRD L4 | [`spec/PRD-MVP.md`](PRD-MVP.md) § L4 |

---

*Last updated: 2026-05-21 — on-chain first for CRC/financial metrics; Umami for UX only.*
