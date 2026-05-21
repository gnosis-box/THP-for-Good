# Documentation THP for Good

Documentation officielle du miniapp **THP for Good** — marketplace de mentorat sur [Circles](https://aboutcircles.com), avec paiements en CRC au profit du fonds communautaire THP.

## Par où commencer ?

| Document | Public | Contenu |
|----------|--------|---------|
| [01 — Présentation](./01-presentation.md) | Tous | Mission, modèle économique, fonctionnalités |
| [02 — Architecture technique](./02-architecture.md) | Développeurs | Stack, schémas, flux CRC, intégration Circles |
| [03 — Guide utilisateur](./03-guide-utilisateur.md) | Utilisateurs finaux | Réserver, payer, trust, prérequis hôte |
| [04 — Guide développeur](./04-guide-developpeur.md) | Contributeurs | Installation, config, structure du code, déploiement |
| [05 — Historique & roadmap](./05-historique.md) | Équipe produit | Chronologie Git, branches, évolutions prévues |

## Ressources annexes

- [Spécification produit (PRD)](./spec/PRD.md) — plan d’implémentation hackathon (branche `zet`)
- [Maquette wireframe](./assets/mockup-wireframe.png) — écrans cibles du parcours mentor
- [AGENTS.md](../AGENTS.md) — conventions pour assistants IA sur ce dépôt
- [README.md](../README.md) — démarrage rapide (anglais, hérité du boilerplate Circles)

## État du dépôt (mai 2026)

La branche **`ToXY`** (courante) porte le portage depuis Gnosis-App : mentors en configuration, réservations en `localStorage`, enrichissement Circles côté serveur.

La branche **`zet`** ajoute SQLite, inscription mentor, admin et API complètes — voir [05 — Historique](./05-historique.md).
