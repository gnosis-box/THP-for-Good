# Documentation THP for Good

[![Circles Miniapp](https://img.shields.io/badge/Circles-miniapp-7c3aed)](https://docs.aboutcircles.com/miniapps/embedded-mini-apps)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![Docs](https://img.shields.io/badge/lang-français-blue)](./README.md)

Documentation officielle du miniapp **THP for Good** — marketplace de mentorat sur [Circles](https://aboutcircles.com), avec paiements en CRC au profit du fonds communautaire THP.

> [!TIP]
> Sur GitHub, ouvrez ce dossier via **[`docs/`](https://github.com/gnosis-box/THP-for-Good/tree/HEAD/docs)**. Les diagrammes Mermaid et images s’affichent nativement dans l’interface GitHub.

## Table des matières

| # | Document | Public | Contenu |
|---|----------|--------|---------|
| 1 | [**Présentation**](./01-presentation.md) | Tous | Mission, modèle économique, fonctionnalités |
| 2 | [**Architecture technique**](./02-architecture.md) | Développeurs | Stack, schémas, flux CRC, intégration Circles |
| 3 | [**Guide utilisateur**](./03-guide-utilisateur.md) | Utilisateurs | Réserver, payer, trust, prérequis hôte |
| 4 | [**Guide développeur**](./04-guide-developpeur.md) | Contributeurs | Installation, config, déploiement |
| 5 | [**Historique & roadmap**](./05-historique.md) | Produit | Chronologie Git, branches, évolutions |

## Ressources annexes

| Ressource | Lien |
|-----------|------|
| Spécification produit (PRD) | [`spec/PRD.md`](./spec/PRD.md) |
| Maquette wireframe | [`assets/mockup-wireframe.png`](./assets/mockup-wireframe.png) |
| Guide agents IA | [`AGENTS.md`](../AGENTS.md) |
| README projet (EN) | [`README.md`](../README.md) |

## État du dépôt

> [!NOTE]
> **Branche `ToXY` (courante)** — portage Gnosis-App : mentors en `.env`, réservations `localStorage`, enrichissement Circles côté serveur.

> [!NOTE]
> **Branche `zet`** — SQLite, inscription mentor, admin, API complètes. Détails : [Historique & roadmap](./05-historique.md).

## Navigation rapide

```text
docs/
├── README.md                 ← vous êtes ici
├── 01-presentation.md
├── 02-architecture.md
├── 03-guide-utilisateur.md
├── 04-guide-developpeur.md
├── 05-historique.md
├── assets/
│   └── mockup-wireframe.png
└── spec/
    └── PRD.md
```
