# Analytics & statistics strategy — THP for Good

Planning document for [FEAT-L4-03 #61](https://github.com/gnosis-box/THP-for-Good/issues/61).  
**Status:** draft — pending `DIV-L4-03` tool choices and `IMPL-L4-*` breakdown.

---

## 1. Goals

| Audience | Needs |
|----------|--------|
| **Foundation / admin** | Bookings, CRC volume, split expert vs THP treasury, active experts, tag usage, TRUST completion |
| **Experts** (optional v2) | Sessions received, CRC earned (expert leg), trust received |
| **Product** | Funnel browse → profile → PAY → calendar → TRUST; drop-offs; device / referrer |
| **Hackathon / Gnosis** | Public proof of on-chain activity (treasury org `0xc02D…`) |

No single tool covers all layers. This doc defines a **hybrid stack** with **[Umami](https://umami.is/)** as the default **web / product analytics** layer.

---

## 2. Metric families

```
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│  Business KPIs   │   │  Product / UX    │   │  On-chain        │
│  (SQLite)        │   │  (Umami)         │   │  (Dune + RPC)    │
├──────────────────┤   ├──────────────────┤   ├──────────────────┤
│ bookings count   │   │ page views       │   │ CRC to treasury  │
│ CRC totals       │   │ unique visitors  │   │ tx from bookings │
│ split legs       │   │ custom events    │   │ trust txs        │
│ mentors active   │   │ referrers        │   │                  │
│ trust_attestations│  │ bounce / time    │   │                  │
└────────┬─────────┘   └────────┬─────────┘   └────────┬─────────┘
         │                      │                      │
         ▼                      ▼                      ▼
   /admin/stats            Umami dashboard         Dune dashboard
   (in-app)                (self-hosted)           (public optional)
```

---

## 3. Recommended stack (default proposal)

| Layer | Tool | Role | Phase |
|-------|------|------|-------|
| **Web analytics** | **[Umami](https://umami.is/)** | Privacy-focused page views, referrers, custom events | **1** |
| **Business BI** | **In-app `/admin/stats`** | SQL aggregations on `bookings`, `mentors`, `trust_attestations` | **1** |
| **On-chain proof** | **Dune Analytics** | Gnosis Chain queries on treasury org + booking `tx_hash` | **2** |
| **Deep product** | PostHog (optional) | Session funnels, flags — only if Umami + events insufficient | **3** |
| **Ad-hoc BI** | Metabase (optional) | SQL exploration for non-dev admins | **3** |
| **Ops** | Grafana (existing homelab) | HTTP errors, latency, uptime — not business KPIs | parallel |

### Why Umami for web analytics

[Umami](https://umami.is/) is an **open-source, privacy-focused** analytics product:

- **Self-hostable** on Coolify (Docker) — fits THP deploy model ([`spec/deploy.md`](deploy.md)).
- **Lightweight** tracker (~2 KB); no heavy cookie banners for basic EU-friendly use.
- **Custom events** — e.g. `pay_started`, `pay_success`, `trust_clicked` without a full product-analytics suite.
- **Simple dashboards** — pages, referrers, devices, countries, event counts.
- **Website data stays on your infrastructure** when self-hosted (Postgres backend).

**Alternatives considered**

| Tool | vs Umami |
|------|----------|
| [Plausible](https://plausible.io/) | Similar privacy model; often SaaS-first; Umami is fully OSS self-host |
| Google Analytics | Free but privacy / iframe / GDPR friction; poor fit for Circles community |
| PostHog | Richer funnels & replay; heavier self-host (Postgres + ClickHouse); defer to Phase 3 |
| Vercel Analytics | Not applicable — app runs on Coolify, not Vercel |

---

## 4. Tool comparison matrix

| Capability | In-app stats | Umami | Dune | PostHog | Metabase |
|------------|:------------:|:-----:|:----:|:-------:|:--------:|
| Bookings / CRC from DB | ✅ | — | — | — | ✅ |
| Split expert / treasury | ✅ | — | partial | — | ✅ |
| Page / route traffic | — | ✅ | — | ✅ | — |
| Custom UX events | partial | ✅ | — | ✅ | — |
| On-chain CRC proof | — | — | ✅ | — | — |
| Self-host on Coolify | ✅ | ✅ | — | ⚠️ heavy | ✅ |
| Admin-only / no extra login | ✅ | separate | public opt | separate | separate |
| Wallet addresses in metrics | ✅ controlled | ⚠️ avoid PII | public chain | hash only | ✅ |

---

## 5. Umami — integration plan

### 5.1 Deployment (Coolify)

1. Deploy Umami from official Docker image ([Umami docs](https://umami.is/docs)).
2. Backend: **PostgreSQL** (dedicated service on Coolify — do not share SQLite with THP app).
3. Hostname example: `https://analytics.thp.gnosis.box` (or internal LAN + Cloudflare tunnel).
4. Create site **“THP for Good — dev”** and **“THP for Good — prod”** with separate website IDs.

### 5.2 Next.js app wiring

Environment variables (add to `.env.example` when implementing):

```bash
# Umami — omit in local dev to disable tracking
NEXT_PUBLIC_UMAMI_WEBSITE_ID=<uuid-from-umami-dashboard>
NEXT_PUBLIC_UMAMI_SCRIPT_URL=https://analytics.thp.gnosis.box/script.js
```

Integration options:

| Approach | Notes |
|----------|--------|
| **`<Script>` in `app/layout.tsx`** | Minimal; load only when env vars set |
| **`@umami/next` package** | Typed `track()` helper if we adopt the official Next helper |

**Do not track in development** unless explicitly testing — gate on `NEXT_PUBLIC_UMAMI_WEBSITE_ID`.

### 5.3 Custom events (product funnel)

| Event name | Trigger | Properties (no raw wallet) |
|------------|---------|----------------------------|
| `expert_view` | `/mentor/[id]` mount | `mentor_id` |
| `pay_drawer_open` | PayButton opens drawer | `mentor_id`, `price_crc` |
| `pay_success` | Tx confirmed | `mentor_id`, `amount_crc` |
| `pay_failed` | Toast insufficient CRC / tx error | `reason` enum |
| `trust_click` | TrustButton on `/calls` | `booking_id` |
| `register_submit` | Expert profile saved | `is_edit` boolean |

Use **`mentor_id` / `booking_id`**, not `circles_address`, in Umami payloads.

### 5.4 Circles iframe caveat

When the app runs inside [Circles playground](https://circles.gnosis.io/playground), the parent frame is `circles.gnosis.io`. Umami still records page URL of the **embedded app origin** (`dev.thp.gnosis.box`) if the script runs inside the iframe — verify in staging:

- Referrer may show `circles.gnosis.io` → useful signal (“miniapp vs standalone”).
- If CSP blocks third-party scripts, host Umami on same site path (reverse proxy `/umami` → Umami) or allowlist in `next.config.ts`.

### 5.5 Privacy checklist

- [ ] Self-hosted Umami; no data sent to Umami Cloud unless explicitly chosen.
- [ ] No wallet addresses in event properties.
- [ ] Optional: anonymize IP in Umami settings.
- [ ] Document in `/about` or privacy note: “We use privacy-friendly analytics (Umami) on our own server.”

---

## 6. In-app `/admin/stats` (business layer)

Admin-gated route extending existing [`/admin`](../app/admin/page.tsx) pattern ([DIV-L1-07](https://github.com/gnosis-box/THP-for-Good/issues/15)).

### 6.1 API

`GET /api/admin/stats?from=&to=` — `isAdminRequest()` only.

Suggested SQL aggregates ([`lib/schema.sql`](../lib/schema.sql)):

| Metric | Source |
|--------|--------|
| Total bookings | `COUNT(*)` on `bookings` |
| CRC volume | `SUM(mentors.price_crc)` joined on `mentor_id` |
| Expert leg / treasury leg | computed from `mentors.mentor_share_percent` + price |
| Bookings over time | `GROUP BY date(created_at)` |
| Top experts by bookings | `GROUP BY mentor_id` |
| Active experts | `mentors.active = 1` |
| TRUST recorded | `COUNT(*)` on `trust_attestations` |
| Tag popularity | join `mentor_skills` + `skill_tags` |

### 6.2 UI

- Reuse shadcn **`chart`** ([`spec/UI-SHADCN-INVENTORY.md`](UI-SHADCN-INVENTORY.md) — deferred for MVP, enabled here).
- Cards: totals + line chart (bookings/day) + bar chart (top tags / experts).
- Export CSV button (optional Phase 1b).

### 6.3 Expert self-service (Phase 2)

Filtered stats where `mentors.circles_address = wallet` — separate route or tab, not mixed with foundation admin view.

---

## 7. On-chain analytics (Dune)

Complement app DB with chain truth:

- Treasury org: `0xc02D5aaCA64dE428D571dA42538232C431E0CDeD` ([`lib/crc-pay.ts`](../lib/crc-pay.ts)).
- Join off-chain: export `bookings.tx_hash` periodically or query known contract patterns.

Reference: [Dune — Gnosis app overview](https://dune.com/gnosischain_team/gnosis-app-overview) ([`useful-links.md`](useful-links.md)).

**Deliverable:** one public dashboard “THP for Good — treasury & activity” for hackathon demos.

---

## 8. Phased roadmap

### Phase 1 — Hackathon-ready

| Task | Issue type | Output |
|------|------------|--------|
| Umami on Coolify + script in layout | `IMPL-L4-03a` | Live traffic on dev/prod |
| Umami custom events (PAY, TRUST) | `IMPL-L4-03b` | Funnel events in Umami |
| `/admin/stats` + API | `IMPL-L4-03c` | Business KPIs in app |

### Phase 2 — Post-hackathon

| Task | Output |
|------|--------|
| Dune dashboard | On-chain CRC proof |
| Expert stats tab | Self-service for experts |
| CSV export / weekly email | Foundation reporting |

### Phase 3 — If scale demands

| Task | Output |
|------|--------|
| PostHog OR Metabase | Deeper funnels or ad-hoc BI |
| Correlate Umami events + SQLite booking IDs | Single funnel truth |

---

## 9. KPI catalog

| KPI | Primary source | Secondary |
|-----|----------------|-----------|
| Page views / uniques | Umami | — |
| Expert profile views | Umami `expert_view` | — |
| PAY attempts / success | Umami + SQLite `bookings` | Dune `tx_hash` |
| CRC volume (total) | SQLite | Dune treasury |
| CRC to expert vs THP | SQLite (split math) | Dune |
| TRUST after session | SQLite `trust_attestations` | Circles RPC |
| Conversion PAY → TRUST | SQLite join | Umami events |
| Top skills | SQLite tags | — |
| Traffic: playground vs direct | Umami referrer | — |

---

## 10. Open decisions (`DIV-L4-03`)

| # | Question | Options |
|---|----------|---------|
| 1 | Confirm **Umami** as web analytics tool? | A) Umami self-host ✅ proposed · B) Plausible · C) None |
| 2 | Umami hostname | Dedicated subdomain vs path proxy on `dev.thp.gnosis.box` |
| 3 | Phase 1 scope | A) Umami + admin stats · B) admin stats only · C) Umami only |
| 4 | Expert-facing stats in Phase 1? | A) Admin only · B) Expert tab too |
| 5 | Public dashboard | A) Dune public · B) Admin only · C) Both |

**Proposed default:** 1-A, 2-dedicated subdomain, 3-A, 4-A, 5-C.

---

## 11. References

| Resource | URL |
|----------|-----|
| Umami | https://umami.is/ |
| Umami docs (self-host) | https://umami.is/docs |
| Epic GitHub | [#61 FEAT-L4-03](https://github.com/gnosis-box/THP-for-Good/issues/61) |
| Useful links index | [`spec/useful-links.md`](useful-links.md) |
| PRD L4 backlog | [`spec/PRD-MVP.md`](PRD-MVP.md) § L4 |
| shadcn chart (UI) | [`spec/UI-SHADCN-INVENTORY.md`](UI-SHADCN-INVENTORY.md) |

---

*Last updated: 2026-05-21 — initial strategy; Umami as default web analytics layer.*
