# Présentation

[← Documentation](./README.md) · [Architecture technique →](./02-architecture.md)

## Table des matières

- [Qu’est-ce que THP for Good ?](#quest-ce-que-thp-for-good-)
- [Proposition de valeur](#proposition-de-valeur)
- [Fonctionnalités](#fonctionnalités-branche-courante-toxy)
- [Maquette produit](#maquette-produit)
- [Où utiliser l’application ?](#où-utiliser-lapplication-)
- [Liens utiles](#liens-utiles)

---

## Qu’est-ce que THP for Good ?

**THP for Good** est un fonds communautaire créé pour favoriser le code au service de l’intérêt général. Il finance des parcours de formation (bootcamp Développeur++, diplôme RNCP) pour des personnes porteuses de projets open source à impact social, sélectionnées par la communauté THP.

Ce dépôt héberge la **mini-application Circles** du même nom : une place de marché de mentorat où chacun peut réserver un appel avec un mentor expert, en payant en **CRC** (Circles Regeneration Currency). Les revenus alimentent le trésor du groupe Circles THP for Good et financent de nouvelles places en formation.

```mermaid
flowchart LR
  subgraph Utilisateurs
    U[Apprenant / visiteur]
  end
  subgraph Miniapp
    M[Liste mentors]
    B[Réservation + paiement CRC]
  end
  subgraph Onchain
    T[Tresor THP for Good]
    TR[Trust mentor]
  end
  subgraph Impact
    F[Formations financees]
  end
  U --> M --> B --> T
  B --> F
  U --> TR
```

## Proposition de valeur

| Acteur | Bénéfice |
|--------|----------|
| **Mentoré** | Accès rapide à un expert (IA, legal, design, photo, dev…) — paiement en monnaie Circles |
| **Mentor** | Visibilité, renforcement du graphe de confiance Circles via TRUST post-appel |
| **Fonds THP for Good** | Flux de revenus on-chain récurrents pour financer des bourses |
| **Écosystème Circles** | Cas d’usage concret : Safe hôte, transferts CRC, profils avatar |

## Fonctionnalités (branche courante `ToXY`)

| Fonctionnalité | Statut | Description |
|----------------|:------:|-------------|
| Catalogue mentors | Done | Quatre mentors seed (Zet, Flo, Dimitry, Vincent) + filtres par domaine |
| Profils Circles | Done | Avatar, bio, stats trust via `getProfileView` (cache serveur 5 min) |
| Créneaux | Done | Grille sur 5 jours ouvrés (10h / 14h), générée côté client |
| Connexion wallet | Done | Injection par l’hôte Circles (`onWalletChange`) |
| Login (signature) | Done | `signMessage` EIP-1271 avant paiement ou trust |
| Paiement 100 CRC | Done | Vers fondation THP ; résolution groupe → trésor |
| Historique appels | Done | `localStorage` par adresse wallet |
| Trust mentor | Done | `avatar.trust.add` après réservation |
| Inscription mentor | Planned | Branche `zet` (formulaire + SQLite) |
| Admin | Planned | Branche `zet` (whitelist organisateurs) |

## Maquette produit

Wireframe cible du parcours (hackathon) :

<p align="center">
  <img src="./assets/mockup-wireframe.png" alt="Maquette wireframe — liste mentors, fiche détail et paiement CRC" width="480" />
</p>

<p align="center"><em>Source : <code>spec/mockup.png</code> sur la branche <code>zet</code></em></p>

## Où utiliser l’application ?

| Environnement | URL / commande |
|---------------|----------------|
| Développement local | `pnpm dev` → `http://localhost:3000` (wallet déconnecté hors iframe : normal) |
| Playground Circles | `https://circles.gnosis.io/playground?url=<votre-url-https>` |
| Production | Déploiement Coolify ou Vercel — voir [Guide développeur](./04-guide-developpeur.md) |

> [!IMPORTANT]
> L’application est conçue pour tourner **dans l’iframe** du host Circles. Le Safe utilisateur est injecté par le host ; les transactions passent par `sendTransactions`.

## Liens utiles

- [Circles — Embedded miniapps](https://docs.aboutcircles.com/miniapps/embedded-mini-apps)
- [Playground Circles](https://circles.gnosis.io/playground)
- [RPC Circles (indexer)](https://rpc.aboutcircles.com/)
- Groupe THP on-chain : `0x2b5E4045936ef12250a8c01e4Cbf71E9bEE69e00`

---

[← Documentation](./README.md) · [Architecture technique →](./02-architecture.md)
