# THP for Good — Circles Miniapp

[![Circles](https://img.shields.io/badge/Circles-miniapp-7c3aed)](https://docs.aboutcircles.com/miniapps/embedded-mini-apps)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
**Book mentor calls. Pay in CRC. Fund free bootcamp places.**

Mini-application [Circles](https://aboutcircles.com) pour le fonds **THP for Good** : marketplace de mentorat où les réservations sont payées en **CRC** et reversées au trésor du groupe Circles.

## Documentation

| Langue | Lien |
|--------|------|
| **Français (complète)** | **[`docs/`](./docs/README.md)** — présentation, architecture, guides, historique |
| PRD hackathon | [`docs/spec/PRD.md`](./docs/spec/PRD.md) |
| Agents IA | [`AGENTS.md`](./AGENTS.md) |

## Quickstart

```bash
git clone https://github.com/gnosis-box/THP-for-Good.git
cd THP-for-Good
pnpm install
cp .env.example .env.local
pnpm dev
```

| Étape | Détail |
|-------|--------|
| Local | [http://localhost:3000](http://localhost:3000) — wallet déconnecté hors iframe : **normal** |
| Circles host | `https://circles.gnosis.io/playground?url=<your-deploy-url>` |

> [!IMPORTANT]
> Pas de bouton « Connect wallet » : le host Circles injecte le Safe via `onWalletChange`.

## Features (branch `ToXY`)

| Route | Description |
|-------|-------------|
| [`/mentors`](./app/mentors/page.tsx) | Catalogue mentors, filtre par domaine |
| [`/mentors/[slug]`](./app/mentors) | Créneau + paiement **100 CRC** |
| [`/calls`](./app/calls/page.tsx) | Historique + **TRUST** mentor |
| `/` | Démo connexion (boilerplate) |

Paiements : groupe THP → trésor on-chain → `transfer.direct`. Réservations : `localStorage` (SQLite sur branche `zet`).

## Stack

`Next.js 16` · `React 19` · `Tailwind v4` · `shadcn/ui` · `@aboutcircles/miniapp-sdk` · `@aboutcircles/sdk` · `TanStack Query` · `viem`

## Configuration

Voir [`.env.example`](./.env.example) et le [guide développeur](./docs/04-guide-developpeur.md).

```dotenv
NEXT_PUBLIC_FOUNDATION_ADDRESS=0x2b5E4045936ef12250a8c01e4Cbf71E9bEE69e00
NEXT_PUBLIC_MENTOR_ZET_ADDRESS=0x…
```

## Scripts

```bash
pnpm dev      # :3000
pnpm build
pnpm start
pnpm lint
```

## Circles essentials

<details>
<summary>Wallet, signing, profile lookup (boilerplate)</summary>

```ts
import { onWalletChange, signMessage, sendTransactions } from '@aboutcircles/miniapp-sdk';
import { Sdk } from '@aboutcircles/sdk';

const sdk = new Sdk();
const view = await sdk.rpc.profile.getProfileView(address);
```

Règles détaillées : [`AGENTS.md`](./AGENTS.md) · [`docs/02-architecture.md`](./docs/02-architecture.md).

</details>

## Links

- [Embedded miniapps docs](https://docs.aboutcircles.com/miniapps/embedded-mini-apps)
- [Circles playground](https://circles.gnosis.io/playground)
- [CirclesMiniapps marketplace](https://github.com/aboutcircles/CirclesMiniapps)

## License

MIT (voir historique du dépôt).
