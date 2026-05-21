# État du projet — reprise de travail

[← Guide développeur](./04-guide-developpeur.md) · [Documentation](./README.md)

> **Agents IA & développeurs :** lire ce fichier **en premier** pour reprendre le travail. La section [Reprise automatique](#reprise-automatique) est régénérée à chaque modification du code (`pnpm docs:status` ou hook Cursor).

## Table des matières

- [Reprise automatique](#reprise-automatique)
- [Notes de session (manuel)](#notes-de-session-manuel)
- [Décisions & pièges CRC](#décisions--pièges-crc)
- [Historique condensé](#historique-condensé)
- [Références](#références)

---

## Reprise automatique

<!-- STATUS:AUTO:BEGIN -->
<!-- Ne pas éditer : généré par scripts/update-status-doc.mjs -->

> Dernière mise à jour : **2026-05-21T00:50:19Z** · `pnpm docs:status`

### Reprise en 60 secondes

| | |
|---|---|
| **Branche** | `ToXY` |
| **Dernier commit** | `1b3ef7f — Refactor documentation structure and enhance content for THP for Go…` |
| **État git** | `## ToXY...origin/ToXY ·  M AGENTS.md ·  M README.md ·  M docs/04-guide-developpeur.md ·  D docs/05-historique.md ·  M docs/README.md ·  M docs/spec/PRD.md ·  M package.json · ?? .cursor/ · ?? docs/05-etat-projet.md · ?? docs/status.backlog.json · ?? scripts/` |
| **Focus** | Merger persistance serveur (branche zet) avec l'UI mentors/calls actuelle |
| **Prochaine tâche backlog** | Fusionner SQLite + API CRUD (zet) avec routes /mentors ToXY |
| **Backlog auto** | 0/6 détectés comme faits |

Branche **`ToXY`** — ↑0 / ↓0 vs `origin/ToXY`.

> [!IMPORTANT]
> **Reprendre ici :** Fusionner SQLite + API CRUD (zet) avec routes /mentors ToXY. Puis `pnpm lint` + `pnpm build`. Tester dans le [playground Circles](https://circles.gnosis.io/playground).

### Routes actives

- `/`
- `/actions`
- `/api/mentors`
- `/calls`
- `/mentors`
- `/mentors/[slug]`
- `/profile`

### Navigation (`lib/nav.ts`)

- `/` — Dashboard
- `/mentors` — Mentors
- `/calls` — Mes appels
- `/profile` — Profile
- `/actions` — Actions

### Fonctionnalités détectées

| Feature | État | Fichier |
|---------|:----:|---------|
| Liste + filtre mentors | done | `app/mentors/page.tsx` |
| Fiche mentor + créneaux | done | `app/mentors/[slug]/page.tsx` |
| Paiement CRC | done | `lib/crc-transfer.ts` |
| Résolution trésor THP | done | `lib/foundation-sink.ts` |
| Historique appels | done | `app/calls/page.tsx` |
| Bookings localStorage | done | `lib/bookings-storage.ts` |
| Trust mentor | done | `hooks/use-trust-mentor.ts` |
| Login signMessage | done | `hooks/use-sign-in.ts` |
| API mentors enrichie | done | `app/api/mentors/route.ts` |
| SQLite / db | todo | `lib/db.ts` |
| API bookings | todo | `app/api/bookings/route.ts` |
| Inscription mentor | todo | `app/mentor/register/page.tsx` |
| Admin | todo | `app/admin/page.tsx` |
| API tags | todo | `app/api/tags/route.ts` |

### Modules clés

**lib/** — lib/analytics.ts, lib/bookings-storage.ts, lib/circles-errors.ts, lib/config.ts, lib/crc-transfer.ts, lib/foundation-sink.ts, lib/mentor-profiles.server.ts, lib/mentors.ts, lib/miniapp-runner.ts, lib/nav.ts, lib/sign-in-message.ts, lib/utils.ts

**hooks/** — hooks/use-book-call.ts, hooks/use-circles-avatar.ts, hooks/use-mentors.ts, hooks/use-sign-in.ts, hooks/use-trust-mentor.ts, hooks/use-wallet.ts

### Backlog (source : `docs/status.backlog.json`)

**Focus actuel :** Merger persistance serveur (branche zet) avec l'UI mentors/calls actuelle

| P | Tâche | État | Détection |
|---|-------|:----:|-----------|
| P0 | Fusionner SQLite + API CRUD (zet) avec routes /mentors ToXY | todo | `lib/db.ts` |
| P1 | POST /api/bookings — remplacer localStorage seul | todo | `app/api/bookings/route.ts` |
| P1 | Page inscription mentor /mentor/register | todo | `app/mentor/register/page.tsx` |
| P1 | Panneau admin mentors + tags | todo | `app/admin/page.tsx` |
| P2 | Ouvrir calendar_link mentor après paiement | todo | `—` |
| P2 | Migration Turso pour déploiement Vercel | todo | `—` |

### Écart vs cible `zet`

| Fonctionnalité (zet) | Branche courante |
|----------------------|:----------------:|
| Filtre skills (DB) | todo |
| POST booking serveur | todo |
| Google Calendar post-pay | todo |
| Devenir mentor | todo |
| Admin | todo |
| Accueil = catalogue | partiel |

### Derniers commits

| Commit | Date | Auteur | Message |
|--------|------|--------|---------|
| [`1b3ef7f`](https://github.com/gnosis-box/THP-for-Good/commit/1b3ef7f) | 2026-05-21 | toxy0392 | Refactor documentation structure and enhance content for THP for Good… |
| [`dc3fd68`](https://github.com/gnosis-box/THP-for-Good/commit/dc3fd68) | 2026-05-21 | toxy0392 | Update documentation and structure for THP for Good miniapp. Rename f… |
| [`e387b09`](https://github.com/gnosis-box/THP-for-Good/commit/e387b09) | 2026-05-21 | toxy0392 | Route mentor booking payments to THP foundation treasury. |
| [`84577a0`](https://github.com/gnosis-box/THP-for-Good/commit/84577a0) | 2026-05-21 | toxy0392 | feat: port mentor booking app from Gnosis-App |
| [`6af1786`](https://github.com/gnosis-box/THP-for-Good/commit/6af1786) | 2026-05-21 | Pretorya | Fix pnpm install on Coolify by removing workspace file. |
| [`ab54c74`](https://github.com/gnosis-box/THP-for-Good/commit/ab54c74) | 2026-05-21 | Pretorya | Configure Coolify deployment for production. |

### Fichiers modifiés (non commités)

- `GENTS.md` (M)
- `README.md` (M)
- `docs/04-guide-developpeur.md` (M)
- `docs/05-historique.md` (D)
- `docs/README.md` (M)
- `docs/spec/PRD.md` (M)
- `package.json` (M)
- `.cursor/` (??)
- `docs/05-etat-projet.md` (??)
- `docs/status.backlog.json` (??)
- `scripts/` (??)

<!-- STATUS:AUTO:END -->

## Notes de session (manuel)

<!-- STATUS:MANUAL:BEGIN -->

### Contexte de la dernière session

- Port Gnosis-App sur branche `ToXY` : routes `/mentors`, `/calls`, paiement CRC vers trésor THP.
- Documentation restructurée (`docs/`, format GitHub).
- **Prochaine intention :** merger la persistance SQLite + admin de `zet` sans casser l’UI actuelle.

### Bloquants / questions ouvertes

- [ ] Vérifier les adresses mentors en `.env.local` avant démo playground.
- [ ] Confirmer stratégie de merge `zet` → `ToXY` (rebase vs cherry-pick).

### Checklist avant de considérer une tâche terminée

- [ ] `pnpm docs:status` (met à jour ce fichier)
- [ ] `pnpm lint` + `pnpm build`
- [ ] Test playground Circles si touché wallet / paiement / trust

<!-- STATUS:MANUAL:END -->

## Décisions & pièges CRC

| Sujet | Décision |
|-------|----------|
| Destinataire paiement | Groupe THP → résolu en **trésor** (`resolveFoundationSink`) |
| Montant | `100 * 10^18` atto-CRC via `transfer.direct` |
| Lecture profil | `getProfileView`, pas `getAvatar()` en lecture seule |
| Bookings MVP | `localStorage` (`lib/bookings-storage.ts`) — cible : API + SQLite |
| Wallet | Pas de bouton Connect — `onWalletChange` host only |

## Historique condensé

| Période | Jalons |
|---------|--------|
| 18 mai 2026 | Boilerplate Circles (Next 16, wallet, profile demo) |
| 20 mai 2026 | PRD hackathon, wireframe, MVP Coolify |
| 21 mai 2026 | SQLite/admin (`zet`), port Gnosis-App (`ToXY`), fixes CRC trésor |

Branches : **`ToXY`** (courante, UI + env), **`zet`** (SQLite + admin + API), **`master`** (base + Coolify).

Commits : [gnosis-box/THP-for-Good/commits](https://github.com/gnosis-box/THP-for-Good/commits)

## Références

| Doc | Usage |
|-----|-------|
| [PRD](./spec/PRD.md) | Cible produit complète |
| [Architecture](./02-architecture.md) | Schémas flux |
| [Backlog JSON](./status.backlog.json) | Priorités P0–P2 (lu par le script) |
| [AGENTS.md](../AGENTS.md) | Règles SDK / Next.js |

---

[← Guide développeur](./04-guide-developpeur.md) · [Documentation](./README.md)
