# Home Landing Brainstorm (Deep Dive)

> Working doc for **IMPL-A-06 #134** on branch `docs/a-06-home-landing-brainstorm`.
> Goal: pressure-test homepage direction before implementation.

---

## 1) Why this page matters

The home page is currently efficient for returning users (straight to expert grid), but weak for first-time users who need:

- what THP does in one glance,
- why CRC and trust are relevant,
- what action to take first.

So the hero must improve clarity **without** slowing the core booking path.

---

## 2) Non-negotiables

- Route stays `/` (no `/welcome` split).
- Hero appears **above** expert grid.
- Mobile-first and iframe-safe.
- English UI copy.
- No heavy/parade-like animation.
- Keep booking discoverability high (hero must not bury experts).

---

## 3) User segments to design for

1. **Booker-ready user**
   - Intention: find expert now.
   - Need: immediate access to filters/grid.
2. **Curious new visitor**
   - Intention: understand THP first.
   - Need: concise mission + trust signal + clear CTA.
3. **Potential mentor**
   - Intention: publish profile / offer sessions.
   - Need: strong secondary CTA to `/expert/register`.
4. **Supporter**
   - Intention: understand impact / donate.
   - Need: clear path to `/about#donate`.

---

## 3.1) Landing vs About (content boundary to lock first)

### Principle

- **Landing** = conversion-first (understand + act fast).
- **About** = depth-first (mission detail, full method, treasury narrative, external references).

### What to bring from About into Landing

Keep only the shortest, highest-impact elements:

1. **Mission one-liner** (compressed from `AboutHero`)
   - from multi-paragraph to one clear sentence in hero subtitle.
2. **How it works mini version**
   - 3 compact chips in landing (not full detailed list).
3. **Solidarity split proof**
   - one concise line like “At least 50% funds future learners”.
4. **Donate path visibility**
   - CTA/link to `/about#donate` (no full donation widget on landing v1).

### What stays on About (must remain there)

1. Full mission narrative with external links (THP + Circles).
2. Full “How it works” detailed 4-step explanatory block.
3. Donation module + live treasury counter components.
4. Powered by Circles long-form explanation.
5. Transparency dashboard entry context (`/stats`) as educational continuation.

### What should NOT be duplicated

- Full donation UI/logic (`DonationSection`) on home.
- Long explanatory paragraphs from About.
- Repeating the same complete step list in both pages.

### Proposed “information contract”

- Home answers:
  - “What is this app?”
  - “What do I do now?”
- About answers:
  - “Why this model?”
  - “How exactly does it work?”
  - “Where does the money go?”

---

## 3.2) Landing vs Stats (what to borrow, what to keep separate)

### Principle

- **Landing** uses trust cues.
- **Stats** remains the full transparency/reporting surface.

### What to bring from Stats into Landing

Use only 2-3 compact proof points:

1. `X CRC raised` (impact cue)
2. `Y paid sessions` (activity cue)
3. CTA: `View transparency dashboard` → `/stats`

### What stays in Stats

- Full dashboard sections and methodology.
- On-chain/off-chain interpretation details.
- Reconcile diagnostics and long-form explanatory content.

### Rules

- Landing must not depend on heavy/slow stats loading.
- If metrics are unavailable, fallback to neutral copy + `/stats` CTA.
- Do not duplicate dashboard charts/tables on home.

---

## 4) Hero strategy options

### Option A — Minimal Conversion Hero (recommended baseline)

- 1 headline
- 1 supporting sentence
- 3 CTAs:
  - Primary: Find an expert
  - Secondary: Offer expertise
  - Tertiary: About / Donate
- Tiny trust/impact strip under CTA row.

**Pros:** fastest, clean, low risk.
**Cons:** less storytelling depth.

---

### Option B — Story + Proof Hero

- Headline + subtitle
- Mini metrics row (sessions, experts, trust actions)
- CTA row
- Short “How it works” 3-step chips.

**Pros:** educative and credible.
**Cons:** vertical space cost on mobile.

---

### Option C — Dual-path Hero

- Split “I need help” / “I offer help”.
- Contextual CTA cards.
- Additional “Support the mission” link.

**Pros:** very explicit decision fork.
**Cons:** more cognitive load and visual weight.

---

## 5) Recommended structure (v1)

Combine A + light part of B:

1. **Headline block** (high signal, short)
2. **One-line value proposition** (CRC + solidarity split)
3. **Primary CTA row** (Find / Offer / About)
4. **Micro-proof row** (2-3 concise trust/value bullets)
5. **Immediate transition to expert browser**

This keeps conversion speed while adding enough context for newcomers.

---

## 6) Copy directions to test

### Direction 1 — Mission-first

- Headline: “Find a trusted expert. Pay in CRC. Fund the next learner.”
- Tone: solidarity + action.

### Direction 2 — Outcome-first

- Headline: “Get unstuck with 1:1 expert help in minutes.”
- Tone: practical and direct.

### Direction 3 — Community-first

- Headline: “Learn with the THP network. Give back as you grow.”
- Tone: human/community.

Recommendation: start with **Direction 1** (best fit with THP positioning).

---

## 7) CTA behavior details

- **Find an expert**:
  - scroll/focus to the expert filters/grid anchor.
  - no route change.
- **Offer expertise**:
  - route to `/expert/register`.
- **About / Donate**:
  - route to `/about` (or `/about#donate` depending final UX decision).

---

## 8) Mobile layout constraints

- Max 1 screen-and-a-bit for full hero.
- CTA buttons at least 44px height.
- Avoid massive margin/padding that pushes grid too far.
- Keep filters visible soon after hero fold.

---

## 9) Information hierarchy rules

- H1 must explain outcome in < 10 words.
- Supporting paragraph in < 140 characters target.
- No paragraph blocks longer than 2 lines on common mobile widths.
- One primary CTA only (Find expert); others visually secondary.

---

## 10) SEO / social alignment (future-proof with #135)

Hero copy should map to metadata later:

- `<title>` intent phrase + THP brand
- description aligned with subtitle
- OG text close to H1/H2 to avoid message mismatch.

---

## 11) Visual references (within current design system)

- Use existing section primitives and card language.
- Keep contrast strong but calm.
- Emphasize trust and clarity over “startup marketing” visuals.

---

## 12) Risks and mitigations

- **Risk:** Hero reduces expert discovery speed.
  - **Mitigation:** compact height + anchor CTA.
- **Risk:** Copy too abstract.
  - **Mitigation:** explicit benefit + concrete action verbs.
- **Risk:** 3 CTAs dilute focus.
  - **Mitigation:** strong primary style only on “Find an expert”.

---

## 13) Open questions to lock before coding

1. Should we include a short “How it works” (3 chips) in v1 or defer?
2. `/about` vs `/about#donate` for tertiary CTA?
3. Should hero show live treasury metric or keep metrics in `/about`/`/stats` only?
4. Do we keep a compact disclaimer about wallet/host context on home?

---

## 14) Proposed implementation plan (next step)

1. Draft final copy in `lib/ui-copy.ts` (home hero section).
2. Add `HomeHero` component (simple, reusable, server-safe).
3. Insert above `ExpertBrowser` in `app/page.tsx`.
4. Add scroll anchor behavior for primary CTA.
5. Validate mobile viewport + iframe behavior.
6. Run lint + typecheck + quick manual QA.

---

## 15) Draft success criteria

- User can explain THP value proposition in under 5 seconds.
- User can reach first expert card with one tap from hero.
- “Offer expertise” pathway remains visible but secondary.
- No measurable regression in discover flow friction.

---

## 16) Domain research synthesis (THP + Circles + nonprofit UX)

### Sources reviewed

- THP for Good mission page: https://www.thehackingproject.org/thpforgood
- Circles miniapp docs: https://docs.aboutcircles.com/miniapps
- Nonprofit landing UX references (for conversion heuristics):
  - https://pridephilanthropy.com/blog/7-essentials-for-a-highconverting-nonprofit-landing-page
  - additional generic homepage/CTA hierarchy references used for triangulation

### What we should add on landing (domain-adapted)

1. **Mission + action in one sentence**
   - Keep THP “impact/social-good” framing but compressed for fast scan.
2. **Embedded miniapp clarity**
   - Small copy hint that wallet actions happen in Circles host context.
3. **Trust + solidarity cue**
   - Explicit line that each booking supports future learners.
4. **Proof strip (light)**
   - 2-3 indicators max (impact + activity + transparency link).
5. **Single dominant action**
   - Keep “Find an expert” visually primary (other CTAs secondary).

### What we should NOT put on landing

1. **Long narrative paragraphs** (belong to About).
2. **Full donation module with live counter** (belong to About/Stats).
3. **Dense technical trust/path explanations** (belong to About/Stats).
4. **Too many equal-priority CTAs**
   - Avoid “choice paralysis” on first screen.
5. **Heavy motion or gimmick animations**
   - Not aligned with miniapp speed and constrained viewport.

### Domain-specific nuance to preserve

- THP for Good is not a generic coaching marketplace:
  - keep “public good / solidarity” signal visible,
  - but keep wording practical and action-oriented (book, offer, support).
- Circles embedded context means friction sensitivity is high:
  - short copy,
  - clear next step,
  - no flow-breaking overload above the fold.

---

## 17) Visual inventory from current app (reuse first)

### 17.1 Design foundations already implemented

- **Dark-only theme is already locked** (`app/layout.tsx` sets `className="dark"`).
- **Tokenized Solarpunk system** is already in place:
  - primitives: `app/theme/solarpunk.primitives.css`
  - semantic tokens: `app/theme/solarpunk.tokens.css`
  - Tailwind mappings + motion vars: `app/globals.css`
- **Typography stack already ready**:
  - body: Inter
  - headings: Poppins
  - mono: JetBrains Mono
- **Focus/ring/accessibility conventions already established** in `globals.css` and `components/ui/button.tsx`.

Implication: no new theme work is needed for landing v1, only composition.

### 17.2 Existing components we should reuse directly

1. **Hero shell**
   - `MetricsPanel` + `PageHeader`
   - references: `components/ui-patterns/metrics-panel.tsx`, `components/layout/PageHeader.tsx`
2. **CTA row**
   - `Button` + `buttonVariants`
   - reference: `components/ui/button.tsx`
3. **Trust/impact micro-proof**
   - `StatCell` / `StatFlexGrid` (compact)
   - reference: `components/ui-patterns/metrics-panel.tsx`
4. **Outside-host wallet cue**
   - `OpenInCirclesHint`
   - reference: `components/wallet/OpenInCirclesHint.tsx`
5. **Animation baseline**
   - `FadeContent` only for hero entrance
   - reference: `components/motion/fade-content.tsx`

### 17.3 Existing page patterns relevant to landing

- Current home (`app/page.tsx` + `ExpertBrowser`) already has:
  - search/filter experience
  - expert grid
  - card hierarchy
- About (`app/about/page.tsx`) already has:
  - mission block
  - how-it-works long form
  - donation module
- Stats (`app/stats/page.tsx`) already has:
  - transparency/dashboard depth
  - detailed metric explanation

Implication: landing should only add a compact top layer, not replace discover content below.

### 17.4 Motion and iframe constraints to respect

- Keep hero motion light:
  - fade/opacity/transform only
  - no heavy scroll choreography
- Respect reduced motion defaults already implemented globally.
- Keep first viewport compact (embedded mobile context).
- Avoid new heavy live widgets in hero.

### 17.5 Practical component blueprint (v1)

Order in `app/page.tsx`:

1. `HomeHero` (new component)
   - `MetricsPanel muted`
   - `FadeContent`
   - mission-first `PageHeader`
   - CTA row (Find / Offer / About)
   - 3 “How it works” chips (compact)
   - mini proof strip (2-3 values + `/stats` link)
2. Existing `ExpertBrowser` unchanged below.

---

## 18) Explicit do/don’t list for landing implementation

### Do

- Reuse existing tokens/components first.
- Keep one dominant CTA: “Find an expert”.
- Keep copy short and action-oriented.
- Link depth to `/about` and `/stats` instead of duplicating depth.

### Don’t

- Don’t duplicate `DonationSection` on home.
- Don’t duplicate full `/stats` dashboard blocks.
- Don’t create a second H1 below hero.
- Don’t add heavy motion gimmicks.
- Don’t introduce alternate color schemes or ad-hoc tokens.

---

## 19) Coherent default decisions (ready-to-implement baseline)

These defaults are intentionally pragmatic so implementation can start now, then be refined.

| Topic | Locked default |
|------|-----------------|
| Hero strategy | **Option A + light proof strip** (compact conversion-first) |
| How it works on home | **Include 3 compact chips in v1** (no long paragraph) |
| CTA tertiary target | **`/about#donate`** (keep `/about` depth, direct support path) |
| Stats in landing | **2 proof signals max + `/stats` link** (`CRC raised`, `paid sessions`) |
| Stats fallback | If unavailable: neutral line + keep `/stats` CTA (no blocking) |
| Wallet/host mention | **Yes, micro-note only**, plus existing `OpenInCirclesHint` behavior |
| Motion | **FadeContent only** on hero; no scroll choreography |
| Copy tone | **Mission-first** (`Find a trusted expert. Pay in CRC. Fund the next learner.`) |
| Visual priority | One dominant CTA: **Find an expert**; others secondary |
| About boundary | Keep long narrative + donation module + full how-it-works on `/about` |
| Stats boundary | Keep full dashboard and methodology on `/stats` |

### Proposed v1 chip copy (EN)

1. `Choose an expert`
2. `Book & pay in CRC`
3. `Fund future learners`

### Proposed v1 proof strip copy (EN)

- `<X> CRC raised`
- `<Y> paid sessions`
- `View transparency dashboard`

### Immediate implementation note

If live values are not trivial to fetch in a lightweight way on home v1, ship static placeholders/fallback text first and keep proof strip functional via `/stats` link.
