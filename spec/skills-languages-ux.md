# Skills & languages UX — implementation spec

> **Branch:** `feat/skills-languages-ux` → `dev`  
> **Status:** Planned — single branch, phased commits  
> **Related:** [FEAT-L4-07 #64](https://github.com/gnosis-box/THP-for-Good/issues/64) (session languages) · [`solarpunk-theme-decisions.md`](./solarpunk-theme-decisions.md) pill rules · [`motion-design-audit.md`](./motion-design-audit.md) M-P1-10  
> **Cross-refs:** [`lib/languages.ts`](../lib/languages.ts) · [`ExpertMeta.tsx`](../components/ui-patterns/ExpertMeta.tsx) · [`ExpertBrowser.tsx`](../components/experts/ExpertBrowser.tsx)

---

## 1. Problem summary

Expert **skills** and **languages** are critical discovery signals but the current UI has consistency, hierarchy, and filter UX gaps.

| Issue | Where | Impact |
|-------|-------|--------|
| Languages use **same pill style as skills** | `ExpertLanguageTags` → `highlightPillClass('skill')` | Cards read as a flat tag soup (`Web3` `EN` `FR`) |
| **Codes vs labels** mismatch | Filter: "English"; card: `EN` | Cognitive friction |
| **Unused helpers** | `languageLabel`, `formatLanguageList`, `formatLanguageBadges` in `lib/languages.ts` | Dead code; inconsistent display |
| **Unbounded skills** on cards | `ExpertSkillTags` shows all tags | Uneven card heights, mobile clutter |
| **Heavy filter stack** | Search + 2 horizontal scroll rows | Mobile discover feels cramped |
| **Skill filter single-select** | `SkillFilter` | Cannot OR multiple domains (Web3 + DeFi) |
| **call vs spoken confusion** | Fallback logic duplicated 4×; public UI unclear | Users don't know what's bookable |
| **Duplicate languages on detail** | Hero + bio section (bio-gated) | Redundant; hidden when no bio |
| **Fragmented skill display** | `ExpertSkillTags` vs `Badge` vs plain text | Admin / calls / cards look unrelated |
| **Duplicate edit forms** | `RegisterForm` + `ExpertEditForm` | ~80% overlap on skills/langues |
| **Admin promote without languages** | `PromoteSection` | Silent defaults on new experts |
| **Client-only filtering** | `ExpertBrowser` ignores `getAllExperts(filters)` | Full list SSR + JS filter; won't scale |

---

## 2. Goals

1. **Instant scan** — on a card, name → session languages → skills → trust (clear visual hierarchy).
2. **Consistent vocabulary** — filters, cards, and detail use the same language labels (with compact variant on cards only).
3. **Modern discover UX** — unified filter entry (sheet/popover), active filter chips, multi-select skills OR languages.
4. **Single source of truth** — shared helpers, shared pickers, one expert edit form core.
5. **Complete surfaces** — admin promote, bookings, stats reuse the same meta components.
6. **Scalable filtering** — server-side query params when filters applied (optional SSR path).

---

## 3. Design decisions (locked for this branch)

| ID | Decision |
|----|----------|
| D1 | **Skills** keep neutral sage pills (`--pill-skill-*`). |
| D2 | **Languages** get distinct treatment: Lucide `Globe` + muted pill OR compact `EN · FR` on cards; full labels on filters/detail. |
| D3 | Card skills: **max 3 visible** + `+N` overflow (tooltip or expand on card — prefer tooltip to avoid layout shift). |
| D4 | Public display uses **`call_languages`** (bookable); fallback spoken only when call empty (existing rule), labeled **"Sessions in …"**. |
| D5 | Homepage filters: **multi-select OR** for skills **and** languages. |
| D6 | Mobile: **Filter sheet** (`Sheet` from shadcn) instead of two always-visible scroll rows. Desktop: sheet or inline popover — same component. |
| D7 | Detail page: languages **once** in hero; remove bio-section duplicate. |
| D8 | No flag emojis — globe icon + text (a11y, consistency). |
| D9 | Consolidate edit logic into shared module; `RegisterForm` / `ExpertEditForm` become thin wrappers. |
| D10 | `PromoteSection` gets full `LanguagePicker` (spoken + call). |

---

## 4. Target UI (reference)

### 4.1 Expert card

```
┌────────────────────────────────────────────┐
│ [Avatar]  Zet                      10 CRC  │
│           🌐 EN · FR                       │  ← language row (compact)
│           Web3 · DeFi · Circles    +1      │  ← skills capped
│           Trusted by 12 · [Trust]          │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ 20% expert              80% THP for Good   │
└────────────────────────────────────────────┘
```

### 4.2 Homepage discover

```
┌────────────────────────────────────────────┐
│ 🔍 Search experts…                         │
│ [Filters (2)]                              │
│ Active: Web3 × · French ×                   │
└────────────────────────────────────────────┘
```

**Filter sheet sections:**

- **Skills** — multi-toggle chips (approved tags only on home)
- **Session language** — EN / FR multi OR; helper: "Experts who offer sessions in…"
- Clear all · Apply (Apply closes sheet; filters live-update on Apply)

### 4.3 Expert detail hero

- Line: **Sessions in English, French** (prose or single muted line with globe)
- Skills: full list (no cap on detail)
- Bio section: bio text only — **no language repeat**

---

## 5. Implementation phases

Work in order on **`feat/skills-languages-ux`**. One PR to `dev` when all phases complete (or split only if review asks).

### Phase 1 — Foundation (lib + tokens)

**Purpose:** shared helpers and pill tokens before touching every surface.

| Task | How |
|------|-----|
| Add `getDisplayCallLanguages(expert: ExpertRow): string[]` | `lib/languages.ts` — single fallback rule |
| Add `formatSessionLanguages(codes, variant: 'compact' \| 'full')` | Wraps `formatLanguageBadges` / `formatLanguageList` |
| Extend `highlight-pill.ts` | Add `PillRole = 'language'` + `highlightPillClass('language', …)` using muted surface (distinct from skill border weight or add `--pill-language-*` in `globals.css` if needed) |
| Extend `getAllExperts` | Accept `skillFilters?: string[]`, `callLanguageFilters?: string[]` (OR logic); keep backward-compatible single-string overload or replace callers |
| Add `lib/expert-filters.ts` | Pure functions: `filterExpertsClientSide(experts, { skills, languages, q })` for tests + fallback |

**Files:** `lib/languages.ts`, `lib/db.ts`, `lib/expert-filters.ts`, `components/ui-patterns/highlight-pill.ts`, `app/globals.css` (if new CSS vars)

---

### Phase 2 — Display components

| Task | How |
|------|-----|
| Refactor `ExpertLanguageTags` | Globe icon; `variant="compact" \| "full"`; use `formatSessionLanguages`; never reuse `skill` pill role |
| Refactor `ExpertSkillTags` | Props: `maxVisible?: number`, `onOverflowClick?`; render `+N` pill with `title` tooltip listing hidden skills |
| Restructure `ExpertCard` | Row order per §4.1; remove languages inline with truncated name |
| Update `ExpertProfileHero` | "Sessions in …" line; full skills |
| Fix `ExpertDetailBody` | Remove language block under bio; keep bio-only section |
| Align `CallsView` / `BookingHistory` | Replace raw `Badge` skills with `ExpertSkillTags` (compact, `maxVisible={2}`) |
| Align `AdminPanel` expert list | Use `ExpertSkillTags` + compact language line where shown |

**Files:** `ExpertMeta.tsx`, `ExpertCard.tsx`, `ExpertProfileHero.tsx`, `ExpertDetailBody.tsx`, `CallsView.tsx`, `BookingHistory.tsx`, `AdminPanel.tsx`

---

### Phase 3 — Discover filters (homepage)

| Task | How |
|------|-----|
| Create `ExpertFilterState` type | `{ skills: string[]; languages: string[]; query: string }` |
| Create `ExpertFilterSheet` | Sheet + sections for skills (multi) and languages (multi); uses `tagChipClass` / `filterChipClass` |
| Create `ActiveFilterChips` | Removable chips below search; clears individual or all |
| Replace `SkillFilter` + `LanguageFilter` in `ExpertBrowser` | Filter button opens sheet; optional: keep quick EN/FR chips on desktop only if sheet feels heavy — default: sheet only |
| Wire filtering | Prefer URL search params `?skill=Web3&skill=DeFi&lang=fr` for shareable state; sync on Apply |
| SSR path (recommended) | `app/page.tsx`: read `searchParams`, call `getAllExperts(skills, false, langs)` — reduces client payload long-term |
| Update `ExpertSearch` | Include language labels in search (optional P1.5): match `languageLabel(code)` |

**Files:** new `components/experts/ExpertFilterSheet.tsx`, `ActiveFilterChips.tsx`, `ExpertBrowser.tsx`, `app/page.tsx`, `lib/ui-copy.ts` (copy keys)

---

### Phase 4 — Forms & admin (dedupe)

| Task | How |
|------|-----|
| Extract `useExpertProfileForm` hook OR `ExpertProfileFields` component | Shared: name, bio, skills (`SkillTagPicker`), languages (`LanguagePicker`), price, split, cal |
| Slim `RegisterForm` | Collapsible sections wrap shared fields |
| Slim `ExpertEditForm` | Same shared fields |
| Add `LanguagePicker` to `PromoteSection` | Same as register; validate on promote API |
| Unify tag fetch | Single `useSkillTags()` hook (`/api/tags`) used by Register, Edit, Promote, Filter sheet |
| Fix `mergeSkillTag` status | Document: register → `approved`, promote → `pending`; no UX change unless product asks |

**Files:** new `hooks/use-skill-tags.ts`, `components/experts/ExpertProfileFields.tsx` (or hook), `RegisterForm.tsx`, `ExpertEditForm.tsx`, `PromoteSection.tsx`, `SkillTagPicker.tsx` (if hook injection)

---

### Phase 5 — Polish, motion, docs

| Task | How |
|------|-----|
| Motion | Chip press per `motion-design-audit` M-P1-10 on new filter components |
| a11y | `aria-label="Sessions in English, French"` on language rows; filter sheet focus trap |
| `StatsDashboard` top skills | Already capped at 8 — no change unless styling alignment |
| Update `spec/solarpunk-theme-decisions.md` | Pill rules: language row distinct from skill |
| Update `AGENTS.md` | Short § Skills & languages UX pointer to this spec |
| Update `spec/useful-links.md` | Row linking this spec |

---

## 6. File checklist (all touched)

### New

- `lib/expert-filters.ts`
- `components/experts/ExpertFilterSheet.tsx`
- `components/experts/ActiveFilterChips.tsx`
- `components/experts/ExpertProfileFields.tsx` (or `hooks/use-expert-profile-form.ts`)
- `hooks/use-skill-tags.ts`

### Modified

- `lib/languages.ts`, `lib/db.ts`, `lib/ui-copy.ts`
- `components/ui-patterns/highlight-pill.ts`, `ExpertMeta.tsx`
- `components/experts/ExpertCard.tsx`, `ExpertBrowser.tsx`, `ExpertSearch.tsx`
- `components/experts/ExpertProfileHero.tsx`, `ExpertDetailBody.tsx`
- `components/experts/RegisterForm.tsx`, `ExpertEditForm.tsx`, `SkillTagPicker.tsx`, `LanguagePicker.tsx`
- `components/experts/SkillFilter.tsx`, `LanguageFilter.tsx` — **deprecate or repurpose** as sheet internals
- `components/admin/PromoteSection.tsx`, `AdminPanel.tsx`
- `components/bookings/CallsView.tsx`, `BookingHistory.tsx`
- `app/page.tsx` (searchParams SSR)
- `app/globals.css` (optional `--pill-language-*`)
- `spec/solarpunk-theme-decisions.md`, `AGENTS.md`, `spec/useful-links.md`

### Possibly removed

- Standalone `SkillFilter.tsx` / `LanguageFilter.tsx` if fully absorbed by sheet (keep exports as thin wrappers during migration if safer).

---

## 7. Acceptance criteria

- [ ] Card: languages visually distinct from skills; compact `EN · FR` on card, full labels in filter sheet
- [ ] Card: max 3 skills + `+N` with accessible name for overflow
- [ ] Homepage: filter sheet; multi skill OR; multi language OR; active chips removable
- [ ] Detail: languages shown once; no bio-gated duplicate
- [ ] Register + inline edit + promote: same language picker behaviour
- [ ] Promote flow persists spoken + call languages
- [ ] Calls/history/admin: skill pills match design system
- [ ] `getDisplayCallLanguages` used everywhere (no inline fallback copies)
- [ ] `pnpm build` + manual QA: home filters, card scan, register, expert detail, promote admin
- [ ] Reduced motion: no new motion-only affordances required for filter sheet

---

## 8. Test plan

| Scenario | Steps |
|----------|--------|
| Discover multi-filter | Select Web3 + DeFi + French → only matching experts |
| Clear filters | Remove chips one-by-one; "Clear all" resets list |
| Card overflow | Expert with 5+ skills → shows +N; tooltip lists rest |
| Language consistency | Filter says French; card shows FR; detail says "Sessions in French" |
| Register | Pick spoken DE+EN, call EN only → saves correctly via API |
| Promote admin | New expert with languages → appears in French filter |
| Mobile | Filter sheet usable one-handed; no double horizontal scroll on home |
| SSR | Reload with `?lang=fr` → filtered list without flash of all experts |

---

## 9. Out of scope (explicitly deferred)

| Item | Reason |
|------|--------|
| Flag emoji / country icons | a11y + political edge cases |
| Skill categories / taxonomy tree | Needs product design + DB |
| Full-text search server-side | Separate FEAT |
| Spoken-only filter (non-bookable langs) | Confuses bookers; use call languages only |
| Auto-translate skill labels | i18n epic |

---

## 10. Commit strategy (suggested)

```
feat(languages): add display helpers and pill language role
feat(meta): distinct language tags and capped skill tags on cards
feat(discover): expert filter sheet and active chips
feat(discover): SSR filter params on home page
refactor(forms): shared ExpertProfileFields and useSkillTags
feat(admin): language picker on promote
docs(spec): skills-languages-ux implementation spec
```

---

## 11. Summary

Single branch **`feat/skills-languages-ux`** delivers:

1. **Visual hierarchy** — languages ≠ skills  
2. **Label consistency** — wire existing `lib/languages.ts` formatters  
3. **Discover UX** — filter sheet + multi-select + active chips  
4. **Code health** — shared helpers, forms, tags hook, server-side filters  
5. **Surface parity** — admin, bookings, detail, register  

Implement **phases 1 → 5** in order; each phase should leave the app buildable.
