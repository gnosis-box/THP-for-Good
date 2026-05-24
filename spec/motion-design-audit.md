# Motion design audit — THP for Good

> **Status:** Discovery / planning (no `IMPL-*` yet)  
> **Date:** 2026-05-24  
> **Scope:** Full app tour — routes, components, shadcn primitives, iframe constraints  
> **Related:** [`UI-REDESIGN.md` §6.5](./UI-REDESIGN.md), [`UI-SHADCN-INVENTORY.md`](./UI-SHADCN-INVENTORY.md)

---

## 1. Agent skills & tooling

### 1.1 Available skills (motion-related)

| Skill | Relevance | Verdict |
| --- | --- | --- |
| **`remotion-best-practices`** | Remotion = programmatic **video** (React → MP4), not in-app UI motion | ❌ Not for this task |
| **`design-system-patterns`** | Tokens, theming, component architecture — no animation playbook | ⚠️ Tangential |
| **`tailwind-design-system`** | Tailwind v4 patterns — transitions via utilities | ⚠️ Tangential |
| **`shadcn`** | shadcn/ui install & composition — `tw-animate-css` already wired | ✅ Useful for primitives |
| **`creative/claude-design`** | One-off HTML mockups / prototypes with motion experiments | ✅ Spike / prototype only |

**No dedicated “motion design” or “Framer Motion” skill** exists in the agent arsenal today. For implementation, treat this spec + [`UI-REDESIGN.md` §6.5](./UI-REDESIGN.md) as the source of truth until a `thp-for-good-motion` skill is authored.

### 1.2 In-repo motion baseline (already shipped)

| Layer | What exists |
| --- | --- |
| **`tw-animate-css`** | Tailwind animate utilities (`animate-in`, `fade-in`, `zoom-in`, `slide-in`, …) |
| **`app/globals.css`** | `@keyframes booking-success-pop` + global `prefers-reduced-motion: reduce` kill-switch |
| **shadcn primitives** | Sheet, Drawer, Dialog, Tooltip — enter/exit via data-state + `tw-animate-css` |
| **Micro CSS** | `transition-colors` / `transition-all` on buttons, cards, filters, progress bars |
| **Loading** | `animate-pulse` (skeletons, stats loading), `animate-spin` (Spinner) |

**Not installed:** `motion` (Framer Motion), `@formkit/auto-animate`, `react-spring`, Lottie.

### 1.3 Recommended library strategy

| Approach | Bundle / iframe impact | Best for |
| --- | --- | --- |
| **CSS + `tw-animate-css` only** | Zero JS overhead | Overlays, simple fades, reduced-motion-friendly defaults |
| **[Motion](https://motion.dev) (`motion/react`)** | ~30–40 kB gzip; compositor-friendly if limited to `opacity` + `transform` | Layout transitions, stagger lists, stepper state, `AnimatePresence` for toasts |
| **`@formkit/auto-animate`** | ~2 kB | Filter grid reorder, expert list reflow — zero-config list morph |

**Iframe rule (locked):** Circles playground embeds the app in a constrained viewport (~390px). Prefer **GPU-composited** properties (`transform`, `opacity`) only; avoid animating `width`, `height`, `top`, `left`, or layout-heavy properties on long lists ([Motion perf guide](https://motion.dev/docs/react-motion-component), [DEV: Framer Motion pitfalls](https://dev.to/whoffagents/framer-motion-animations-that-dont-kill-performance-patterns-and-pitfalls-5cki)).

**Accessibility rule (locked):** Respect `prefers-reduced-motion`. CSS global override already exists in `globals.css`; any JS library must use `useReducedMotion()` or equivalent ([Motion docs](https://motion.dev/docs/react-use-reduced-motion)).

---

## 2. Research-backed timing tokens

Suggested shared constants (CSS variables or `lib/motion-tokens.ts`):

| Token | Duration | Easing | Use case |
| --- | --- | --- | --- |
| `--motion-instant` | 80–100 ms | ease-out | Button press (`active:translate-y-px` already on Button) |
| `--motion-fast` | 150–200 ms | spring-ish / `cubic-bezier(0.34, 1.2, 0.64, 1)` | Chip select, toggle, hover affordances |
| `--motion-normal` | 250–300 ms | ease-out | Sheet, drawer, dialog, tab panel |
| `--motion-slow` | 400–600 ms | spring with slight overshoot | Success celebration (booking pop — already 500 ms) |
| `--motion-stagger` | 40–60 ms step | — | List entrance (cap at ~12 visible items) |

Reference: [Web animation best practices gist](https://gist.github.com/w0rd-driven/f2e47be856d89d6365eb2a5d7db227d6).

---

## 3. Current animation inventory

### 3.1 Already animated ✅

| Location | Animation | Notes |
| --- | --- | --- |
| `BookingSuccessDialog` | Backdrop fade + popup zoom/slide + `booking-success-pop` on icon | **Best reference implementation** |
| `components/ui/sheet` | Slide + fade (vaul/Base UI) | Mobile nav |
| `components/ui/drawer` | Bottom sheet slide (PayDrawer) | Mobile pay flow |
| `components/ui/tooltip` | Fade + zoom + directional slide | |
| `components/ui/tabs` | Underline opacity transition | Calls Emitted/Received |
| `DonationSection` | Progress bar `transition-all duration-700` | Only width animation in app — watch perf |
| `components/ui/progress` | `transition-all` on fill | TrustPathPanel legs |
| `components/ui/button` | `active:translate-y-px` | Press feedback |
| Loading states | `animate-pulse`, `animate-spin` | Widespread |

### 3.2 Explicitly static (high-impact gaps) ❌

| Location | Gap |
| --- | --- |
| `BookingStepper` | Step completion jumps instantly — no circle fill / check morph |
| `SlotPicker` | Slot select toggles with no selection feedback beyond color |
| `ExpertBrowser` | Filter changes swap list instantly — no exit/enter |
| `StickyPayBar` | Appears/disappears when slot selected — no slide-up |
| `ToastProvider` | Toasts pop in/out with no motion |
| `TrustButton` | State change (none → outgoing → mutual) is instant |
| `TrustButton` `UntrustModal` | Custom modal — **no** backdrop/dialog animation (unlike BookingSuccessDialog) |
| `CallsView` | Tab content swap instant; skeleton → content hard cut |
| `StatusAlert` | Errors/warnings appear abruptly |
| `OpenInCirclesHint` | Static CTA — no gentle attention pulse (spec said no decorative loops — use once on mount only) |
| `ExpertCard` | Hover color only — no lift/glow per UI-REDESIGN §8.1 |
| `StatsDashboard` | KPI numbers hard-cut when data loads |
| `About` numbered steps | Static — no scroll reveal |
| `RegisterForm` / `ExpertEditForm` | Long forms — no section reveal |

---

## 4. Priority matrix

Legend: **Impact** = demo / conversion value · **Effort** = implementation cost · **Risk** = iframe perf / a11y

### P0 — Must have (demo-critical UX feedback)

These directly support the **book → pay → success → trust** funnel and mobile iframe demo.

| ID | Target | Motion intent | Component(s) | Technique | Impact | Effort |
| --- | --- | --- | --- | --- | --- | --- |
| **M-P0-01** | Slot selection | Selected slot scales slightly + ring pulse; deselect fades | `SlotPicker`, `ToggleGroupItem` | CSS `data-pressed` + `@keyframes slot-select` | High | Low |
| **M-P0-02** | Booking stepper | Active step ring pulse; completed step morphs number → check | `BookingStepper` | Motion `layout` or CSS crossfade | High | Med |
| **M-P0-03** | Sticky pay bar | Slide up from bottom when slot picked; slide down on deselect | `StickyPayBar` | `translateY` + `opacity`, 250 ms | High | Low |
| **M-P0-04** | Pay drawer | Already has vaul slide — **add** content stagger on open | `PayDrawer`, `PayButton` children | `animate-in` stagger children 50 ms | Med | Low |
| **M-P0-05** | Pay processing | Button → spinner crossfade; optional progress shimmer on TrustPathPanel | `PayButton`, `TrustPathPanel` | `AnimatePresence` or CSS | High | Low |
| **M-P0-06** | Booking success | Extend existing pop — stagger title → slot → CTAs | `BookingSuccessDialog` | CSS stagger delays or Motion | High | Low |
| **M-P0-07** | Toast feedback | Slide up + fade in; slide down on dismiss (pay errors!) | `ToastProvider` | Motion `AnimatePresence` or CSS | High | Low |
| **M-P0-08** | Trust CTA success | After TRUST tx: button fills green + check morph | `TrustButton` | CSS transition + icon swap | High | Med |
| **M-P0-09** | Reduced motion | Central hook/wrapper; disable stagger & celebration when PRM | `lib/motion.ts`, `globals.css` | `useReducedMotion` + CSS | Critical | Low |

### P1 — Should have (polish & perceived quality)

| ID | Target | Motion intent | Component(s) | Technique | Impact | Effort |
| --- | --- | --- | --- | --- | --- | --- |
| **M-P1-01** | Expert list filter | List items fade/slide on filter change; layout morph | `ExpertBrowser`, `ExpertCard` | `auto-animate` on `<ul>` or Motion stagger | Med | Med |
| **M-P1-02** | Expert card hover | Subtle `translateY(-2px)` + border glow (UI-REDESIGN §8.1) | `ExpertCard` | CSS `@media (hover:hover)` only | Med | Low |
| **M-P1-03** | Expert detail hero | Avatar + metadata fade-up on mount | `ExpertProfileHero` | `animate-in slide-in-from-bottom-2` once | Med | Low |
| **M-P1-04** | Trust path panel | Progress bars animate from 0 → value when data ready | `TrustPathPanel`, `Progress` | Width via transform scaleX (not width %) | Med | Med |
| **M-P1-05** | Calls tab switch | Crossfade Emitted ↔ Received content | `CallsView`, `TabsContent` | Fade 200 ms | Med | Low |
| **M-P1-06** | Calls list entrance | Cards stagger in after load (max 8) | `CallsEmittedList`, `CallsReceivedList` | Motion stagger | Med | Med |
| **M-P1-07** | Untrust modal | Match `BookingSuccessDialog` — backdrop + popup | `TrustButton` `UntrustModal` | Migrate to Dialog or copy animation classes | Med | Med |
| **M-P1-08** | Empty states | Gentle icon float-in once | `Empty`, `ExpertBrowser`, `CallsView` | CSS `animate-in` once | Low | Low |
| **M-P1-09** | Open in Circles hint | One-time attention: subtle border glow fade (no loop) | `OpenInCirclesHint` | CSS `@keyframes hint-glow` once on mount | Med | Low |
| **M-P1-10** | Skill/language filters | Chip press scale 0.97 → 1 | `SkillFilter`, `LanguageFilter`, `ToggleGroupItem` | CSS `active:scale-95` | Low | Low |
| **M-P1-11** | Wallet status | Address badge fade when connection established | `WalletStatus` | CSS fade 200 ms | Low | Low |
| **M-P1-12** | Status alerts | Slide-in from top for errors blocking pay | `StatusAlert` in `PayButton` | `animate-in slide-in-from-top-2` | Med | Low |

### P2 — Nice to have (delight, secondary routes)

| ID | Target | Motion intent | Component(s) | Technique |
| --- | --- | --- | --- | --- |
| **M-P2-01** | Home page header | Title + subtitle fade-up on first paint | `PageHeader` in `ExpertBrowser` | CSS once |
| **M-P2-02** | Stats KPI count-up | Treasury balance / booking counts animate numerically | `StatsDashboard`, `StatCell`, `MetricsHero` | Motion `useSpring` or lightweight count-up hook |
| **M-P2-03** | Donation goal | Progress bar + percentage count-up on load / after donate | `DonationSection` | Replace width transition with scaleX |
| **M-P2-04** | About “How it works” | Steps reveal on scroll (`whileInView`, `once`, `amount: 0.4`) | `app/about/page.tsx` | Motion — **lazy import** client wrapper |
| **M-P2-05** | About pull quote | Accent border draw-in | About blockquote | CSS `scaleX` on pseudo-element |
| **M-P2-06** | Register form | Section accordion expand with height animation | `RegisterForm`, `ExpertEditForm` | Motion `layout` or CSS grid `0fr→1fr` |
| **M-P2-07** | Admin tables | Row highlight on promote/approve | `AdminPanel`, `PromoteSection` | Brief `bg-accent/20` flash 600 ms |
| **M-P2-08** | Page nav cards | Dashboard link cards lift on hover | `NavCards`, `PageNav` | CSS hover |
| **M-P2-09** | Horizontal filter scroll | Fade masks at scroll edges | `SkillFilter` `ScrollArea` | CSS gradient masks |
| **M-P2-10** | Expert trust badge | Trust relation pill crossfade loading → state | `ExpertTrustControl`, `TrustRelationBadge` | Replace `animate-pulse` with skeleton → fade |
| **M-P2-11** | History route | Same patterns as Calls if `/history` kept | `BookingHistory` | Reuse M-P1-05/06 |
| **M-P2-12** | Sound + motion sync | Haptic-like icon bounce synced with `playBookingSuccessSound` | `BookingSuccessDialog` | Extend `booking-success-pop` |

### P3 — Avoid / defer

| Item | Reason |
| --- | --- |
| Parallax, continuous background loops | UI-REDESIGN §6.5 — iframe perf + vestibular disorders |
| Page-wide route transitions (Next.js template) | Miniapp feels snappier with instant nav; cost in iframe |
| Animating `width` on donation bar long-term | Use `transform: scaleX` instead (layout thrash) |
| Stagger > 20 list items | Cap stagger; virtualize if expert count grows |
| Heavy Lottie / Rive assets | Bundle + load time in iframe |
| Bottom tab bar motion (DIV rejected C) | Out of product scope |

---

## 5. Route-by-route breakdown

### `/` — Expert discovery (`ExpertBrowser`)

| Element | Priority | Animation |
| --- | --- | --- |
| `PageHeader` | P2 | Fade-up on mount |
| `ExpertSearch` input focus | P2 | Ring already via shadcn — add label float optional |
| `SkillFilter` / `LanguageFilter` chips | P1 | Press scale + selected state spring |
| Expert grid | P1 | Stagger entrance; `auto-animate` on filter |
| `ExpertCard` | P1 | Hover lift + border glow; avatar lazy fade-in when Circles data loads |
| Empty state | P1 | Icon + copy fade-in |

### `/expert/[id]` — Booking funnel (`ExpertDetail`)

| Element | Priority | Animation |
| --- | --- | --- |
| Back button | P3 | Standard hover only |
| `BookingStepper` | **P0** | Step progression |
| `ExpertProfileHero` | P1 | Mount fade-up; avatar scale-in |
| `SlotPicker` loading → slots | P1 | Skeleton crossfade to content |
| Slot toggles | **P0** | Selection feedback |
| `StickyPayBar` | **P0** | Slide-up entrance |
| `PayDrawer` | **P0** | Stagger inner content |
| `TrustPathPanel` progress | P1 | Bar fill animation |
| `PayButton` states | **P0** | Loading / error toast |
| `BookingSuccessDialog` | **P0** | Stagger CTAs (extend existing) |
| `ExpertEditForm` mode switch | P2 | Crossfade edit ↔ view |

### `/calls` — Emitted / Received (`CallsView`)

| Element | Priority | Animation |
| --- | --- | --- |
| Tab switch | P1 | Content crossfade |
| Loading skeletons | P1 | Already pulse — add fade-out before content |
| Booking cards | P1 | Stagger list |
| `TrustButton` | **P0** | Success state morph |
| `UntrustModal` | P1 | Dialog-grade animation |
| Empty states | P1 | Soft entrance |

### `/stats` — Transparency (`StatsDashboard`)

| Element | Priority | Animation |
| --- | --- | --- |
| Loading text pulse | P3 | Keep as-is |
| Treasury hero number | P2 | Count-up |
| `StatGrid` cells | P2 | Stagger fade-up |
| Expert sub-list | P1 | Reuse ExpertCard patterns |
| Recent paid table rows | P2 | Row fade-in (no stagger if > 10 rows) |

### `/about` — Narrative

| Element | Priority | Animation |
| --- | --- | --- |
| Hero copy | P2 | Fade-up |
| Numbered steps 1–4 | P2 | Scroll reveal |
| Pull quote | P2 | Border accent draw |
| `DonationSection` | P2 | Progress scaleX + optional count-up |
| CTA buttons | P3 | Hover only |

### `/expert/register` — Onboarding (`RegisterForm`)

| Element | Priority | Animation |
| --- | --- | --- |
| Multi-section form | P2 | Progressive disclosure animation |
| Tag/skill pickers | P1 | Same as home filters |
| Submit success | P1 | Reuse success dialog patterns |

### `/admin` — Ops (`AdminPanel`, `PromoteSection`)

| Element | Priority | Animation |
| --- | --- | --- |
| Dense tables | P2 | Row flash on mutation only |
| Tag approve/reject | P2 | Chip exit fade |
| Overall | P3 | **Lower polish OK** per UI-REDESIGN §7.2 |

### Global shell

| Element | Priority | Animation |
| --- | --- | --- |
| `Header` sticky | P3 | Backdrop blur already — no motion |
| `MobileNav` Sheet | P1 | Already animated — add nav link stagger optional |
| `DesktopNav` active indicator | P2 | Underline slide between items |
| `WalletStatus` | P1 | Connection fade-in |
| `OpenInCirclesHint` | P1 | One-shot attention |
| `ToastProvider` | **P0** | Enter/exit |
| Route changes | P3 | Defer |

### shadcn primitives (do not hand-edit — extend via wrappers)

| Primitive | Built-in motion | Extension idea |
| --- | --- | --- |
| `Sheet` | Slide ✅ | Stagger nav links in wrapper |
| `Drawer` | Slide ✅ | Pay drawer content stagger |
| `Dialog` | Via `tw-animate-css` in BookingSuccessDialog | Standardize UntrustModal |
| `Tooltip` | Fade/zoom ✅ | — |
| `Tabs` | Underline ✅ | Panel crossfade wrapper |
| `Skeleton` | Pulse ✅ | Fade out wrapper |
| `Spinner` | Spin ✅ | — |
| `Progress` | transition-all ⚠️ | Prefer transform-based fill |
| `ToggleGroup` | Color only | **P0** selection scale |

---

## 6. Implementation phases (suggested `IMPL-L4-MOTION-*`)

Align with project workflow: optional **`DIV-L4-MOTION`** to choose **CSS-only vs Motion library** before coding.

| Phase | IDs | Deliverable | PR scope |
| --- | --- | --- | --- |
| **Phase 0 — Foundation** | M-P0-09 | `lib/motion.ts`, CSS tokens, `usePrefersReducedMotion` hook | `docs/motion-foundation` |
| **Phase 1 — Booking funnel** | M-P0-01 … M-P0-08 | Slot, stepper, sticky bar, pay, success, toast, trust | `impl/l4-motion-booking` |
| **Phase 2 — Discovery & calls** | M-P1-01 … M-P1-07 | Lists, cards, tabs, modal parity | `impl/l4-motion-discovery` |
| **Phase 3 — Secondary** | P1 remainder + P2 | Stats, about, register, admin flashes | `impl/l4-motion-polish` |

**Bundle gate:** If `motion` package added, measure iframe load on throttled 4G + mid-range Android before Phase 2 list staggers.

---

## 7. Testing checklist

- [ ] Playground iframe 390×844 — no jank during pay flow
- [ ] `prefers-reduced-motion: reduce` — all P0 feedback still understandable (instant state change OK)
- [ ] Keyboard focus visible during/after animations
- [ ] No animation blocks tx signing modal (Circles host overlay)
- [ ] Lighthouse performance regression < 5 points on `/` and `/expert/[id]`
- [ ] `pnpm build` — no SSR `window` leaks from motion imports (client-only dynamic import)

---

## 8. References

| Source | URL |
| --- | --- |
| Motion (React) — motion component perf | https://motion.dev/docs/react-motion-component |
| Motion — `useReducedMotion` | https://motion.dev/docs/react-use-reduced-motion |
| Web animation timing guidelines | https://gist.github.com/w0rd-driven/f2e47be856d89d6365eb2a5d7db227d6 |
| Framer Motion perf patterns | https://dev.to/whoffagents/framer-motion-animations-that-dont-kill-performance-patterns-and-pitfalls-5cki |
| Auto Animate (list morph) | https://auto-animate.formkit.com/ |
| In-repo UI motion policy | [`UI-REDESIGN.md` §6.5](./UI-REDESIGN.md) |
| shadcn blocks note (subtle motion in iframe) | [`UI-SHADCN-INVENTORY.md`](./UI-SHADCN-INVENTORY.md) |
| React Bits — homepage & catalog | https://reactbits.dev |
| React Bits — installation (shadcn CLI) | https://www.reactbits.dev/get-started/installation |
| React Bits — agent catalog (`llms.txt`) | https://github.com/DavidHDev/react-bits/blob/main/public/llms.txt |

---

## 9. React Bits integration (`reactbits.dev`)

[React Bits](https://reactbits.dev) is an open-source library of **110+ animated React components** ([DavidHDev/react-bits](https://github.com/DavidHDev/react-bits)). Each component ships in four variants; **use `TS-TW` (TypeScript + Tailwind)** for this repo.

### 9.1 Install pattern

```bash
npx shadcn@latest add https://reactbits.dev/r/<Component>-TS-TW
# Example:
npx shadcn@latest add https://reactbits.dev/r/Stepper-TS-TW
```

**Rules:**

- Install into `components/motion/` (or `components/ui-patterns/`) — **never overwrite** `components/ui/*` (shadcn-generated).
- Re-map colors to Gnosis tokens in `app/globals.css` after paste.
- Check per-component deps ([Motion](https://motion.dev), [GSAP](https://gsap.com), three.js) before merging — run bundle gate (§6).
- React Bits does not always respect `prefers-reduced-motion` — wrap or add CSS fallback (M-P0-09).

### 9.2 Recommended — high fit (P0–P1)

| React Bits | Doc | THP target | Audit ID | Notes |
| --- | --- | --- | --- | --- |
| **Stepper** | [/components/stepper](https://www.reactbits.dev/components/stepper) | `BookingStepper` | M-P0-02 | Drop-in upgrade for booking progress |
| **Animated List** | [/components/animated-list](https://www.reactbits.dev/components/animated-list) | `ExpertBrowser`, `CallsView` | M-P1-01, M-P1-06 | Stagger on mount; reflow on filter |
| **Counter** | [/components/counter](https://www.reactbits.dev/components/counter) | `StatsDashboard`, `DonationSection` | M-P2-02, M-P2-03 | Treasury / formation goal count-up |
| **Count Up** | [/text-animations/count-up](https://www.reactbits.dev/text-animations/count-up) | `MetricsHero`, `StatCell` | M-P2-02 | Text variant for KPI numbers |
| **Fade Content** | [/animations/fade-content](https://www.reactbits.dev/animations/fade-content) | `ExpertProfileHero`, `Empty` | M-P1-03, M-P1-08 | Lightweight mount wrapper |
| **Animated Content** | [/animations/animated-content](https://www.reactbits.dev/animations/animated-content) | About sections, Stats panels | M-P2-04 | Scroll/mount reveal; set `once: true` |
| **Scroll Reveal** | [/text-animations/scroll-reveal](https://www.reactbits.dev/text-animations/scroll-reveal) | About “How it works” steps | M-P2-04 | Subtle unblur on scroll |
| **Staggered Menu** | [/components/staggered-menu](https://www.reactbits.dev/components/staggered-menu) | `MobileNav` Sheet links | Shell P1 | Cascade on drawer open |
| **Pill Nav** | [/components/pill-nav](https://www.reactbits.dev/components/pill-nav) | `CallsView` tabs, filter chips | M-P1-05, M-P1-10 | Sliding active indicator |
| **Spotlight Card** | [/components/spotlight-card](https://www.reactbits.dev/components/spotlight-card) | `ExpertCard` | M-P1-02 | Cursor glow — matches UI-REDESIGN §8.1 |
| **Glare Hover** | [/animations/glare-hover](https://www.reactbits.dev/animations/glare-hover) | `ExpertCard`, `NavCards` | M-P1-02 | Lighter than Spotlight; desktop `@media (hover:hover)` |
| **Tilted Card** | [/components/tilted-card](https://www.reactbits.dev/components/tilted-card) | `ExpertCard` (desktop) | M-P1-02 | Optional 3D tilt — disable on touch |

### 9.3 Consider with caution (spike first)

| React Bits | Use case | Risk |
| --- | --- | --- |
| **Click Spark** | Pay success micro-feedback | Gimmicky; iframe perf |
| **Electric Border** / **Star Border** | `OpenInCirclesHint` one-shot attention | Must not loop (§6.5 policy) |
| **Split Text** / **Blur Text** | `PageHeader` titles | Too “marketing landing” for utilitarian miniapp |
| **Flowing Menu** / **Gooey Nav** | Desktop nav inspiration | Sheet nav already sufficient on mobile |
| **Folder** | `RegisterForm` section expand | Alternative to custom accordion |

### 9.4 Do not use (iframe + §6.5 policy)

| Category | Examples | Reason |
| --- | --- | --- |
| **Backgrounds** | Aurora, Galaxy, Particles, Liquid Ether, Plasma | Continuous GPU loops; visual noise in iframe |
| **Cursor FX** | Blob Cursor, Ghost Cursor, Splash Cursor, Crosshair | Wallet/host owns cursor in Circles playground |
| **3D / WebGL** | Cubes, Dome Gallery, Model Viewer, Flying Posters | Bundle size + mid-range Android jank |
| **Gimmick text** | Glitch Text, Decrypted Text, Falling Text | Wrong tone for solidarity / booking UX |
| **Heavy parallax** | Scroll Float, Scroll Velocity, Image Trail | Vestibular + mobile iframe scroll quirks |

### 9.5 Suggested React Bits rollout (maps to §6 phases)

| Phase | React Bits components | Branch |
| --- | --- | --- |
| **1 — Booking** | Stepper, Fade Content, (optional) Click Spark spike | `impl/l4-motion-booking` |
| **2 — Discovery** | Animated List, Spotlight Card or Glare Hover, Pill Nav, Staggered Menu | `impl/l4-motion-discovery` |
| **3 — Polish** | Counter, Count Up, Scroll Reveal, Animated Content | `impl/l4-motion-polish` |

**Highest ROI trio:** Stepper + Animated List + Counter — covers most P0–P1 perceived polish with three installs.

---

## 10. Summary counts

| Priority | Items | Focus |
| --- | --- | --- |
| **P0 Must have** | 9 | Booking funnel + toasts + a11y |
| **P1 Should have** | 12 | Discovery, calls, cards, modals |
| **P2 Nice to have** | 12 | Stats, about, admin, delight |
| **P3 Avoid** | 6 | Loops, parallax, heavy assets |

**Total animation opportunities identified:** 39 actionable items across 142 TS/TSX files (27 with existing transition/animate usage, ~35 high-value gaps).

**React Bits shortlist:** 12 recommended components (§9.2), 5 spike candidates (§9.3), 5 categories to avoid (§9.4).
