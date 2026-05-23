# THP for Good — Design tokens (dark-only)

| | |
|---|---|
| **Status** | Locked with [UI-REDESIGN.md §12](./UI-REDESIGN.md) |
| **Palette** | Gnosis 2026 — violet CTA, orange solidarity, cyan trust |
| **Implementation** | `app/globals.css` (`.dark` + mirrored `:root`) |

## Semantic mapping

| Token | Hex reference | Role |
|-------|---------------|------|
| `--background` | `#0B0B12` Obsidian | Page surface |
| `--card` | `#14141F` Carbon | Cards, panels |
| `--popover` | `#1A1A28` | Drawer, sheet |
| `--foreground` | `#FBEBD4` Cream | Primary text |
| `--muted-foreground` | ~`#9CA3AF` | Secondary text |
| `--primary` | `#6B2BFF` Electric purple | Pay, TRUST, active links |
| `--accent` | `#FF8C60` Orange | THP for Good split highlights |
| `--trust` | `#4FE3FF` Neon cyan | Trust estimate, tx links |
| `--warning` | `#FF8C60` | Simulation shortfall |
| `--success` | `#8CE8AB` | Booking confirmed |
| `--border` | white @ 8% | Dividers |
| `--ring` | purple @ 60% | Focus rings |

## Contrast pairs (target WCAG AA)

| Pair | Use |
|------|-----|
| `--foreground` on `--background` | Body copy |
| `--muted-foreground` on `--card` | Captions, bios |
| `--primary-foreground` on `--primary` | CTA labels |
| `--accent-foreground` on `--accent` | Solidarity badges |

Verify with [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) before release.
