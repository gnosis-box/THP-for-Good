# Graph Report - THP-for-Good  (2026-05-25)

## Corpus Check
- 231 files · ~142,997 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1528 nodes · 3170 edges · 73 communities (66 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fe411ec7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 231 edges
2. `usePrefersReducedMotion()` - 59 edges
3. `useWallet()` - 41 edges
4. `motionClass()` - 32 edges
5. `UI_COPY` - 29 edges
6. `Button()` - 26 edges
7. `Décisions tranchées` - 24 edges
8. `isAdminRequest()` - 19 edges
9. `compilerOptions` - 16 edges
10. `buttonVariants` - 16 edges

## Surprising Connections (you probably didn't know these)
- `cn()` --calls--> `clsx`  [INFERRED]
  lib/utils.ts → package.json
- `GET()` --calls--> `isAdminRequest()`  [INFERRED]
  app/api/dao/members/route.ts → lib/api-auth.ts
- `ExpertPage()` --calls--> `getExpertById()`  [EXTRACTED]
  app/expert/[id]/page.tsx → lib/db.ts
- `navLinkClass()` --calls--> `cn()`  [EXTRACTED]
  components/layout/MobileNav.tsx → lib/utils.ts
- `NavLinks()` --calls--> `usePrefersReducedMotion()`  [EXTRACTED]
  components/layout/MobileNav.tsx → hooks/use-prefers-reduced-motion.ts

## Communities (73 total, 7 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (51): ExpertProfileHero(), Props, PaymentSummary(), Props, LegRowProps, Props, TrustPathPanel(), TrustProgressBar() (+43 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (41): UmamiScript(), inter, jetbrainsMono, metadata, poppins, ExpertFilterSheet(), Props, FEEDBACK_TYPES (+33 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (39): AboutHero(), AboutHowItWorks(), STEPS, AboutPage(), DaoSection(), LanguageFilter(), Props, Props (+31 more)

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (34): Props, BookingHistory(), EnrichedBooking, TrustButton(), MemberCard(), SupporterCard(), Item, ITEMS (+26 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (40): cn(), AvatarBadge(), AvatarGroup(), AvatarGroupCount(), ButtonGroup(), ButtonGroupSeparator(), ButtonGroupText(), buttonGroupVariants (+32 more)

### Community 5 - "Community 5"
Cohesion: 0.04
Nodes (46): dependencies, @aboutcircles/miniapp-sdk, @aboutcircles/sdk, @aboutcircles/sdk-transfers, @aboutcircles/sdk-utils, @base-ui/react, better-sqlite3, class-variance-authority (+38 more)

### Community 6 - "Community 6"
Cohesion: 0.04
Nodes (44): 10. Accessibility checklist (Definition of Done), 11. Implementation plan (suggested IMPL breakdown), 12. Locked decisions (DIV-L4-UI — 2026-05-21), 13. References, 14. Success metrics (qualitative), 1. Executive summary, 2.1 What the app is, 2.2 Primary flows (must excel) (+36 more)

### Community 7 - "Community 7"
Cohesion: 0.09
Nodes (32): HomePage(), ActiveFilterChips(), Props, ExpertBrowser(), Props, DayGroup, fmtDay(), groupByDay() (+24 more)

### Community 8 - "Community 8"
Cohesion: 0.05
Nodes (41): 10. Skills & workflow, 11. Branch & PR plan, 12. Summary, 1. Problem & shipped behaviour, 2. What is “the coin”? (CRC ontology), 3.1 Inflow categories, 3.2 Group vs org (do not confuse), 3. Where treasury CRC comes from (validated sources) (+33 more)

### Community 9 - "Community 9"
Cohesion: 0.05
Nodes (41): `@aboutcircles/miniapp-sdk` — host bridge, `@aboutcircles/sdk` — read/write Circles data, Add a Circles SDK call, Add a new route, Add a shadcn component, code:block1 (app/), code:bash (pnpm dev          # http://localhost:3000), code:bash (# Run once to compile the native addon) (+33 more)

### Community 10 - "Community 10"
Cohesion: 0.05
Nodes (38): 10. Hors scope MVP, 11. Questions reportées (non bloquantes), 12. Journal des décisions, 13. Commandes, 14. Avancement détaillé — fait / reste à faire, 1. Vision produit, 2. Stack existante (état repo `mestryx` — 2026-05-21), 3.1 Rôles & wallet (A) (+30 more)

### Community 11 - "Community 11"
Cohesion: 0.05
Nodes (36): 10. Summary counts, 11. Implementation tracker, 1.1 Available skills (motion-related), 1.2 In-repo motion baseline (already shipped), 1.3 Recommended library strategy, 1. Agent skills & tooling, 2. Research-backed timing tokens, 3.1 Already animated ✅ (+28 more)

### Community 12 - "Community 12"
Cohesion: 0.06
Nodes (35): 1.1 shadcn/ui primitives (`components/ui/`), 1.2 Custom UI (not shadcn — replace or wrap), 1.3 Domain components (compose locally — not in registry), 1. Already in the project, 2. shadcn components to import (prioritized), 3. Mapping by screen (mobile-first), 4. External blocks (reference only — not `@shadcn` registry), 5. Install phases (recommended order) (+27 more)

### Community 13 - "Community 13"
Cohesion: 0.06
Nodes (33): 1. Find & book a mentor (anyone), 2. Become a mentor (anyone), 3. Post-call (both sides), 4. Admin — group organiser, Admin gate (server-side), API Routes, Architecture, Booking flow (corrected order) (+25 more)

### Community 14 - "Community 14"
Cohesion: 0.12
Nodes (22): DonationSection(), PRESET_AMOUNTS, Props, TreasuryPayCelebration(), TreasuryPayCelebrationInner(), Props, CallsEmittedList(), CallsReceivedList() (+14 more)

### Community 15 - "Community 15"
Cohesion: 0.11
Nodes (21): BookingSuccessDialog(), Props, StickyPayBar(), CallsView(), useTrustRelation(), motionClass(), motionStaggerStyle(), staggerDelay() (+13 more)

### Community 16 - "Community 16"
Cohesion: 0.07
Nodes (29): 10. Commit strategy (suggested), 11. Summary, 1. Problem summary, 2. Goals, 3.1 Product decisions (confirmed 2026-05-24), 3.2 Technical decisions, 3.3 Card surfaces (terminology — answers “which card?”), 3. Design decisions (locked for this branch) (+21 more)

### Community 17 - "Community 17"
Cohesion: 0.11
Nodes (18): EnrichedBooking, EnrichedReceivedBooking, ReceivedBooking, DaoView(), Props, JoinSupporterButton(), PARTICLES, Props (+10 more)

### Community 18 - "Community 18"
Cohesion: 0.07
Nodes (28): 10. KPI catalog (on-chain primary), 11. Open decisions (`DIV-L4-03`), 12. References, 1. Goals, 2. Source-of-truth model, 3. Recommended stack, 4.1 Per-avatar activity — Circles Explorer (no custom indexer), 4.2 Watch addresses (links only — not a local index) (+20 more)

### Community 19 - "Community 19"
Cohesion: 0.18
Nodes (20): CirclesData, ExpertCard(), ExpertDetailCardContent(), Props, Props, RegisterProfilePreview(), getDisplayCallLanguages(), Avatar() (+12 more)

### Community 20 - "Community 20"
Cohesion: 0.09
Nodes (19): BookingWithExpertName, dataDir, db, dbPath, ExpertRowRaw, GetAllExpertsFilters, InsertBookingData, InsertExpertData (+11 more)

### Community 21 - "Community 21"
Cohesion: 0.15
Nodes (17): buildExplorerEventsUrl(), buildExplorerGraphUrl(), buildExplorerTxUrl(), ExplorerAvatarLinks, explorerLinksForAddress(), getAnalyticsStartBlock(), normalizeAddress(), fetchAvatarBalanceCrc() (+9 more)

### Community 22 - "Community 22"
Cohesion: 0.13
Nodes (20): useTreasuryPendingTxOptional(), CoinBurst, Options, useCoinBurstQueue(), useLiveTreasuryBalance(), CrcCoinLayer(), externalCoinSpawn(), FlyingCoin() (+12 more)

### Community 23 - "Community 23"
Cohesion: 0.08
Nodes (24): Décisions tranchées, Détail DIV-L0-01, Détail DIV-L0-02, Détail DIV-L0-03, Détail DIV-L1-01, Détail DIV-L1-02, Détail DIV-L1-03, Détail DIV-L1-04 (+16 more)

### Community 24 - "Community 24"
Cohesion: 0.08
Nodes (23): App routes (target), Circles dashboards, Circles / Gnosis ecosystem (SDK & docs), CirclesTools (community ops), code:bash (NEXT_PUBLIC_GITHUB_ISSUES_URL=https://github.com/gnosis-box/), code:bash (pnpm dev      # http://localhost:3000), code:bash (pnpm tsx scripts/seed.ts), Deployments & environments (+15 more)

### Community 25 - "Community 25"
Cohesion: 0.16
Nodes (21): POST(), GET(), PATCH(), clampExpertShare(), getExpertById(), mapExpertRow(), CallLanguageCode, ExpertLanguageFields (+13 more)

### Community 26 - "Community 26"
Cohesion: 0.21
Nodes (20): applyColumnMigrations(), applySchema(), dropLegacyMentorTables(), fkReferencesMentors(), FkRow, fkTargetForColumn(), foreignKeyList(), getMigrationHealth() (+12 more)

### Community 27 - "Community 27"
Cohesion: 0.09
Nodes (22): code:bash (pnpm install), code:ts (import { onWalletChange } from '@aboutcircles/miniapp-sdk';), code:tsx (import { useWallet } from '@/hooks/use-wallet';), code:json ({), code:ts ('use client';), code:ts ('use client';), code:ts ('use client';), code:block8 (app/) (+14 more)

### Community 28 - "Community 28"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 29 - "Community 29"
Cohesion: 0.16
Nodes (18): LiveTreasuryStatus, Options, DEFAULT_GROUP_ADDRESS, isDemoTreasuryTx(), GROUP, isTreasuryInboundSummary(), nominalCrcFromAmountWei(), normalizeAddress() (+10 more)

### Community 30 - "Community 30"
Cohesion: 0.16
Nodes (16): ALLOWED_KEYS, DEFAULT_UMAMI_SHARE_URL, getUmamiApiOrigin(), getUmamiShareId(), getUmamiShareUrl(), sanitizePayload(), THP_UMAMI_FUNNEL_EVENTS, trackUmamiEvent() (+8 more)

### Community 31 - "Community 31"
Cohesion: 0.15
Nodes (13): AdminPanel(), PlatformHealthSection(), PromoteSection(), useRowFlash(), GroupMemberDto, AdminHealthStats, AdminRow, TagRow (+5 more)

### Community 32 - "Community 32"
Cohesion: 0.16
Nodes (14): MemberEntry, PromoteFormState, Props, CalConnect(), CalEventType, Props, ExpertEditForm(), Props (+6 more)

### Community 33 - "Community 33"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 34 - "Community 34"
Cohesion: 0.15
Nodes (11): parseSessionPriceInput(), RegisterForm(), ValidationIssue, Props, StopExpertButton(), CirclesProfileState, useCirclesProfile(), CollapsibleSection (+3 more)

### Community 35 - "Community 35"
Cohesion: 0.16
Nodes (15): SpawnRect, TreasuryPendingSource, TreasuryPendingTx, TreasuryPendingTxContext, TreasuryPendingTxContextValue, Options, Window, demoButtonSpawnRect() (+7 more)

### Community 36 - "Community 36"
Cohesion: 0.16
Nodes (13): Props, TrustState, UntrustModal(), TrustRelationState, addTrust(), buildContractRunner(), removeTrust(), queryTrustEdge() (+5 more)

### Community 37 - "Community 37"
Cohesion: 0.22
Nodes (12): POST(), GET(), DELETE(), isAdminRequest(), walletFromRequest(), approveSkillTag(), getAdminHealthStats(), getAllTags() (+4 more)

### Community 38 - "Community 38"
Cohesion: 0.18
Nodes (14): BookingStepper(), Props, stepIndex(), STEPS, getStepStatus(), MotionStepConnector(), MotionStepDisc(), MotionStepIndicator() (+6 more)

### Community 39 - "Community 39"
Cohesion: 0.12
Nodes (16): Admins, Agenda Link, Agenda Link, Description, Description, Mentors, Name, Name (+8 more)

### Community 40 - "Community 40"
Cohesion: 0.12
Nodes (16): After merging, Before you open a PR, Branching and workflow, Code of conduct, code:bash (# 1. Clone and install), code:block2 (feature/<short-slug>   →   dev   →   staging   →   master (p), code:markdown (## Summary), Coding conventions (+8 more)

### Community 42 - "Community 42"
Cohesion: 0.20
Nodes (9): PayDrawer(), Props, Drawer(), DrawerContent(), DrawerDescription(), DrawerFooter(), DrawerHeader(), DrawerOverlay() (+1 more)

### Community 43 - "Community 43"
Cohesion: 0.21
Nodes (11): ExpertSearch(), Props, InputGroup(), InputGroupAddon(), inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants, InputGroupInput() (+3 more)

### Community 44 - "Community 44"
Cohesion: 0.19
Nodes (10): Props, LanguagePicker(), Props, sizeClasses, SESSION_LANGUAGES, filterOptions(), isSelectedCaseInsensitive(), MultiSelectSearch() (+2 more)

### Community 45 - "Community 45"
Cohesion: 0.14
Nodes (13): Architecture cible, Audit du code (`dev`) — écarts résolus (sprint MVP 2026-05-22), Backlog d’implémentation, Clôture epic L1, Clôture epic L2, Clôture epic L3, L4 — Post-MVP (backlog), Layers & epics (ordre de priorité) (+5 more)

### Community 46 - "Community 46"
Cohesion: 0.28
Nodes (10): GET(), bookingResponse(), GET(), POST(), authHeaders(), createCalBooking(), getAvailableSlots(), getBookingByTxHash() (+2 more)

### Community 47 - "Community 47"
Cohesion: 0.33
Nodes (10): addExpertSkillDraft(), mergeSkillTag(), Props, sizeClasses, SkillTagPicker(), findTagByLabelCaseInsensitive(), isSkillSelectedCaseInsensitive(), normalizeSkillLabel() (+2 more)

### Community 48 - "Community 48"
Cohesion: 0.20
Nodes (10): GET(), appendSessionLanguageOrClause(), getAllExperts(), getExpertByCirclesAddress(), insertExpert(), syncExpertLanguages(), ADMINS, EXPERTS (+2 more)

### Community 49 - "Community 49"
Cohesion: 0.17
Nodes (11): code:bash (docker ps --filter label=coolify.projectName=thp-for-good \), code:bash (CN=<container_name>), code:bash (docker exec "$CN" node node_modules/tsx/dist/cli.mjs scripts), code:bash (docker exec "$CN" node node_modules/tsx/dist/cli.mjs scripts), code:bash (pnpm simulate-legacy-db), code:bash (curl -s -w '\nHTTP:%{http_code}\n' https://staging.thp.gnosi), code:bash (docker cp /root/thp-db-snapshots/pre_repair_${TS}.db "$CN:/a), Deploy (Coolify) (+3 more)

### Community 50 - "Community 50"
Cohesion: 0.17
Nodes (10): Claude Code workflow tips, code:bash (# Surface-level exports), code:bash (curl -s -X POST https://rpc.aboutcircles.com/ -H "Content-Ty), code:bash (cat > /tmp/probe.mjs <<'EOF'), Look up SDK shapes from `node_modules`, not memory, Probe the live RPC before writing UI, Test SDK calls in Node before plumbing into React, Useful subagents (+2 more)

### Community 51 - "Community 51"
Cohesion: 0.25
Nodes (9): Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants, icons, Props, StatusVariant (+1 more)

### Community 52 - "Community 52"
Cohesion: 0.18
Nodes (11): C’est quoi `DIV-L0-01` ?, Champs projet, code:mermaid (flowchart LR), Colonnes Status (workflow), Deux types d’issues (ne pas confondre), Dépendances (bloquants), Phase courante : L3 (UX & Demo), Placement sur le board (+3 more)

### Community 53 - "Community 53"
Cohesion: 0.31
Nodes (5): TreasuryPendingTxProvider(), useTreasuryCoinDevFire(), TreasuryCoinDevController(), TreasuryCoinDevPanel(), TreasuryProviders()

### Community 54 - "Community 54"
Cohesion: 0.25
Nodes (7): Approach, code:bash (node scripts/probe-trust-eligible-balance.mjs 0xYourAvatar 0), Implementation (POC), Manual validation, Out of scope (this spike), SPIKE-L4-02 — Trust-eligible CRC at booking (simulation), UX copy

### Community 55 - "Community 55"
Cohesion: 0.46
Nodes (6): GET(), POST(), GET(), addDbAdmin(), getDbAdmins(), isAdminAddress()

### Community 56 - "Community 56"
Cohesion: 0.29
Nodes (6): Chroma budget (Solarpunk Pro), Continuous improvement, Decisions, Implementation map, Related, THP Solarpunk theme — normative decisions (THP-for-Good)

### Community 57 - "Community 57"
Cohesion: 0.33
Nodes (5): cal.diy evaluation, Current state (post-merge `dev`), Follow-up IMPL (optional), Recommendation, SPIKE-L4-01 — cal.diy / calendar integration

### Community 58 - "Community 58"
Cohesion: 0.33
Nodes (5): Approach, Fallback, Implementation, Playground validation (manual), SPIKE-L2-01 — Split PAY feasibility

### Community 60 - "Community 60"
Cohesion: 0.47
Nodes (4): buildContentSecurityPolicy(), umamiOriginFromEnv(), FRAME_ANCESTORS, nextConfig

### Community 61 - "Community 61"
Cohesion: 0.40
Nodes (4): attoToCrc(), maxFlow(), price, share

### Community 62 - "Community 62"
Cohesion: 0.40
Nodes (5): L0 — Foundation, L1 — Product MVP *(DIV terminées — epic [#3](https://github.com/gnosis-box/THP-for-Good/issues/3))*, L2 — Integration *(DIV terminées — epic [#4](https://github.com/gnosis-box/THP-for-Good/issues/4))*, L3 — UX & Demo, Registre des décisions → issues

## Knowledge Gaps
- **613 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+608 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 4` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 5`, `Community 7`, `Community 14`, `Community 15`, `Community 17`, `Community 19`, `Community 22`, `Community 31`, `Community 32`, `Community 34`, `Community 36`, `Community 38`, `Community 41`, `Community 42`, `Community 43`, `Community 44`, `Community 47`, `Community 51`, `Community 53`, `Community 59`?**
  _High betweenness centrality (0.175) - this node is a cross-community bridge._
- **Why does `clsx` connect `Community 5` to `Community 4`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `useWallet()` (e.g. with `DaoSection()` and `JoinSupporterButton()`) actually correct?**
  _`useWallet()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _613 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05070422535211268 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.052884615384615384 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.0670762928827445 - nodes in this community are weakly interconnected._