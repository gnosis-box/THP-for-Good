# THP for Good — Circles Miniapp

**Book mentor calls. Pay in CRC. Fund free bootcamp places.**

Mini-application [Circles](https://aboutcircles.com) pour le fonds [THP for Good](https://aboutcircles.com) : marketplace de mentorat où les réservations sont payées en **CRC** et reversées au trésor du groupe Circles THP for Good.

> Documentation complète (français, schémas, historique) : **[docs/README.md](./docs/README.md)**

## Quickstart

```bash
pnpm install
cp .env.example .env.local   # mentor Circles addresses + foundation
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Wallet stays disconnected outside the Circles host — expected.

Test in the host: [Circles playground](https://circles.gnosis.io/playground?url=<your-https-deploy-url>).

## Features (branch `ToXY`)

| Route | Purpose |
|-------|---------|
| `/mentors` | Browse mentors, filter by domain |
| `/mentors/[slug]` | Pick a slot, sign in, pay **100 CRC** to THP for Good |
| `/calls` | Booking history + **TRUST** mentor on Circles |
| `/` | Wallet connection demo (boilerplate) |
| `/profile`, `/actions` | SDK demos from the starter template |

Payments resolve the THP **group** address to its on-chain **treasury** before `transfer.direct`. Bookings are stored in `localStorage` per wallet (server DB on branch `zet`).

## Stack

Next.js 16 · React 19 · Tailwind v4 · shadcn/ui · `@aboutcircles/miniapp-sdk` · `@aboutcircles/sdk` · TanStack Query · viem

## Configuration

See [`.env.example`](./.env.example) and [docs/04-guide-developpeur.md](./docs/04-guide-developpeur.md).

| Variable | Role |
|----------|------|
| `NEXT_PUBLIC_FOUNDATION_ADDRESS` | THP group (`0x2b5E…`) — auto-resolved to treasury |
| `NEXT_PUBLIC_MENTOR_*_ADDRESS` | Circles avatar per mentor (profiles + trust) |
| `NEXT_PUBLIC_BOOKING_PRICE_CRC` | Default `100` |

## Scripts

| Command | Action |
|---------|--------|
| `pnpm dev` | Dev server `:3000` |
| `pnpm build` | Production build |
| `pnpm start` | Run production server |
| `pnpm lint` | ESLint |

## Documentation

| Doc | Description |
|-----|-------------|
| [docs/01-presentation.md](./docs/01-presentation.md) | Mission, features, mockup |
| [docs/02-architecture.md](./docs/02-architecture.md) | Diagrams, CRC flow, SDK rules |
| [docs/03-guide-utilisateur.md](./docs/03-guide-utilisateur.md) | End-user booking guide |
| [docs/04-guide-developpeur.md](./docs/04-guide-developpeur.md) | Setup, structure, deploy |
| [docs/05-historique.md](./docs/05-historique.md) | Git timeline, branches, roadmap |
| [docs/spec/PRD.md](./docs/spec/PRD.md) | Product spec (hackathon) |

## Circles miniapp essentials

- **No Connect button** — the host injects the wallet via `onWalletChange`.
- **Dynamic-import both SDKs** in client components only (see `WalletProvider.tsx`).
- **Read profiles** with `sdk.rpc.profile.getProfileView()` — not `getAvatar()` for lookups.
- **iframe CSP** — `next.config.ts` sets `frame-ancestors` for `*.gnosis.io` and Vercel previews.

Full boilerplate notes (signing, `sendTransactions`, gotchas): still valid below and in [AGENTS.md](./AGENTS.md).

<details>
<summary>Boilerplate reference (wallet, signing, profile lookup)</summary>

### Wallet connection

```ts
import { onWalletChange } from '@aboutcircles/miniapp-sdk';

const unsubscribe = onWalletChange((address) => {
  // Safe address from the host, or null
});
```

```tsx
import { useWallet } from '@/hooks/use-wallet';
const { address, isConnected, isMiniappHost } = useWallet();
```

### Sign in

```ts
const { signature, verified } = await signMessage('Sign in to THP for Good\nNonce: …');
```

### Profile lookup

```ts
const sdk = new Sdk();
const view = await sdk.rpc.profile.getProfileView(address);
```

### Send transactions

```ts
const txHashes = await sendTransactions([{ to: '0x…', data: '0x…', value: '0' }]);
```

</details>

## Learn more

- [Embedded miniapps docs](https://docs.aboutcircles.com/miniapps/embedded-mini-apps)
- [Circles playground](https://circles.gnosis.io/playground)
- [CirclesMiniapps marketplace repo](https://github.com/aboutcircles/CirclesMiniapps)

## License

MIT
