# THP Solarpunk theme — normative decisions (THP-for-Good)

| | |
|---|---|
| **Status** | Published — supersedes [UI-REDESIGN.md §12](./UI-REDESIGN.md) palette (2026-05-24) |
| **Mode** | Dark only |
| **CSS source** | [`app/theme/solarpunk.tokens.css`](../app/theme/solarpunk.tokens.css) |
| **Token snapshot** | [`design-tokens.md`](./design-tokens.md) |
| **Aligned with** | Video-AI / THP `solarTheme` (brand hex); UI hierarchy tuned for miniapp |

---

## Decisions

| # | Topic | Decision |
|---|--------|----------|
| 1 | Identity | **Solarpunk** is the primary THP-for-Good theme (not an optional variant). |
| 2 | Mode | **Dark only** — no light Solarpunk theme. |
| 3 | Web `:root` | Solarpunk tokens on `:root` and `.dark`; optional `data-theme="solarpunk"` (same values). |
| 4 | Source of truth | Primitives in `app/theme/solarpunk.primitives.css`; canonical semantic hex in `solarpunk.tokens.css`; shadcn derived tokens in `app/globals.css`. |
| 5 | `--destructive` / error | **Alerts and errors only** — never decorative accent. |
| 6 | Accessibility | Verify **WCAG AA** contrast on every palette change; fix insufficient pairs first. |
| 7 | Typography | **Poppins** (headings), **Inter** (body), **JetBrains Mono** (code/mono). |
| 8 | Iconography | **Lucide** (`lucide-react`) — default UI icons. |
| 9 | Trust / graph UI | **`--trust`** = muted teal for tx links and trust badges (distinct from `--secondary`). |
| 10 | Split bar semantics | Expert leg = `--primary` (green); THP for Good leg = `--accent` (amber). |
| 11 | Motion keyframes | Use `var(--primary)` / `color-mix` — no hardcoded legacy violet oklch. |
| 12 | Nav active | Desktop underline slide uses **`--primary`** (green). |
| 13 | Muted text | **`--muted-foreground` must be neutral** (sage gray) — never mint/green chroma. |

---

## Chroma budget (Solarpunk Pro)

~85% of UI surface and copy is **neutral**. Brand chroma is reserved for meaning:

| Role | Token | Use | Do not use for |
|------|-------|-----|----------------|
| **Neutral body** | `--foreground` `#e8efe9` | Headings, body, card titles | — |
| **Neutral meta** | `--muted-foreground` `#8fa89e` | Bios, captions, hints, table secondary | Prices, CTAs |
| **Neutral tertiary** | `--subtle-foreground` `#6b7f78` | Trusted-by counts, wallet idle, placeholders | Body copy |
| **Action** | `--primary` `#5a9f76` (oklch ~0.64/0.11) | Pay, TRUST, stepper active, slot selected, filter selected, nav underline | Links, captions, skill pills |
| **Solidarity / CRC** | `--accent` `#c49a62` (oklch ~0.72/0.10) | Split THP leg, price pills, donation bar, quote border | Success states |
| **Trust / Web3** | `--trust` `#6aad9f` | Trust path (optional), tx explorer links, trust badges | Generic links |
| **Success** | `--success` `#8ba86a` | Booking confirmed, TRUST done, active badges | Decorative text |

**Chroma tuning:** brand greens/ambers use **lower OKLCH chroma** (~0.09–0.12) than raw Tailwind 500 (~0.17–0.19), mixed toward neutral sage — solarpunk “moss/ochre” not neon. Surfaces use `color-mix` tints (pills @ 10%, ring @ 45%).

**Pill rules:** price = amber surface; skills/languages = neutral muted pill; filters idle = border + gray text; filters selected = primary fill.

**Link rules:** inline links = `foreground` + underline on hover; on-chain / explorer = `trust`; never `text-primary` except inside primary buttons.

---

## Implementation map

| Zone | File |
|------|------|
| Primitives | `app/theme/solarpunk.primitives.css` |
| Canonical hex | `app/theme/solarpunk.tokens.css` |
| shadcn + Tailwind `@theme` | `app/globals.css` |
| Fonts | `app/layout.tsx` |
| Pill roles | `components/ui-patterns/highlight-pill.ts` |

---

## Continuous improvement

| Date | Source | Observation | Follow-up |
|------|--------|-------------|-----------|
| 2026-05-24 | Theme refactor | Supersedes DIV-L4-UI violet/orange; full Solarpunk + Poppins/Inter/JetBrains. | Manual iframe QA + Lighthouse on `/` and `/expert/[id]`. |
| 2026-05-24 | Solarpunk Pro | Green overload fix: neutral foreground/muted; pill roles; chroma budget. | WCAG pairs below verified. |
| 2026-05-24 | Muted chroma pass | Desaturate primary/accent toward solarpunk moss/ochre (OKLCH); refs: [solarpunk aesthetic](https://aesthetic.fyi/solarpunk/), [OKLCH mixing](https://www.mintlify.com/LuminescentDev/ui/concepts/color-system), [dark mode contrast](https://dev.to/lawebe/how-to-fix-common-wcag-color-contrast-failures-2jln). | Re-verify WCAG on CTA pairs after token change. |
| 2026-05-24 | WCAG audit | `#e8efe9`/`#0a1210` ~17.8:1; `#8fa89e`/`#141f1c` ~5.5:1; `#052e16`/`#5a9f76` ~5.8:1; `#451a03`/`#c49a62` ~6.2:1 | Re-check if new surfaces added. |

---

## Related

- [design-tokens.md](./design-tokens.md) — semantic mapping table
- [UI-REDESIGN.md §12](./UI-REDESIGN.md) — superseded (historical DIV-L4-UI)
- [motion-design-audit.md](./motion-design-audit.md) — motion tokens use theme CSS variables
