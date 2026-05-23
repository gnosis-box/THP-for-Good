<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Miniapps Boilerplate — Agent Guide

This is a starter template for building [Circles](https://aboutcircles.com) miniapps. A miniapp is a web app that loads inside the Circles host (https://circles.gnosis.io/playground) via an iframe; the host injects a wallet and your app drives interactions through the SDK. The boilerplate ships with the minimum plumbing — wallet provider, sign-in demo, profile lookup, layout — so a developer can clone it and start writing business logic immediately.

## Product spec & project workflow (mandatory)

| Rôle | Où |
| --- | --- |
| **Centre de vérité (statut, priorité, exécution)** | [GitHub Project #1](https://github.com/orgs/gnosis-box/projects/1/views/1) |
| **Index (liens, décisions verrouillées, anti-doublon)** | [`spec/PRD-MVP.md`](spec/PRD-MVP.md) · [`spec/useful-links.md`](spec/useful-links.md) |
| **L4 backlog workflow (agents)** | This file § [L4 backlog workflow](#l4-backlog-workflow) · skill `thp-for-good-backlog` |

Kanban columns: **Triage → Ready → Running → Review → Blocked → Done**. Group by **Priority**.

**Current phase (2026-05-21):** **DIV L0–L3 complete** — execution via `IMPL-*` and spikes; see [`PRD-MVP.md`](spec/PRD-MVP.md). Priority: [SPIKE-L2-01 #30](https://github.com/gnosis-box/THP-for-Good/issues/30), L0–L3 IMPL backlog.

### Two issue types (never mix)

| Type | ID pattern | Label | Purpose |
| --- | --- | --- | --- |
| **Decision** | `DIV-Lx-yy` | `decision` | Trancher A/B/C (spec [`PRD-MVP.md`](spec/PRD-MVP.md)). **No code.** |
| **Implementation** | `IMPL-Lx-yy` (or `IMPL-Lx-yy-n`) | `implementation` | Code, routes, infra, UI — **only** place where the repo changes. |

### When a `DIV-*` is resolved

**Decision ≠ implementation.** Do **not** edit application code in the same step.

1. **DIV issue** — Paste decision comment (see PRD or chat); **close** the issue.
2. **Project board** — Move the card to **Done** (manual on [Project #1](https://github.com/orgs/gnosis-box/projects/1)).
3. **`PRD-MVP.md`** — § *Décisions tranchées* + layer ✅ + § *Architecture cible* (target state, not “repo done”).
4. **Fallout** — For each concrete change (new route, Dockerfile, schema column, PayButton fix, …):
   - Search § *Backlog d’implémentation* in the PRD — **if a row exists for this `DIV-*`, do not open a duplicate.**
   - Else create **`IMPL-*`** issue (label `implementation`) on the board in **Triage**; add one line to PRD § *Backlog d’implémentation* with the link.
5. **Code** — Only when someone moves an **`IMPL-*`** card Triage → Ready → Running and implements it.

### When working an `IMPL-*`

1. Board: **Triage** → **Ready** → **Running** → **Review** → close issue → **Done**.
2. PRD backlog row: optional note “done” or remove only when issue closed (keep link for history).
3. Respect **Locked decisions** below and layer order on the board.

### L4 backlog workflow

Use when adding post-MVP features, external link curation, or multi-phase specs (see skill **`thp-for-good-backlog`** for full commands).

**Issue IDs:** `FEAT-L4-*` (epic/planning) · `IMPL-L4-*` (code) · `DIV-L4-*` (decision, no code). Issue bodies: **English**.

**After creating an issue:**

1. `gh project item-add 1 --owner gnosis-box --url https://github.com/gnosis-box/THP-for-Good/issues/NN`
2. Add one row to [`spec/PRD-MVP.md`](spec/PRD-MVP.md) § L4 and [`spec/useful-links.md`](spec/useful-links.md)
3. Non-trivial topics → dedicated spec (e.g. [`spec/analytics-strategy.md`](spec/analytics-strategy.md))

**Branches (do not mix docs + impl in one PR):**

| Branch | Contents | PR target |
|--------|----------|-----------|
| `feat/*-backlog`, `docs/*` | `.github/`, `spec/*.md`, PRD index | `dev` first |
| `impl/l4-*` | App code, API, UI | `dev` after doc PR merged; `git rebase origin/dev` before impl PR |

**On-chain facts (Circles):**

- **Group** `0x2b5E…` — membership / admin Promote (`GROUP_ADDRESS`)
- **Treasury org** `0xc02D…` — PAY split leg ([`lib/crc-pay.ts`](lib/crc-pay.ts) `FOUNDATION_ADDRESS`)
- CRC / transfer analytics → [Circles Explorer `/events`](https://explorer.aboutcircles.com/) per avatar (`?startBlock=`), not a custom indexer; SQLite enriches via `bookings.tx_hash` only

### Locked decisions (do not contradict in code or docs)

| ID | Choice | Notes |
| --- | --- | --- |
| **DIV-L0-01** | **A — SQLite + API** | `better-sqlite3`, `lib/db.ts`, `lib/schema.sql`, `app/api/*`. No `mentors.json` / no client `localStorage` for bookings or trust. |
| **DIV-L0-02** | **A — Coolify + Docker + volume** | Deploy on Coolify (not Vercel MVP). Add/maintain `Dockerfile`, `output: 'standalone'` in `next.config.ts`, persistent volume for `data/` SQLite. Set `NEXT_PUBLIC_FRAME_ANCESTOR_ORIGIN` at build. |
| **DIV-L0-03** | **A′ — PRD routes + `/calls`** | **Target:** `/`, `/mentor/[id]`, `/mentor/register`, **`/calls`**, `/admin` (not `/mentors/*`). **Repo may still use `/history` until an `implementation` task is done.** |
| **DIV-L1-01** | **A — Per-mentor price** | `price_crc` per mentor in DB; shown on card and PAY button. |
| **DIV-L1-02** | **D — Split payment** | Admin: **min 50%** to foundation (`0x2b5E…`). Mentor picks **10 / 20 / 30 / 50%** to self; remainder to foundation. Not 100% treasury-only. |
| **DIV-L1-03** | **C — Tags workflow** | Admin canonical catalogue; mentor **proposes** tag from mentor page; admin **approves/edits** tags. |
| **DIV-L1-04** | **A — TRUST expert (MVP)** | Post-call on `/calls` Emitted: one `trust.add(expert)` per booking. **Per-domain trust-back / reputation** → L4 feature (see PRD § FEAT Trust-back), not MVP. |
| **DIV-L1-05** | **A — Slots UI only** | Static `SlotPicker`; after PAY open `calendar_link`. Optional `slot_label` in DB later. No Google Calendar API in MVP. |
| **DIV-L1-06** | **A′ — Dual onboarding** | Self-register at `/mentor/register` → public if `active=1`. Admin can promote members and activate/deactivate listings. Not admin-only seed. |
| **DIV-L1-07** | **A — Admin hidden from nav** | No Admin item in `NAV`; access `/admin` by URL only. |
| **DIV-L1-08** | **D — Unified `/calls`** | One page: **Emitted** (booker) + **Received** (expert profile). No `/my-slots`. Prefer UI terms *participant / expert* over student/mentor. |
| **DIV-L1-09** | **B — Balance error on click** | Do not pre-disable PAY for low CRC; on failed tx show **toast** (e.g. “Not enough CRC”). Not A (pre-disable) or C (both). |
| **DIV-L2-01** | **C′ — CRC encoding via SDK** | `TransferBuilder` + `sendTransactions`; foundation `0x2b5E4045936ef12250a8c01e4Cbf71E9bEE69e00`. **SPIKE-L2-01** must prove split PAY (DIV-L1-02) before **IMPL-L1-02**. Fallback: viem manual (B) if spike fails. |
| **DIV-L2-02** | **C — TRUST execution** | Direct `trust.add(expert)` first; `sendTransactions` fallback if playground fails. |
| **DIV-L2-03** | **B — Admin auth** | `ADMIN_ADDRESSES` ∪ DB `admins`; canonical `isAdminAddress()`. |
| **DIV-L2-04** | **A — No in-app notify MVP** | External calendar link + `/calls` Received; webhook/email deferred. |
| **DIV-L2-05** | **A — Minimal DB schema** | No `slot_label` / `skill_tag_id` on trust yet; trust-back per domain is L4. |
| **DIV-L3-01** | **B — Mobile-first nav** | No persistent desktop sidebar; header + mobile menu (`MobileNav`). Not bottom tab bar (≠ C). |
| **DIV-L3-02** | **A — Dedicated outside-host hint** | When `!isMiniappHost`, show dedicated `OpenInCirclesHint` with playground link; not generic scattered copy only. |
| **DIV-L3-03** | **A — English UI (MVP)** | All user-facing strings in **EN** for hackathon. i18n (FR/EN) deferred to **v2**. Spec/docs may stay FR. |

## Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | **Next.js 16** App Router | Turbopack is the default bundler; routes live at top-level `app/`, not `src/app/` |
| Language | **TypeScript 5** | Strict mode on; path alias `@/*` → project root |
| Styling | **Tailwind v4** + **shadcn/ui** | shadcn uses Base UI under the hood (`@base-ui/react`), not Radix. There is no `tailwind.config.js` — theme tokens live in `app/globals.css` under `@theme inline { … }` |
| Package manager | **pnpm** | Lock at `pnpm-lock.yaml`; never mix with npm/yarn |
| Theme | **Dark only** (Gnosis 2026 palette) | `class="dark"` on `<html>`; tokens in `app/globals.css` under `:root` / `.dark`. No light-mode toggle in MVP redesign. |
| Circles SDKs | `@aboutcircles/miniapp-sdk` + `@aboutcircles/sdk` | See "Working with the Circles SDKs" below |

## Project structure

```
app/
  layout.tsx                    Root: <WalletProvider><AppShell>{children}
  page.tsx                      Dashboard (ConnectionCard + SignInDemo + NavCards)
  profile/page.tsx              Profile lookup
  actions/page.tsx              sendTransactions code sample
  globals.css                   Tailwind v4 + shadcn tokens (dark-only, Gnosis palette)
  icon.svg                      Favicon (Circles brand glyph)
components/
  brand/CirclesLogo.tsx         Inline-SVG brand mark
  layout/
    AppShell.tsx                Grid: header (col-span-full) + sidebar (md+) + main
    Header.tsx                  Logo, current-page crumb, MobileNav, WalletStatus
    Sidebar.tsx                 Desktop nav (md+), driven by lib/nav.ts
    MobileNav.tsx               Hamburger + Sheet drawer (below md)
    CurrentPage.tsx             "/ Dashboard" crumb in header
    NavCards.tsx                Dashboard's link-cards to /profile and /actions
    PageNav.tsx                 Prev/next sibling navigation at bottom of sub-pages
  wallet/
    WalletProvider.tsx          Client context, subscribes to onWalletChange
    WalletStatus.tsx            Badge with shortened address
    ConnectionCard.tsx          Full connection details card
    SignInDemo.tsx              signMessage() demo
  profile/
    ProfileLookup.tsx           Profile lookup via getProfileView + getProfileByCid
  ui/                           shadcn primitives — DO NOT hand-edit; regenerate via the CLI
hooks/
  use-wallet.ts                 Re-export of useWallet
lib/
  utils.ts                      cn() + shortenAddress(addr, chars=4)
  nav.ts                        NAV array — single source of truth for the sidebar/drawer/page-nav
next.config.ts                  CSP frame-ancestors header for the Circles playground iframe
```

## Working with the Circles SDKs

There are two packages, and they serve different purposes. Get this wrong and the app will silently misbehave.

### `@aboutcircles/miniapp-sdk` — host bridge

Used for everything that talks to the Circles host (the user's wallet and Safe).

```ts
import {
  onWalletChange,      // (cb: (address: string | null) => void) => unsubscribe
  isMiniappMode,       // () => boolean — true when running inside the host iframe
  sendTransactions,    // (txs: { to, data?, value? }[]) => Promise<string[]>
  signMessage,         // (msg, signatureType?) => Promise<{ signature, verified }>
  onAppData,           // host can pass extra app data via ?data=
} from '@aboutcircles/miniapp-sdk';
```

**Rules:**
- **There is no "Connect" button.** The host pushes the wallet via `onWalletChange`. If you find yourself adding a connect button, you are working around the wrong problem. Outside the host (standalone `pnpm dev`), the callback never fires — the "Not connected" state is *expected*, not a bug.
- **The SDK touches `window` and `parent`.** It must be dynamically imported inside a client component's `useEffect`. **Never** top-level import it from a server component or a top-level module — you will see `window is not defined` at build time. See `WalletProvider.tsx` for the canonical pattern (`import('@aboutcircles/miniapp-sdk').then(({ onWalletChange }) => …)`).
- **`onWalletChange` returns an unsubscribe function.** Capture it and call it in the effect's cleanup, or you will leak subscriptions on hot reload.

### `@aboutcircles/sdk` — read/write Circles data

Used to query the Circles indexer and protocol state (avatars, profiles, balances, trust, transfers).

**For READ operations, use `sdk.rpc.profile.getProfileView(address)`. Do NOT use `sdk.getAvatar(address)`.**

```ts
// ✅ Correct — degrades gracefully for unregistered addresses
const sdk = new Sdk();
const view = await sdk.rpc.profile.getProfileView(address);
// → { avatarInfo?, profile?, trustStats, v2Balance?, v1Balance? }
if (view.avatarInfo) {
  // address is a Circles avatar — render
  if (view.avatarInfo.cidV0) {
    const full = await sdk.rpc.profile.getProfileByCid(view.avatarInfo.cidV0);
    // → richer Profile { name, description, imageUrl, previewImageUrl, location }
  }
} else {
  // not registered — show a friendly message, don't treat as an error
}

// ❌ Wrong — wraps everything in try/catch and throws "Avatar not found"
// even on valid avatars whose on-chain cidV0Digest is empty.
const avatar = await sdk.getAvatar(address);
const profile = await avatar.profile.get();
```

`sdk.getAvatar()` is the right call when you need a write-capable `Avatar` instance to call `trust.add`, `transfer.direct`, `personalToken.mint`, etc. Reserve it for those cases — never for read-only lookups.

**Balance formatting:** `view.v2Balance` is already a decimal CRC string (e.g. `"1219.71…"`), **not** atto-CRC. Don't divide it by `1e18`.

### Default RPC endpoint

`new Sdk()` defaults to Gnosis Chain mainnet via `https://rpc.aboutcircles.com/`. No configuration is required for the boilerplate.

## Wallet context

[`components/wallet/WalletProvider.tsx`](components/wallet/WalletProvider.tsx) wraps `onWalletChange` in a React context. It is mounted once in [`app/layout.tsx`](app/layout.tsx). Anywhere downstream:

```tsx
'use client';
import { useWallet } from '@/hooks/use-wallet';

const { address, isConnected, isMiniappHost } = useWallet();
```

- `address: string | null` — checksummed or lowercased per the host; treat as opaque
- `isConnected: boolean` — `!!address`
- `isMiniappHost: boolean` — `true` only when running inside the Circles iframe; useful for showing "open in Circles" hints during standalone dev

`useWallet()` must be called from a `'use client'` component.

## Navigation

The sidebar, mobile drawer, current-page crumb, and prev/next page nav are all driven by a single source — [`lib/nav.ts`](lib/nav.ts). To add a route, edit `NAV` and create `app/<route>/page.tsx`. To reorder how prev/next links flow, reorder `NAV`.

```ts
// lib/nav.ts
export const NAV: NavItem[] = [
  { href: '/', label: 'Dashboard' },
  { href: '/profile', label: 'Profile' },
  { href: '/actions', label: 'Actions' },
];
```

The dashboard (`/`) intentionally has no `<PageNav />` because [`NavCards`](components/layout/NavCards.tsx) above it serves the same purpose. Sub-pages include `<PageNav />` at the bottom for sequential navigation.

## Styling

- **Tailwind v4.** `app/globals.css` imports `tailwindcss` and `shadcn/tailwind.css` and defines tokens under `@theme inline { … }`. There is no `tailwind.config.js`.
- **shadcn primitives** in `components/ui/`. **Do not hand-edit** them — they are CLI-generated. To update a component, regenerate it with `pnpm dlx shadcn@latest add <name> --overwrite`.
- **shadcn uses Base UI** (`@base-ui/react`), not Radix. Trigger components accept a `render={<Button … />}` prop, not `asChild`. See `MobileNav.tsx` for an example.
- **Dark-only theme.** Set `class="dark"` on `<html>` in `app/layout.tsx`. Tokens live in `app/globals.css` (`:root` mirrored to `.dark`). See `spec/design-tokens.md`.

## Common workflows

### Add a new route

1. Create `app/<route>/page.tsx`. Server component by default; only add `'use client'` if you use hooks/state/event handlers.
2. Add `{ href: '/<route>', label: '…' }` to `NAV` in `lib/nav.ts`.
3. Add `<PageNav />` at the bottom of the page (after main content). Skip on routes that already have a richer "where to go next" affordance.

### Add a shadcn component

```bash
pnpm dlx shadcn@latest add <name>          # e.g. dialog, tabs, dropdown-menu
```

Components land in `components/ui/`. They use Base UI primitives, not Radix.

### Add a Circles SDK call

1. Read the typed signature in `node_modules/@aboutcircles/sdk/dist/**/*.d.ts` — the bundled JS is minified but the `.d.ts` files are readable.
2. Dynamically import inside a client component's `useEffect`:
   ```ts
   const { Sdk } = await import('@aboutcircles/sdk');
   const sdk = new Sdk();
   const result = await sdk.rpc.<area>.<method>(…);
   ```
3. Handle the unregistered/empty case explicitly; most addresses are not Circles avatars and the SDK signals that with `undefined`, not exceptions (for `getProfileView`).
4. Probe new methods against the live RPC before wiring UI:
   ```bash
   curl -s -X POST https://rpc.aboutcircles.com/ -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","id":1,"method":"circles_<method>","params":[…]}'
   ```

## Commands

```bash
pnpm dev          # http://localhost:3000
pnpm build        # production build (Turbopack)
pnpm start        # run the built app
pnpm lint         # ESLint (the script is just `eslint`; `next lint` is removed in 16)
```

There is no test suite yet. If you add one, the conventional script name is `pnpm test`.

## Deployment — Coolify (self-hosted)

This app is deployed on **Coolify** (self-hosted PaaS, not Vercel). Key implications:

- **SQLite persists** — Coolify runs a long-lived container, so `data/thp.db` survives between deployments as long as you mount a volume. Configure a persistent volume in Coolify pointing to `/app/data` (or wherever `process.cwd()/data` resolves inside the container).
- **`better-sqlite3` native build** — Coolify builds a Docker image on Linux; `pnpm install` triggers the native compilation there without macOS C++ header issues. The `.node` binding is compiled fresh in the container.
- **Environment variables** — set `ADMIN_ADDRESSES` and `NEXT_PUBLIC_ADMIN_ADDRESSES` in the Coolify service environment panel (not in `.env` files).
- **CSP frame-ancestors** — `next.config.ts` must include the Coolify domain in `frame-ancestors` so the Circles host can iframe the app. Update the `FRAME_ANCESTORS` list in `next.config.ts` when the production domain is known.
- **Port** — Coolify expects the app to listen on `3000` (Next.js default). No `PORT` override needed.

### Local dev on macOS — `better-sqlite3` native binding

On macOS, `pnpm rebuild better-sqlite3` may fail with `'climits' file not found` if node-gyp picks up the wrong SDK. Fix:

```bash
# Run once to compile the native addon
npm rebuild better-sqlite3
```

If that still fails, ensure Xcode Command Line Tools are up to date:
```bash
xcode-select --install
```

`serverExternalPackages: ['better-sqlite3']` is already set in `next.config.ts` so Turbopack doesn't try to bundle the native module — it's loaded directly from `node_modules` at runtime.

## Running inside the Circles playground

The host iframes any HTTPS URL pasted into https://circles.gnosis.io/playground. To test:

1. Deploy to Coolify (or any HTTPS host).
2. Open `https://circles.gnosis.io/playground?url=<your-deploy-url>`.
3. The host injects a Safe address. `onWalletChange` fires, the badge flips, `signMessage` and `sendTransactions` start working.

[`next.config.ts`](next.config.ts) ships a `Content-Security-Policy: frame-ancestors 'self' https://circles.gnosis.io https://*.vercel.app;` header so the iframe can load. If you deploy to a different domain, add it to the allowlist.

For permanent marketplace placement, open a PR against [`aboutcircles/CirclesMiniapps`](https://github.com/aboutcircles/CirclesMiniapps) adding an entry to `static/miniapps.json`.

## Gotchas — read before changing things

- **Do not add a "Connect wallet" button.** The host is the wallet UI.
- **Do not top-level import either Circles SDK** from a server component or page file. Always dynamically import inside a client `useEffect`.
- **Do not use `sdk.getAvatar()` for read flows** — use `sdk.rpc.profile.getProfileView()`. The former silently masks errors as "Avatar not found".
- **Do not divide `v2Balance` by `1e18`** — it is already a decimal string.
- **Do not hand-edit `components/ui/*`** — regenerate via the shadcn CLI.
- **Do not remove dark mode** without an explicit product decision — the MVP redesign is dark-only.
- **Do not edit `next-env.d.ts`** — it is regenerated on every build.
- **Do not run `next lint`** — Next 16 removed that CLI; use the `pnpm lint` script which invokes `eslint` directly.
- **Do not run `pnpm dev` in the background without need.** Stop it when done; orphaned dev servers eat ports and confuse the next run. Use `pkill -f "next dev"` to clean up.
- **Do not commit `.env`** — only `.env.example` is tracked. The `.gitignore` rule `.env*.local` plus `.env` enforces this.
