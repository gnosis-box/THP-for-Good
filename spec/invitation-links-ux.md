# Invitation links pool — UX & copy spec

> **Branch:** `feat/a-04-invitation-links-ux` → `dev` (docs PR first)  
> **Status:** Spec complete — awaiting implementation  
> **Tracking:** [FEAT-A-04 #128](https://github.com/gnosis-box/THP-for-Good/issues/128) (this spec) · [IMPL-A-05 #129](https://github.com/gnosis-box/THP-for-Good/issues/129) (backend + wiring)  
> **Decision:** [DIV-A-01 #111](https://github.com/gnosis-box/THP-for-Good/issues/111) (closed — THP-native pool, FIFO, multi-admin)  
> **Cross-refs:** [`useful-links.md`](./useful-links.md) § Circles identity & onboarding · [`PayButton.tsx`](../components/experts/PayButton.tsx) · [`AdminPanel.tsx`](../components/admin/AdminPanel.tsx)

---

## 1. Problem summary

Users who connect a wallet that is **not a registered Circles avatar** cannot pay in CRC. Today the booking drawer only shows a passive warning:

| Gap | Where | Impact |
|-----|-------|--------|
| No actionable onboarding CTA | `PayButton.tsx` — `StatusAlert` when `balance.status === 'not-registered'` | Users hit a dead end; admins manually share invite links out of band |
| No admin surface for invite URLs | `/admin` — `AdminPanel` | Links live in spreadsheets / chat; no FIFO, no audit trail |
| No empty-pool fallback | — | When THP runs out of invites, users are stuck with generic copy |
| Duplicate copy on register | `RegisterForm.tsx` — same “Wallet not registered” alert | Inconsistent guidance between expert register and book flows |

**Goal:** THP admins maintain a **shared invitation-link pool**; bookers who need an avatar get a **one-click invite link** (FIFO, consumed on click); when the pool is empty, users are routed to **standard Circles onboarding** with explicit copy.

---

## 2. Locked product rules (DIV-A-01)

| ID | Rule |
|----|------|
| R1 | **All THP admins** can add links and view the full pool (same permissions as tags / experts). |
| R2 | Each link stores **`added_by`** (admin wallet address at insert time) for traceability. |
| R3 | Allocation is **FIFO** — oldest `available` link first. |
| R4 | A link is **`used`** when the user **clicks “Get invite link”** and the API returns that URL (not when they finish off-site signup). |
| R5 | If the pool has **no `available` links**, show an explicit empty state and offer **standard Gnosis/Circles onboarding** fallbacks (see §6.3). |
| R6 | If a returned URL fails validation at serve time, mark **`invalid`** and retry next available (bounded — backend in #129). |
| R7 | **English UI** for all user-facing strings (MVP policy). |

**Out of scope (this epic):** external invite-manager API, analytics dashboard, per-admin private pools, link expiry cron.

---

## 3. User journeys

### 3.1 Admin — replenish pool

1. Admin opens `/admin` (wallet must be in `ADMIN_ADDRESSES` ∪ DB `admins`).
2. Scrolls to **Invitation links** section (below Platform health, above Skill tags — see §5.1).
3. Pastes a Circles/Metri invite URL → **Add link**.
4. Link appears in list with status **Available**, **Added by** (admin display name or shortened address), **Added** timestamp.
5. Optionally filters list by status tab.

### 3.2 Booker — needs avatar before PAY

**Precondition:** user is on `/expert/[id]`, pay drawer open, `balance.status === 'not-registered'`.

1. User sees **Circles account required** panel (replaces current warning-only alert — §4.2).
2. User taps **Get invite link**.
3. App calls `POST /api/onboarding/invite-link` with connected wallet address (see #129).
4. **Success:** API atomically marks link `used`, returns URL → `window.open(url, '_blank', 'noopener,noreferrer')` + inline confirmation copy.
5. User completes signup off-site, returns to miniapp, wallet refreshes → panel hides; PAY flow continues.
6. **Empty pool:** panel switches to empty state (§4.3) with fallback CTAs — no silent failure.

### 3.3 Booker — outside Circles host

When `!isMiniappHost`, user may have no wallet at all. Existing [`OpenInCirclesHint`](../components/wallet/OpenInCirclesHint.tsx) stays on the page shell. Inside the pay drawer:

- If not connected → existing PAY disable behaviour unchanged.
- If connected but not registered → same onboarding panel as §3.2, plus helper line: *“Open this app in the Circles playground to pay with CRC after signup.”*

---

## 4. Wireframes

### 4.1 Admin — Invitation links section (`/admin`)

Placement: after `PlatformHealthSection`, before **Skill Tags**.

```
┌─────────────────────────────────────────────────────────────┐
│ Invitation links                                             │
│ Shared pool · oldest link issued first · all admins manage   │
├─────────────────────────────────────────────────────────────┤
│ [ Available 3 ] [ Used 12 ] [ Invalid 1 ] [ All 16 ]        │  ← status filter tabs
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ● Available                                              │ │
│ │ https://app.metri.xyz/invite/abc…                        │ │
│ │ Added by Zet · 0x7c40…dc · 2 May 2026, 14:32           │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ○ Used                                                   │ │
│ │ https://circles.gnosis.io/…                               │ │
│ │ Added by Admin · 0xa3bA… · 28 Apr 2026                   │ │
│ │ Used by 0x8406… · 30 Apr 2026, 09:15                     │ │
│ └─────────────────────────────────────────────────────────┘ │
│ … empty: “No links yet. Paste an invite URL below.”         │
├─────────────────────────────────────────────────────────────┤
│ Add invite link                                              │
│ [ https://________________________________________ ] [Add]   │
│ Paste a Circles or Metri invitation URL.                     │
└─────────────────────────────────────────────────────────────┘
```

**Status badge colours:** reuse existing admin patterns — `available` → success tint, `used` → muted, `invalid` → destructive/muted.

**Mobile:** stack rows; URL truncates with `truncate` + full URL in `title` tooltip.

### 4.2 Booking — onboarding panel (pay drawer)

Replaces the block at `PayButton.tsx` L321–329 when `balance.status === 'not-registered'`.

**Component name (impl):** `OnboardingInvitePanel` in `components/booking/`.

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠ Circles account required                                   │
│                                                             │
│ Book sessions with CRC. You need a registered Circles       │
│ avatar before you can pay.                                  │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │            Get invite link  →                            │ │  ← primary Button
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ After you sign up, return here to finish booking.           │
└─────────────────────────────────────────────────────────────┘
```

**While loading (button):** label → `Getting link…`, button disabled, `aria-busy="true"`.

**After successful handoff:**

```
┌─────────────────────────────────────────────────────────────┐
│ ✓ Invite link opened                                         │
│ Complete signup in the new tab, then return to book.         │
│ [ Get another link ]   ← only if still not-registered AND    │
│                          pool still has links (edge: user      │
│                          closed tab without using link)        │
└─────────────────────────────────────────────────────────────┘
```

Note: second link request consumes **another** FIFO slot if the user clicks again — acceptable for alpha; admin can see `used` + `consumed_by`.

**PAY button:** remains **disabled** while `not-registered` (existing `canPay` logic). Panel provides the actionable path; no silent disable.

### 4.3 Booking — empty pool fallback

Shown when `POST /api/onboarding/invite-link` returns `{ fallback: true }` or HTTP 404 with empty-pool body (exact contract in #129).

```
┌─────────────────────────────────────────────────────────────┐
│ No invite links available                                    │
│                                                             │
│ Our invite pool is empty right now. Use standard Circles    │
│ onboarding to create your avatar, then join THP.            │
│                                                             │
│ [ Create Circles account → ]   → https://www.aboutcircles.com │
│ [ Join THP group → ]           → Metri group URL (§7)       │
│                                                             │
│ Come back here after signup to complete your booking.       │
└─────────────────────────────────────────────────────────────┘
```

Both fallback links open in a new tab (`noopener,noreferrer`).

### 4.4 Expert register — aligned alert (optional polish, same PR or follow-up)

Replace `RegisterForm.tsx` L330–335 passive alert with a compact variant of §4.2 (same copy keys, no PAY context). **Minimum for #128 acceptance:** booking panel; register alignment listed as impl nice-to-have in #129.

---

## 5. UI structure & files (implementation map)

### 5.1 Admin

| Piece | Location | Notes |
|-------|----------|-------|
| Section shell | `components/admin/InvitationLinksSection.tsx` (new) | Client component; fetches `GET /api/admin/invitation-links` |
| Add form | same file | `POST /api/admin/invitation-links` `{ url }` |
| List + filters | same file | Tabs: `available` \| `used` \| `invalid` \| `all` |
| Mount point | `AdminPanel.tsx` | After health block, ~L201 |

**Add validation (client):**

- Non-empty, valid `https://` URL (`URL` constructor).
- Trim whitespace.
- Show inline error: *“Enter a valid https URL.”*

**Admin identity display:** resolve `added_by` via `getProfileView` when rendering (same pattern as admin list avatars); fallback shortened address.

### 5.2 Booking

| Piece | Location | Notes |
|-------|----------|-------|
| Onboarding panel | `components/booking/OnboardingInvitePanel.tsx` (new) | Props: `walletAddress`, `onFallback?` |
| Integration | `PayButton.tsx` | Swap `StatusAlert` for panel when `not-registered` |
| Copy | `lib/ui-copy.ts` → `UI_COPY.onboarding` | See §6 |
| Fallback URLs | `lib/onboarding-links.ts` (new, tiny) | Single source for Metri + aboutcircles constants |

### 5.3 API surface (reference for #129 — not built in this spec PR)

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| `GET` | `/api/admin/invitation-links` | Admin | List all links |
| `POST` | `/api/admin/invitation-links` | Admin | Add link `{ url, added_by from header }` |
| `POST` | `/api/onboarding/invite-link` | Connected wallet | FIFO allocate + return `{ url }` or `{ fallback: true }` |

---

## 6. Copy catalog (English)

Add to `lib/ui-copy.ts`:

```ts
onboarding: {
  // Panel — not registered
  title: 'Circles account required',
  body: 'Book sessions with CRC. You need a registered Circles avatar before you can pay.',
  ctaGetLink: 'Get invite link',
  ctaGettingLink: 'Getting link…',
  helperReturn: 'After you sign up, return here to finish booking.',
  playgroundHelper: 'Open this app in the Circles playground to pay with CRC after signup.',

  // Success handoff
  successTitle: 'Invite link opened',
  successBody: 'Complete signup in the new tab, then return to book your session.',
  retryCta: 'Get another link',

  // Empty pool
  emptyTitle: 'No invite links available',
  emptyBody:
    'Our invite pool is empty right now. Use standard Circles onboarding to create your avatar, then join THP.',
  fallbackCreateAccount: 'Create Circles account',
  fallbackJoinThp: 'Join THP group',

  // Errors
  errorGeneric: 'Could not get an invite link. Try again or use the links below.',
  errorNetwork: 'Network error — check your connection and try again.',

  // Admin
  adminSectionTitle: 'Invitation links',
  adminSectionSubtitle: 'Shared pool · oldest link issued first · all admins manage',
  adminFilterAvailable: 'Available',
  adminFilterUsed: 'Used',
  adminFilterInvalid: 'Invalid',
  adminFilterAll: 'All',
  adminAddLabel: 'Add invite link',
  adminAddPlaceholder: 'https://…',
  adminAddHelper: 'Paste a Circles or Metri invitation URL.',
  adminAddButton: 'Add',
  adminEmptyList: 'No links yet. Paste an invite URL below.',
  adminAddedBy: (name: string) => `Added by ${name}`,
  adminUsedBy: (shortAddr: string, date: string) => `Used by ${shortAddr} · ${date}`,
  adminInvalidUrl: 'Enter a valid https URL.',
  adminStatusAvailable: 'Available',
  adminStatusUsed: 'Used',
  adminStatusInvalid: 'Invalid',
},
```

**Deprecate / replace** hard-coded strings in:

- `PayButton.tsx` L325–326 (`Wallet not registered` alert)
- `RegisterForm.tsx` L333–334 (align in #129)

---

## 7. Fallback URLs (constants)

Define once in `lib/onboarding-links.ts`:

| Key | URL | Use |
|-----|-----|-----|
| `CIRCLES_SIGNUP_URL` | `https://www.aboutcircles.com` | Standard avatar creation |
| `THP_METRI_JOIN_URL` | `https://app.metri.xyz/0x2b5E4045936ef12250a8c01e4Cbf71E9bEE69e00` | Join THP Circles group ([`useful-links.md`](./useful-links.md)) |
| `CIRCLES_PLAYGROUND_URL` | `https://circles.gnosis.io/playground` | Already used by `OpenInCirclesHint` |

Do **not** duplicate these in components — import from the module.

---

## 8. States & edge cases

| State | UI behaviour |
|-------|----------------|
| Wallet not connected | No onboarding panel in drawer; PAY disabled — unchanged |
| `not-registered` + pool has links | Show §4.2; primary CTA enabled |
| `not-registered` + empty pool | Show §4.3 immediately (optional: probe on mount via HEAD/GET count endpoint, or lazy on first click — **prefer lazy on first click** to avoid extra API) |
| API error (500) | Toast with `errorGeneric`; keep §4.2 visible with retry |
| User double-clicks CTA | Disable button while in-flight; backend atomicity prevents double assignment (#129) |
| Link opened but user abandons signup | Still `used`; user may request another link (consumes next FIFO) |
| Admin adds duplicate URL | Allow (no dedupe in alpha); both rows independent |
| Invalid URL stored | Marked `invalid` by runtime retry logic (#129); admin sees in **Invalid** tab |
| Registered mid-drawer | Panel unmounts when balance refresh shows registered; PAY enables per existing rules |

**Accessibility:**

- Panel uses `role="region"` + `aria-labelledby` pointing at title.
- Status filter tabs: `role="tablist"` / `aria-selected`.
- Loading button: `aria-busy`, `aria-live="polite"` on success message.

**Motion:** reuse `motion-alert-in` on panel mount; respect `usePrefersReducedMotion()`.

---

## 9. Acceptance criteria mapping (#128)

| Criterion | Spec section |
|-----------|----------------|
| Admin can add links and see who added each | §4.1, §5.1, §6 admin copy |
| Admin can list/filter by status | §4.1 tabs, §5.1 |
| Booking flow shows onboarding CTA when needed | §4.2, §5.2 |
| Empty pool explicit + routes to standard onboarding | §4.3, §7 |
| Copy concise and action-oriented | §6 |

**Deliverables for this issue (#128):**

- [x] This spec file
- [ ] PR review sign-off from product
- [ ] #129 unblocked for implementation

---

## 10. IMPL-A-05 handoff checklist (#129)

Backend / wiring agent should implement in order:

1. Schema + migration (`invitation_links` table per issue #129).
2. Admin GET/POST routes with `isAdminRequest`.
3. Public `POST /api/onboarding/invite-link` — atomic FIFO `UPDATE … RETURNING`.
4. `InvitationLinksSection` + `AdminPanel` mount.
5. `OnboardingInvitePanel` + `PayButton` integration.
6. `lib/onboarding-links.ts` + `UI_COPY.onboarding`.
7. Manual test: two parallel POSTs → distinct links; empty pool → fallback body.
8. `pnpm lint` + `pnpm build`.

**Suggested impl branch:** `impl/a-invitation-links` (after this docs PR merges to `dev`).

---

## 11. Test plan (manual)

| # | Steps | Expected |
|---|-------|----------|
| T1 | Admin adds 2 links | Both show **Available**, correct `added_by` |
| T2 | Filter **Used** on fresh pool | Empty list message |
| T3 | Booker not registered → Get invite link | New tab opens; link status → **Used** in admin |
| T4 | Exhaust pool → Get invite link | §4.3 fallbacks; no crash |
| T5 | Two simultaneous Get invite link (two browsers) | Different URLs; no duplicate assignment |
| T6 | Complete signup → return | Warning gone; PAY flow reachable |
| T7 | iOS Safari in Circles iframe | Panel readable; `window.open` not blocked (if blocked, show copyable URL fallback — **impl note:** detect `window.open` null return and show URL + Copy button) |

**iOS `window.open` mitigation (impl):** if `window.open` returns `null`, show read-only URL field + **Copy link** button (`navigator.clipboard.writeText`). Add copy keys in §6 in #129 if needed.

---

## 12. Related issues

| Issue | Role |
|-------|------|
| [#111 DIV-A-01](https://github.com/gnosis-box/THP-for-Good/issues/111) | Decision — closed |
| [#128 FEAT-A-04](https://github.com/gnosis-box/THP-for-Good/issues/128) | This spec |
| [#129 IMPL-A-05](https://github.com/gnosis-box/THP-for-Good/issues/129) | Code |
| [#113 IMPL-A-01](https://github.com/gnosis-box/THP-for-Good/issues/113) | Donate CTA — orthogonal (insufficient balance vs not registered) |
