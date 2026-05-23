# THP for Good — Complete UI Redesign Brief

| | |
|---|---|
| **Status** | Draft — planning document (no code yet) |
| **Language (UI)** | English ([DIV-L3-03](https://github.com/gnosis-box/THP-for-Good/issues/25)) |
| **Hard constraint** | **Dark theme only** (no light mode in MVP redesign) |
| **Stack** | Next.js 16 · React 19 · Tailwind v4 · shadcn/ui (`base-nova`) · Circles miniapp SDK |
| **Related** | [PRD-MVP.md](./PRD-MVP.md) · [mockup.png](./mockup.png) · [UI-SHADCN-INVENTORY.md](./UI-SHADCN-INVENTORY.md) · [AGENTS.md](../AGENTS.md) |
| **Last updated** | 2026-05-23 |

---

## 1. Executive summary

THP for Good is a **Circles miniapp** for booking mentorship sessions paid in **CRC**, with a **solidarity split** (expert + THP for Good treasury) and **trust-graph–aware** payments. The current UI is functional but reads as a **light-mode boilerplate**: neutral grays, minimal brand, dense text blocks, and payment/trust concepts that are hard to scan on mobile inside an iframe.

This document defines a **full dark-theme redesign** grounded in:

- **Sector:** mentorship / expert marketplaces (Calendly, ADPList, MentorCruise patterns)
- **Platform:** embedded Web3 miniapps (Circles / Gnosis — single-task, wallet-native flows)
- **Tech:** shadcn semantic tokens (OKLCH), mobile-first layout ([DIV-L3-01](https://github.com/gnosis-box/THP-for-Good/issues/23))

**Goal:** feel trustworthy, calm, and “native to Circles” — not a generic admin dashboard or intimidating DeFi terminal.

---

## 2. Product & user context

### 2.1 What the app is

| Dimension | Description |
|-----------|-------------|
| **Job-to-be-done** | Find a THP mentor → pick a slot → pay in CRC → get calendar invite → optionally TRUST expert after call |
| **Differentiator** | Payments route through **Circles trust paths**; split funds **solidarity** (≥50% to THP for Good) |
| **Host** | Loaded in [Circles playground](https://circles.gnosis.io/playground) iframe; wallet injected by host |
| **Audience** | Hackathon demo + THP alumni; mix of Web3-comfortable and first-time Circles users |

### 2.2 Primary flows (must excel)

1. **Discover** — browse/filter mentors by skill tags
2. **Evaluate** — mentor profile, trust signal, price, split transparency
3. **Book** — slot picker + email + PAY (with trust-path simulation)
4. **Post-book** — success state, explorer link, calendar
5. **Calls** — emitted/received bookings, TRUST action
6. **Secondary** — register as mentor, admin promote, profile lookup

### 2.3 Constraints from architecture (non-negotiable)

- **Mobile-first** — header + sheet nav; no persistent desktop sidebar ([DIV-L3-01](https://github.com/gnosis-box/THP-for-Good/issues/23))
- **Outside iframe** — dedicated `OpenInCirclesHint` ([DIV-L3-02](https://github.com/gnosis-box/THP-for-Good/issues/24))
- **English UI** — all runtime copy in EN
- **Iframe CSP** — app must work in constrained viewport (~mobile wallet chrome)
- **No wallet jargon** — “Pay 100 CRC” not “Execute transfer” ([Web3 UX best practice](https://cryptoadventure.com/community/articles/web3-adoption-is-a-design-problem-as-much-as-a-technology-problem/))

---

## 3. Current state audit

### 3.1 Visual baseline

| Area | Today | Gap |
|------|-------|-----|
| **Theme** | `:root` light tokens only in `app/globals.css` | No `.dark` palette; contradicts redesign goal |
| **Typography** | Geist Sans / Mono | Adequate; needs stronger hierarchy scale |
| **Layout** | `AppShell` max-w-4xl, p-4 | OK for mobile; mentor booking could use clearer step rhythm |
| **Components** | shadcn Card, Button, Badge, Sheet | Missing: stepper, alert variants, dedicated “payment summary” pattern |
| **Brand** | Small JPG logo in header | No color story tied to THP / solidarity / Gnosis ecosystem |

### 3.2 UX friction (observed patterns)

| Flow | Issue |
|------|-------|
| **Home** | Grid of cards; filter/search competes with content hierarchy |
| **Mentor detail** | Vertical stack (bio → slots → pay) without progress indicator |
| **PayButton** | Balance + trust simulation + split + email + CTA in one column — cognitively heavy |
| **Trust estimate** | Technical but valuable — needs visual encoding (leg progress, icons) |
| **Admin** | Form-heavy; same visual weight as user flows |
| **Errors** | Improved in `lib/pay-copy.ts` — needs consistent component treatment (Alert, not raw `<p>`) |

### 3.3 What works (keep)

- `MentorCard` trust count + skills + split footer
- Split PAY + post-success panel (tx link, calendar CTA)
- `OpenInCirclesHint` pattern
- Mobile nav with admin gate

---

## 4. Research synthesis — best practices

### 4.1 Circles miniapps ([docs](https://docs.aboutcircles.com/miniapps))

| Principle | Implication for THP |
|-----------|---------------------|
| **One task, done well** | Booking flow is the hero; admin/register are secondary surfaces |
| **Embedded = seamless signing** | Minimize steps between slot selection and `sendTransactions` |
| **Narrow viewport** | Sticky bottom CTA on mentor detail; collapse secondary info |
| **Discoverability** | Strong logo, name, one-line value prop above fold on home |

### 4.2 Mentorship & booking marketplaces

Patterns from Calendly, ADPList, shadcn mentor blocks ([mentor availability](https://www.shadcn.io/blocks/profile-mentor-availability), [booking slots](https://www.shadcn.io/blocks/calendar-booking-slots)):

| Pattern | Apply to THP |
|---------|--------------|
| **Two-panel booking** | Date/list left (or top on mobile), time slots right — already partially in `SlotPicker`; unify visual system |
| **Expert profile hero** | Avatar, name, trust metric, price, primary CTA zone |
| **Session types / pricing** | Single session type MVP — show price + split as structured “session card” |
| **Progressive disclosure** | Wizard or stepper: *Choose time → Details → Review & pay* (Calendly reduced 7→4 steps) |
| **Social proof** | `Trusted by N` prominent; future: reviews / sessions count |
| **Availability clarity** | Empty states when no Cal.com — differentiated copy for mentor vs visitor |

### 4.3 Web3 / wallet UX ([W3AG](https://github.com/nirholas/w3ag), [WCAG 2.2](https://www.w3.org/TR/WCAG22/))

| Rule | Dark-theme implementation |
|------|---------------------------|
| **Plain language** | “Pay”, “Booking confirmed”, “Trust path estimate (simulation)” |
| **State visibility** | Distinct visuals for: connecting, loading RPC, ready, warning, error, success |
| **Never color-only** | Pair amber warnings with icon + text; success with checkmark |
| **Contrast AA** | Body text ≥4.5:1 on `--background`; muted ≥4.5:1 on cards (test OKLCH pairs) |
| **Touch targets** | Min 44×44px for slot chips and nav items |
| **Focus rings** | Visible `--ring` on dark (avoid low-contrast gray rings) |
| **Amount clarity** | CRC amounts tabular; split legs aligned in columns |
| **Simulation ≠ guarantee** | Persistent “simulation” label; no language implying on-chain certainty |

### 4.4 Dark UI — sector fit

Dark mode is standard in **Web3 wallets** (Phantom, Rainbow, Zerion) and reads as **premium / focused** in iframe contexts. Best practices:

- **Layered surfaces**, not flat `#000`: `--background` < `--card` < `--popover` elevation
- **Restrained accent** — one primary hue (THP/Gnosis-aligned) + semantic colors (success, warning, destructive)
- **Subtle borders** — `oklch(1 0 0 / 10%)` pattern from [shadcn dark theme](https://ui.shadcn.com/docs/theming)
- **Low chroma backgrounds** — chroma in accents and interactive states only
- **Reduced glare** for long booking sessions on OLED (Circles mobile host)

---

## 5. Design principles (redesign north star)

1. **Solidarity visible** — split to THP for Good is a feature, not fine print
2. **Trust is legible** — graph complexity abstracted into scannable numbers + progress
3. **Mobile iframe first** — design at 390×844; desktop is centered max-width, not a different product
4. **Progressive trust in UX** — browse without wallet; pay only when needed
5. **Calm dark** — low noise, generous spacing, one primary action per screen region
6. **Accessible by default** — WCAG 2.2 AA target for hackathon demo credibility

---

## 6. Design system proposal

### 6.1 Theme strategy

**Decision:** **Dark-only** — set `class="dark"` on `<html>` permanently; define tokens only under `.dark` (optional `:root` mirror for SSR flash prevention).

Implementation path ([shadcn theming](https://ui.shadcn.com/docs/theming)):

```css
/* app/globals.css — target structure */
.dark {
  --background: oklch(0.13 0.01 260);   /* deep blue-gray */
  --foreground: oklch(0.97 0.01 260);
  --card: oklch(0.17 0.015 260);
  --muted: oklch(0.22 0.015 260);
  --muted-foreground: oklch(0.65 0.02 260);
  --primary: oklch(0.72 0.14 145);        /* solidarity green — tune to brand */
  --primary-foreground: oklch(0.15 0.02 145);
  --border: oklch(1 0 0 / 8%);
  --ring: oklch(0.72 0.14 145 / 60%);
  /* + destructive, warning, success semantic tokens */
}
```

Add semantic extensions (not in default shadcn):

| Token | Use |
|-------|-----|
| `--success` / `--success-foreground` | Booking confirmed, tx success |
| `--warning` / `--warning-foreground` | Trust path shortfall, simulation caveats |
| `--trust` / `--trust-foreground` | Trust graph / TRUST button accent |
| `--crc` / `--crc-foreground` | CRC amounts, payment summary |

### 6.2 Typography scale

| Token | Size | Use |
|-------|------|-----|
| `text-display` | 1.75–2rem / semibold | Mentor name, page titles |
| `text-title` | 1.125rem / semibold | Section headers (Availability, Payment) |
| `text-body` | 0.875–1rem | Bios, descriptions |
| `text-caption` | 0.75rem | Split lines, simulation disclaimers |
| `font-mono` | Geist Mono | Tx hashes, addresses (truncated) |

### 6.3 Spacing & radius

- Keep shadcn `--radius: 0.625rem`; use **`rounded-xl`** for cards, **`rounded-lg`** for inputs
- Section gap: **`gap-6`** on detail pages; **`gap-3`** inside payment panel
- Card padding: **`p-4`** mobile, **`p-5`** md+

### 6.4 Component patterns (new or refactored)

| Component | Purpose |
|-----------|---------|
| `BookingStepper` | Steps: Time → Details → Pay (visual only MVP) |
| `MentorProfileHero` | Avatar, name, trusted-by, price chip |
| `SessionPriceCard` | Price CRC + split bar (50/50 visual) |
| `TrustPathPanel` | Structured simulation rows with leg progress |
| `PaymentSummary` | Balance + legs + CTA grouping |
| `StatusAlert` | Wrapper for warning/error/info (replaces raw `<p className="text-amber-700">`) |
| `EmptyState` | Illustration + CTA for no mentors / no slots |
| `CrcAmount` | Formatted amount + unit, optional mono |

> **Full shadcn audit:** see [UI-SHADCN-INVENTORY.md](./UI-SHADCN-INVENTORY.md) — installed vs to-import (P0/P1/P2), per-screen mapping, install commands.

### 6.5 Motion

- **Subtle only** — slot selection fade, sheet slide (already from shadcn)
- **`prefers-reduced-motion`** — disable non-essential transitions
- No decorative loop animations (iframe perf + accessibility)

---

## 7. Information architecture

### 7.1 Nav (mobile-first)

```
Header: [Menu] THP for Good · Current page    [Wallet]
─────────────────────────────────────────────
Main content (max-w-lg md:max-w-2xl)
─────────────────────────────────────────────
(Optional future: bottom tab bar — out of scope unless DIV)
```

**Sheet menu items:** Home · Calls · History · Register · About · Admin (if admin)

### 7.2 Page priorities

| Route | Redesign priority | Notes |
|-------|-------------------|-------|
| `/` | P0 | Discovery grid + filters |
| `/mentor/[id]` | P0 | Booking funnel |
| `/calls` | P1 | TRUST prominence |
| `/history` | P2 | Table → card list on mobile |
| `/about` | P2 | Solidarity story + how CRC works |
| `/mentor/register` | P1 | Long form → stepped sections |
| `/admin` | P2 | Dense; separate “ops” visual tone |
| `/profile` | P3 | Dev/demo tool — lower polish OK |

---

## 8. Screen-by-screen blueprint

### 8.1 Home — mentor discovery

**Layout**

```
[OpenInCirclesHint if standalone]

Find a mentor
Book a 1:1 session. Pay in CRC. Fund the next cohort.

[Search...........................]
[Skill chips filter scroll row]

┌─────────────┐  ┌─────────────┐
│ MentorCard  │  │ MentorCard  │   ← 1 col mobile, 2 col sm+
└─────────────┘  └─────────────┘
```

**MentorCard enhancements**

- Dark card with subtle border glow on hover/focus
- Price as **`CrcAmount`** badge (top-right)
- Split line: `50% mentor · 50% THP for Good` (tertiary)
- Trust: icon + `Trusted by N`

### 8.2 Mentor detail — booking funnel

**Layout (single column, sticky pay zone)**

```
← Back                    [Edit] (if self)

[MentorProfileHero]

About
{bio}

── Availability ──
[SlotPicker — calendar + slots]

── Book session ──        ← sticky bottom on mobile optional
[PaymentSummary]
  Wallet balance
  [TrustPathPanel]
  Email input
  [ Pay 100 CRC to book ]
```

**TrustPathPanel (target UX)**

```
Trust path estimate (simulation)
┌──────────────────────────────────────┐
│ bh2smith          ~119 / 50 CRC  ✓   │  ← progress bar or check/warn icon
│ THP for Good      ~119 / 50 CRC  ✓   │
│ Max bookable      ~238 CRC @ 100     │
└──────────────────────────────────────┘
⚠ Your trust network may not route enough CRC…
```

**Payment split** — always visible near CTA:

`Payment split: 50% to expert, 50% to THP for Good.`

### 8.3 Pay success

- Full-width success `StatusAlert` (green semantic)
- Slot formatted prominently
- Tx link as button-secondary with explorer icon
- Calendar CTA primary if link exists

### 8.4 Calls / TRUST

- Tab or segmented control: Emitted | Received
- Booking row: mentor/booker, date, status chip
- TRUST button: primary outline → filled after success

### 8.5 About — narrative

Align copy with solidarity message (already in `app/about/page.tsx`) but **dark editorial layout**: numbered steps, pull quote on 50% THP for Good rule.

---

## 9. Copy & messaging standards

Centralize in `lib/pay-copy.ts` (extend to `lib/ui-copy.ts`).

| Context | Tone | Example |
|---------|------|---------|
| Simulation | Cautious, precise | “Trust path estimate (simulation)” |
| Split | Positive solidarity | “50% to THP for Good” — never “foundation” in UI |
| Errors | Actionable | “Not enough CRC to complete this payment.” |
| Wallet missing | Direct | “Connect your wallet to book a session.” |
| Iframe hint | Inviting | “Open in Circles to pay with CRC” |

**Avoid:** gas, chain, leg, pathfinder, wei, avatar (use “wallet” / “profile” where possible).

---

## 10. Accessibility checklist (Definition of Done)

- [ ] All interactive elements keyboard reachable; focus visible on dark
- [ ] Color contrast verified (WebAIM or Stark) for text + UI chrome
- [ ] Icons paired with text for trust/warning/success states
- [ ] Form inputs labeled (`<label>` or `aria-label`)
- [ ] Live regions for toast / tx pending (`aria-live="polite"`)
- [ ] `lang="en"` on `<html>` (already set)
- [ ] Reduced motion respected

---

## 11. Implementation plan (suggested IMPL breakdown)

Align with project workflow: create **`IMPL-L4-UI-*`** issues on board after a **`DIV-L4-UI`** decision (theme + IA approval).

| Phase | Scope | Deliverable |
|-------|-------|-------------|
| **Phase 0 — Tokens** | `.dark` tokens, semantic colors, `html.dark` | `globals.css` + `spec/design-tokens.md` snapshot |
| **Phase 1 — Shell** | Header, sheet nav, page titles, empty states | `AppShell`, `Header`, `MobileNav` |
| **Phase 2 — Discovery** | Home, `MentorCard`, filters | `/` |
| **Phase 3 — Booking** | Mentor detail step layout, `TrustPathPanel`, `PaymentSummary` | `/mentor/[id]`, `PayButton` refactor |
| **Phase 4 — Secondary** | Calls, About, Register polish | remaining routes |
| **Phase 5 — QA** | Playground pass, contrast audit, iframe 390px | sign-off checklist |

**Estimated coupling:** Phase 0 blocks everything; Phases 2–3 are demo-critical for hackathon.

---

## 12. Open decisions (for DIV-L4-UI)

| # | Question | Options |
|---|----------|---------|
| 1 | Primary accent hue | A) Gnosis green B) THP warm amber C) Neutral mono + green CTA only |
| 2 | Booking stepper | A) Visual stepper B) Section headers only (lighter) |
| 3 | Sticky pay bar on mobile | A) Yes B) No — scroll to pay |
| 4 | Font | A) Keep Geist B) Add display font for headings |
| 5 | Logo | A) Keep JPG B) SVG mark + wordmark for dark bg |

---

## 13. References

### Product & docs
- [Circles Mini Apps](https://docs.aboutcircles.com/miniapps)
- [PRD-MVP.md](./PRD-MVP.md) — L3 UX decisions
- [mockup.png](./mockup.png) — original visual intent

### UX research
- [shadcn/ui Theming (OKLCH dark)](https://ui.shadcn.com/docs/theming)
- [Web3 Accessibility Guidelines (W3AG)](https://github.com/nirholas/w3ag)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [Calendly UX redesign (stepper), Aubergine](https://www.aubergine.co/insights/ux-re-design-experiments-elevating-calendlys-one-on-one-event-type-feature)
- [Web3 adoption as design problem](https://cryptoadventure.com/community/articles/web3-adoption-is-a-design-problem-as-much-as-a-technology-problem/)

### In-repo
- `app/globals.css` — current tokens
- `components/mentors/PayButton.tsx` — payment UX
- `lib/pay-copy.ts` — user-facing strings
- `components.json` — shadcn `base-nova` preset

---

## 14. Success metrics (qualitative)

| Signal | Target |
|--------|--------|
| **Demo clarity** | New viewer understands split + trust estimate in <30s |
| **Booking completion** | Slot → email → pay without scroll confusion on mobile |
| **Brand recall** | “Dark, green, solidarity” — not “generic shadcn dashboard” |
| **Accessibility** | No critical contrast failures in automated scan |

---

*Next step:* review §12 open decisions → open **`DIV-L4-UI`** on GitHub Project → spawn **`IMPL-L4-UI-01`** (tokens + dark shell) when approved.
