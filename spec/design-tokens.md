# THP for Good — Design tokens (Solarpunk Pro, dark-only)

| | |
|---|---|
| **Status** | Locked with [solarpunk-theme-decisions.md](./solarpunk-theme-decisions.md) |
| **Effective** | 2026-05-24 (Solarpunk Pro chroma budget + muted brand pass) |
| **Implementation** | `app/theme/solarpunk.primitives.css` + `solarpunk.tokens.css` + `app/globals.css` |

## Three-tier mapping

| Tier | File | Examples |
|------|------|----------|
| Primitive | `solarpunk.primitives.css` | `--neutral-400`, `--green-500` |
| Semantic | `solarpunk.tokens.css` | `--foreground`, `--primary`, `--accent` |
| Component | `globals.css` | `--pill-price-bg`, `--pill-skill-bg`, `--link-trust` |

## Canonical semantic hex (`solarpunk.tokens.css`)

| Token | Hex | Role |
|-------|-----|------|
| `--background` | `#0a1210` | Page surface |
| `--foreground` | `#e8efe9` | Primary text (neutral warm, not mint) |
| `--background-elevated` | `#141f1c` | Cards, popovers |
| `--text-muted` | `#8fa89e` | Doc alias for caption tone |
| `--subtle-foreground` | `#6b7f78` | Tertiary meta (trusted-by, idle) |
| `--primary` | `#5a9f76` / `oklch(0.64 0.11 155)` | Pay, TRUST, stepper, slot selected, nav underline |
| `--secondary` | `#4d948c` / `oklch(0.58 0.08 185)` | Secondary surfaces |
| `--accent` | `#c49a62` / `oklch(0.72 0.10 78)` | THP split, CRC price pills, donation |
| `--success` | `#8ba86a` / `oklch(0.68 0.10 130)` | Confirmed / done states only |
| `--warning` | `#c4a860` / `oklch(0.74 0.10 85)` | Simulation shortfall |
| `--destructive` | `#f87171` | Errors only |

## shadcn derived tokens (`globals.css`)

| Token | Value | Role |
|-------|-------|------|
| `--card`, `--popover` | `#141f1c` | Elevated surfaces |
| `--muted` | `#1a2521` | Subtle fills |
| `--muted-foreground` | `#8fa89e` | Captions, bios (neutral sage) |
| `--primary-foreground` | `#052e16` | Labels on green buttons |
| `--accent-foreground` | `#451a03` | Labels on amber surfaces |
| `--trust` | `#6aad9f` / `oklch(0.68 0.08 185)` | Tx links, trust badges |
| `--border` | foreground @ 10% | Dividers |
| `--ring` | primary @ 45% | Focus rings (less glow) |

## Component tokens

| Token | Value | Role |
|-------|-------|------|
| `--pill-price-bg` | accent @ 10% | CRC price pill background |
| `--pill-price-text` | `--accent` | CRC price pill text |
| `--pill-skill-bg` | `--muted` | Skill/language pill background |
| `--pill-skill-text` | `--foreground` | Skill/language pill text |
| `--pill-skill-border` | `--border` | Skill/language pill border |
| `--link-trust` | `--trust` | Explorer / on-chain links |

## Contrast pairs (WCAG AA)

| Pair | Ratio (approx) | Use | Status |
|------|----------------|-----|--------|
| `#e8efe9` / `#0a1210` | 17.8:1 | Body copy | Pass |
| `#8fa89e` / `#141f1c` | 5.5:1 | Captions, bios | Pass |
| `#052e16` / `#5a9f76` | ~5.8:1 | CTA labels | Pass |
| `#451a03` / `#c49a62` | ~6.2:1 | Solidarity badges | Pass |

Verify with [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) before release.
