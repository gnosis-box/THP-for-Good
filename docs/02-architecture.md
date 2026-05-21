# Architecture technique

[← Présentation](./01-presentation.md) · [Documentation](./README.md) · [Guide utilisateur →](./03-guide-utilisateur.md)

## Table des matières

- [Stack](#stack)
- [Vue d’ensemble](#vue-densemble)
- [Intégration Circles](#intégration-circles--règles-critiques)
- [Flux de paiement CRC](#flux-de-paiement-crc-100-crc)
- [Flux Trust](#flux-trust-post-appel)
- [Routes](#routes-applicatives)
- [Sécurité iframe](#sécurité--iframe)
- [Évolutions branche zet](#évolutions-architecture-branche-zet)

---

## Stack

| Couche | Technologie | Rôle |
|--------|-------------|------|
| Framework | **Next.js 16** (App Router, Turbopack) | Pages, API routes, SSR/cache |
| UI | **React 19**, **Tailwind v4**, **shadcn/ui** (Base UI) | Interface mobile-first (`max-w-md`) |
| État client | **TanStack Query** | Liste mentors via `/api/mentors` |
| Blockchain read | `@aboutcircles/sdk` | Profils, pathfinder, `transfer.direct` |
| Blockchain write (hôte) | `@aboutcircles/miniapp-sdk` | Wallet, `signMessage`, `sendTransactions` |
| Encodage tx | **viem** (transitif) | Runner miniapp, receipts Gnosis |
| Persistance réservations | `localStorage` | Historique par wallet (MVP `ToXY`) |
| Persistance mentors (futur) | **SQLite** (`better-sqlite3`) | Branche `zet` |
| Déploiement | **Coolify** (Nixpacks + pnpm) | `nixpacks.toml`, CSP iframe |

## Vue d’ensemble

```mermaid
flowchart TB
  subgraph Host["Hote Circles iframe"]
    SAFE[Safe utilisateur]
    SDK_M["miniapp-sdk"]
  end

  subgraph Next["Next.js THP for Good"]
    WP[WalletProvider]
    MP[MentorsProvider + React Query]
    API["/api/mentors"]
    ENR[mentor-profiles.server.ts]
    PAGES["/mentors /calls"]
    LS[(localStorage bookings)]
  end

  subgraph Gnosis["Gnosis Chain"]
    RPC_C[rpc.aboutcircles.com]
    RPC_G[rpc.gnosischain.com]
    TREASURY[Tresor THP]
  end

  SAFE <-->|onWalletChange sendTransactions| SDK_M
  SDK_M <--> WP
  WP --> PAGES
  PAGES --> MP
  MP --> API
  API --> ENR
  ENR --> RPC_C
  PAGES -->|buildCrcPaymentTransactions| RPC_C
  PAGES -->|sendTransactions| SDK_M
  SDK_M --> TREASURY
  PAGES --> LS
  ENR --> RPC_G
```

## Intégration Circles — règles critiques

### Deux SDK, deux rôles

```mermaid
sequenceDiagram
  participant H as Hote Circles
  participant MA as miniapp-sdk
  participant App as React app
  participant SDK as aboutcircles sdk

  H->>MA: injecte adresse Safe
  MA->>App: onWalletChange address
  App->>MA: signMessage login
  MA->>H: signature EIP-1271
  App->>SDK: getProfileView lecture
  App->>SDK: transfer.direct capture calldata
  App->>MA: sendTransactions txs
  MA->>H: batch Safe signe
```

| SDK | Usage dans THP for Good |
|-----|-------------------------|
| `miniapp-sdk` | Composants client uniquement + import dynamique : wallet, signature, envoi tx |
| `@aboutcircles/sdk` | Lecture profils (`getProfileView`), pathfinder, construction transfert CRC |

> [!WARNING]
> Ne **jamais** importer ces SDK au top-level d’un Server Component — erreur `window is not defined` au build.

### Lecture profil vs écriture

| Opération | API recommandée |
|-----------|-----------------|
| Lecture profil / balance | `sdk.rpc.profile.getProfileView(address)` |
| Trust / transfert CRC | `sdk.getAvatar(address)` + `ContractRunner` custom (capture txs) |

## Flux de paiement CRC (100 CRC)

```mermaid
flowchart TD
  A[Creneau selectionne] --> B{signedIn}
  B -->|non| E[Erreur Login requis]
  B -->|oui| C[resolveFoundationSink]
  C --> D{Adresse groupe THP}
  D -->|oui| F[eth_call BASE_TREASURY]
  D -->|non| G[Adresse configuree]
  F --> H[Tresor 0xA98e09b8]
  G --> H
  H --> I[findMaxFlow]
  I --> J{Solde suffisant}
  J -->|non| K[Erreur solde]
  J -->|oui| L[transfer.direct capture]
  L --> M[sendTransactions]
  M --> N[addBooking localStorage]
  N --> O[Redirect /calls]
```

### Fichiers clés

| Fichier | Responsabilité |
|---------|----------------|
| [`lib/config.ts`](../lib/config.ts) | Adresses groupe/trésor, prix CRC |
| [`lib/foundation-sink.ts`](../lib/foundation-sink.ts) | Résolution groupe → trésor |
| [`lib/crc-transfer.ts`](../lib/crc-transfer.ts) | Pathfinder, capture → format miniapp |
| [`hooks/use-book-call.ts`](../hooks/use-book-call.ts) | Orchestration login + paiement |
| [`components/mentors/BookCallButton.tsx`](../components/mentors/BookCallButton.tsx) | UI PAY + feedback |

> [!NOTE]
> **Pourquoi le trésor ?** Le pathfinder Circles refuse les avatars « groupe » comme destinataire. L’adresse du groupe THP (`0x2b5E…`) est résolue vers son **BASE_TREASURY** avant transfert.

## Flux Trust post-appel

```mermaid
sequenceDiagram
  participant U as Utilisateur
  participant App as useTrustMentor
  participant SDK as Sdk Avatar
  participant MA as miniapp-sdk

  U->>App: TRUST mentor
  App->>SDK: isTrusting mentorAddress
  alt deja trust
    App-->>U: Bouton desactive
  else
    App->>SDK: trust.add mentorAddress
    SDK->>MA: sendTransactions via runner
    App-->>U: Succes txHash
  end
```

## Routes applicatives

| Route | Type | Description |
|-------|------|-------------|
| `/` | Server | Dashboard boilerplate |
| `/mentors` | Client | Liste + filtre domaine |
| `/mentors/[slug]` | Client | Fiche mentor, créneaux, paiement |
| `/calls` | Client | Historique + bouton Trust |
| `/profile` | Server | Démo lookup Circles |
| `/actions` | Server | Démo `sendTransactions` |
| `/api/mentors` | API GET | Mentors enrichis (revalidate 300s) |

Navigation : [`lib/nav.ts`](../lib/nav.ts).

## Sécurité & iframe

Entête définie dans [`next.config.ts`](../next.config.ts) :

```http
Content-Security-Policy: frame-ancestors 'self' https://*.gnosis.io https://*.gnosis.box https://*.vercel.app;
```

> [!WARNING]
> Sans `frame-ancestors`, le host Circles ne peut pas embarquer l’application.

## Évolutions architecture (branche `zet`)

```mermaid
erDiagram
  skill_tags ||--o{ mentor_skills : has
  mentors ||--o{ mentor_skills : has
  mentors ||--o{ bookings : receives
  skill_tags {
    int id PK
    text label UK
  }
  mentors {
    int id PK
    text circles_address UK
    text name
    text calendar_link
    int price_crc
    int active
  }
  bookings {
    int id PK
    int mentor_id FK
    text booker_address
    text tx_hash
  }
```

Schéma SQL complet et routes API : [`spec/PRD.md`](./spec/PRD.md).

---

[← Présentation](./01-presentation.md) · [Guide utilisateur →](./03-guide-utilisateur.md)
