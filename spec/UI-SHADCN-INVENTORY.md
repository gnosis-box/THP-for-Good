# THP for Good — shadcn/ui Component Inventory & Import Plan

| | |
|---|---|
| **Status** | Planning annex for [UI-REDESIGN.md](./UI-REDESIGN.md) |
| **Preset** | `base-nova` · Tailwind v4 · `@shadcn` registry |
| **Constraint** | Mobile-first · dark-only · Circles iframe |
| **Last updated** | 2026-05-23 |

---

## 1. Already in the project

### 1.1 shadcn/ui primitives (`components/ui/`)

| Component | Used in | Notes |
|-----------|---------|-------|
| **button** | Everywhere | Primary actions, nav trigger, slot chips could migrate to `toggle`/`toggle-group` |
| **card** | MentorCard, Calls, History, Profile, ConnectionCard | Core layout primitive — keep |
| **badge** | Skills, wallet status, trust state | Keep; pair with icons in redesign |
| **sheet** | `MobileNav` | Left drawer nav — correct mobile pattern |
| **separator** | MentorDetail, ConnectionCard | Keep |
| **skeleton** | CallsView, BookingHistory, ProfileLookup | Loading states — add **spinner** for inline/button loading |
| **toast** | PayButton errors | **Custom** implementation (not shadcn Sonner) — consider **sonner** migration in Phase 1 |

**Count:** 7 shadcn components installed.

### 1.2 Custom UI (not shadcn — replace or wrap)

| Location | Today | Redesign target |
|----------|-------|-----------------|
| `MentorSearch` | Raw `<input>` + Lucide | **input-group** + **input** |
| `SkillFilter` | Custom `PillButton` | **toggle-group** (horizontal scroll) |
| `SlotPicker` | Raw `<button>` chips | **toggle-group** or **button-group**; optional **calendar** for day pick |
| `PayButton` email | Raw `<input type="email">` | **field** + **input** + **label** |
| `RegisterForm` | Raw inputs/textarea | **field** + **input** + **textarea** + **radio-group** (share %) |
| `OpenInCirclesHint` | Custom amber div | **alert** (variant warning) |
| Trust / pay warnings | Raw `<p className="text-amber-700">` | **alert** |
| `CallsView` tabs | Custom border-bottom buttons | **tabs** (mobile-friendly) |
| `MentorCard` avatar | Raw `<img>` + fallback div | **avatar** |
| Empty states | Plain text paragraphs | **empty** |
| `Sidebar.tsx` | Exists but unused in AppShell | **Do not import shadcn sidebar** — [DIV-L3-01](https://github.com/gnosis-box/THP-for-Good/issues/23) mobile-first |

### 1.3 Domain components (compose locally — not in registry)

Build on top of shadcn primitives:

| Component | Purpose | shadcn building blocks |
|-----------|---------|------------------------|
| `MentorProfileHero` | Detail page header | avatar, badge, button |
| `TrustPathPanel` | Simulation rows + leg progress | card, progress, alert, tooltip |
| `PaymentSummary` | Balance + legs + CTA block | card, separator, alert |
| `BookingStepper` | Time → Details → Pay | Custom steps + **progress** or numbered labels |
| `SessionPriceCard` | Price + split visualization | card, progress (stacked bar), badge |
| `CrcAmount` | Formatted CRC display | badge or text + **tooltip** for “simulation” |
| `StatusAlert` | Unified info/warn/error | **alert** wrapper |

---

## 2. shadcn components to import (prioritized)

### P0 — Redesign MVP (install first)

Required for dark mobile booking flow and consistent forms.

| Component | Why | Replaces / improves |
|-----------|-----|---------------------|
| **alert** | OpenInCirclesHint, trust shortfall, pay errors | Custom colored `<div>` / `<p>` |
| **avatar** | MentorCard, Calls received, profile hero | Raw `<img>` circles |
| **input** | Search, email, register, admin | Raw `<input>` |
| **label** | Accessibility for all forms | Missing today |
| **field** | Register, PayButton, admin sections | Ad-hoc label+input stacks (`base-nova` pattern) |
| **input-group** | Search with icon prefix | `MentorSearch` wrapper |
| **textarea** | Register bio, admin | Raw `<textarea>` |
| **tabs** | Calls emitted/received | Custom tab buttons in `CallsView` |
| **progress** | Trust path leg coverage (`119/50`) | New TrustPathPanel |
| **empty** | No mentors, no slots, no calls | Plain “No mentors found…” text |
| **toggle-group** | Skill filter pills, slot times, mentor share % | Custom PillButton / slot chips |
| **spinner** | Pay loading, calendar fetch | Text-only “Loading…” |

```bash
npx shadcn@latest add alert avatar input label field input-group textarea tabs progress empty toggle-group spinner
```

### P1 — Polish & mobile UX

| Component | Why | Mobile note |
|-----------|-----|-------------|
| **drawer** | Bottom sheet for “Review & pay” sticky CTA | Better thumb reach than full page scroll |
| **tooltip** | Explain “simulation”, split %, trusted-by | Tap-to-open on mobile (`delayDuration`) |
| **radio-group** | Mentor share 10/20/30/50% in register/edit | Larger hit targets than custom buttons |
| **scroll-area** | Horizontal skill tags without layout break | Optional if `overflow-x-auto` stays |
| **item** | Dense list rows for Calls / History on small screens | New shadcn list primitive — good for mobile cards → list |
| **button-group** | Segmented actions (e.g. edit/cancel) | Mentor detail toolbar |

```bash
npx shadcn@latest add drawer tooltip radio-group scroll-area item button-group
```

### P2 — Optional / later

| Component | When | Skip if |
|-----------|------|---------|
| **calendar** | Day-first slot picking (Cal.com UX) | API already returns flat ISO list — only if UX shifts to date picker |
| **dialog** | Confirm destructive admin actions | alert-dialog also works |
| **alert-dialog** | Delete admin / cancel booking confirm | Admin-only |
| **accordion** | Long About page, FAQ | About is short today |
| **select** | Admin filters | Native select OK for low traffic |
| **checkbox** | Multi-select skills alternative | Toggle pills preferred visually |
| **sonner** | Replace custom toast | Only if we want stackable toasts + icons |
| **dropdown-menu** | Wallet actions overflow | Wallet is simple today |
| **popover** | Slot details / mentor quick view | Nice-to-have |

```bash
# Optional batch
npx shadcn@latest add calendar dialog alert-dialog accordion select checkbox sonner dropdown-menu popover
```

### Do NOT import (explicit)

| Component | Reason |
|-----------|--------|
| **sidebar** (+ sidebar-* blocks) | [DIV-L3-01](https://github.com/gnosis-box/THP-for-Good/issues/23) — mobile-first, sheet nav only |
| **chart** | No analytics dashboard in MVP |
| **table** / **data-table** | Poor mobile default; use **card** + **item** lists |
| **navigation-menu** | Desktop-oriented mega-menu |
| **menubar** | Not applicable |
| **carousel** | Mentor grid is static grid — 1 col mobile / 2 col sm+ |
| **login-* / signup-* blocks** | Wallet auth via Circles host — no login form |
| **dashboard-01** | Wrong product shape |

---

## 3. Mapping by screen (mobile-first)

### Home `/`

| UI need | Current | Target shadcn |
|---------|---------|---------------|
| Hero title | Plain `<h1>` | Typography tokens only |
| Search | Custom input | **input-group** + **input** |
| Skill filter row | Custom pills | **toggle-group** + horizontal scroll |
| Mentor grid | 2-col grid on mobile | Keep grid; **1 col** default (`grid-cols-1 sm:grid-cols-2`) |
| Mentor card | card + badge + raw img | **card** + **avatar** + **badge** |
| Empty search | Text | **empty** |

### Mentor detail `/mentor/[id]`

| UI need | Current | Target shadcn |
|---------|---------|---------------|
| Back / edit | button | **button** + **button-group** |
| Profile header | h1 + skill spans | **avatar** + **badge** — `MentorProfileHero` |
| Bio | `<p>` | — |
| Availability | SlotPicker custom | **toggle-group**; optional **calendar** (P2) |
| Loading slots | Text | **skeleton** row or **spinner** |
| Pay zone | PayButton stack | **card** + **field** + **alert** + **progress** |
| Sticky CTA (mobile) | None | **drawer** or fixed footer bar (custom + **button**) |

### PayButton / booking

| UI need | Current | Target shadcn |
|---------|---------|---------------|
| Balance line | `<p>` | **item** or typography |
| Trust simulation | Custom bordered div | **card** + **progress** per leg + **alert** warning |
| Email | Raw input | **field** + **input** |
| Pay CTA | button | **button** + **spinner** when loading |
| Success | Custom bordered div | **alert** variant success (custom token) |
| Toast on error | Custom toast | Keep or **sonner** |

### Calls `/calls`

| UI need | Current | Target shadcn |
|---------|---------|---------------|
| Tabs | Custom buttons | **tabs** |
| Loading | skeleton | **skeleton** |
| Booking row | card | **card** or **item** |
| TRUST | button + badge | **button** + **badge** |
| Empty | — | **empty** |

### Register `/mentor/register`

| UI need | Current | Target shadcn |
|---------|---------|---------------|
| Long form | Many raw fields | **field** groups + **input** + **textarea** |
| Share % | Custom button row | **radio-group** or **toggle-group** |
| Skills | Toggle pills | **toggle-group** |
| Errors | Text | **alert** destructive |
| Cal connect | Custom | Keep CalConnect; wrap in **field** |

### Admin `/admin`

| UI need | Current | Target shadcn |
|---------|---------|---------------|
| Dense forms | Raw inputs | **field** + **input** |
| Member list | Custom layout | **item** list mobile-first |
| Promote flow | Long form | **accordion** (P2) or stepped **tabs** |

### Global shell

| UI need | Current | Target shadcn |
|---------|---------|---------------|
| Nav | sheet | **sheet** ✓ |
| Open in Circles | Custom banner | **alert** |
| Wallet chip | badge | **badge** + optional **tooltip** |

---

## 4. External blocks (reference only — not `@shadcn` registry)

These live on [shadcn.io/blocks](https://www.shadcn.io/blocks) — useful **layout inspiration**, adapt manually:

| Block | Relevance |
|-------|-----------|
| [profile-mentor-availability](https://www.shadcn.io/blocks/profile-mentor-availability) | Mentor hero + weekly grid + reviews — closest sector match |
| [calendar-booking-slots](https://www.shadcn.io/blocks/calendar-booking-slots) | Two-panel date + slot grid — align with SlotPicker redesign |
| [empty-* examples](https://ui.shadcn.com/docs/components/empty) | Empty state patterns after `empty` import |

**Note:** Blocks may use Framer Motion — keep motion subtle inside iframe; respect `prefers-reduced-motion`.

---

## 5. Install phases (recommended order)

### Phase A — Foundation (before dark tokens land)

```bash
npx shadcn@latest add alert avatar input label field input-group textarea spinner
```

Migrate: `OpenInCirclesHint`, `MentorSearch`, PayButton email, first alerts.

### Phase B — Booking & discovery

```bash
npx shadcn@latest add toggle-group progress empty tabs tooltip
```

Migrate: `SkillFilter`, `SlotPicker`, `CallsView`, trust panel, empty states.

### Phase C — Forms & mobile polish

```bash
npx shadcn@latest add radio-group drawer item button-group scroll-area
```

Migrate: `RegisterForm`, mentor share selectors, optional pay drawer.

### Phase D — Optional

```bash
npx shadcn@latest add calendar dialog alert-dialog sonner
```

---

## 6. Gaps shadcn cannot cover (custom work)

| Need | Approach |
|------|----------|
| Dark-only theme | `.dark` on `<html>` + OKLCH tokens in `globals.css` — not a component |
| CRC split bar (50/50) | Custom `SessionPriceCard` using **progress** with two colors or flex bar |
| Booking stepper | Custom 3-step indicator; shadcn has no Stepper primitive |
| Trust path `~119 / 50` row | Custom row + **progress** `value={(50/119)*100}` cap at 100 |
| Circles iframe hint CTA | **alert** + link styled as **button** variant link |
| Tx hash display | **button** variant outline + `font-mono` — not a shadcn component |
| Mobile grid density | Tailwind `grid-cols-1` — MentorBrowser currently `grid-cols-2` on mobile (fix in redesign) |

---

## 7. Accessibility checklist (per component)

| Component | Mobile a11y |
|-----------|-------------|
| **toggle-group** | `type="single"` for slots; ensure 44px min height |
| **tabs** | Keyboard left/right; `TabsList` scroll on narrow width |
| **drawer** | Focus trap; close on successful pay |
| **alert** | `role="alert"` for errors; `role="status"` for simulation disclaimer |
| **progress** | `aria-valuenow` + text label (“119 of 50 CRC required”) |
| **tooltip** | Not sole info carrier — always visible label for critical pay info |

---

## 8. Summary scorecard

| Metric | Value |
|--------|-------|
| shadcn installed | **7** |
| Recommended P0 imports | **12** |
| Recommended P1 imports | **6** |
| Optional P2 | **8** |
| Custom domain components | **7** |
| Blocks to reference | **2–3** (mentor + calendar) |

**Net after P0+P1:** ~25 shadcn primitives — still lean; no sidebar/dashboard bloat.

---

## 9. Suggested GitHub follow-up

After [DIV-L4-UI](./UI-REDESIGN.md#12-open-decisions-for-div-l4-ui) approval:

| Issue | Scope |
|-------|-------|
| `IMPL-L4-UI-01` | Dark tokens + Phase A shadcn imports |
| `IMPL-L4-UI-02` | Home + MentorCard (avatar, toggle-group, empty) |
| `IMPL-L4-UI-03` | Mentor detail + TrustPathPanel + PaymentSummary |
| `IMPL-L4-UI-04` | Forms (Register, admin) + Calls tabs |

---

*Cross-reference: [UI-REDESIGN.md](./UI-REDESIGN.md) §6.4 Component patterns · §8 Screen blueprint*
