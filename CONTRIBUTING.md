# Contributing to THP for Good

Thank you for your interest in THP for Good — a Circles miniapp that connects learners with expert mentors through on-chain payments and trust.

> **Become a DAO member.** Meaningful contributors may be invited to join the THP for Good DAO on Gnosis Chain. As a member you get one vote on who receives the next free training session. See [our /dao page](https://thp.gnosis.box/dao) and [PR #95](https://github.com/gnosis-box/THP-for-Good/pull/95) for context on governance.

---

## Table of contents

1. [Code of conduct](#code-of-conduct)
2. [Language policy](#language-policy)
3. [How to report a bug](#how-to-report-a-bug)
4. [How to suggest a feature](#how-to-suggest-a-feature)
5. [Development setup](#development-setup)
6. [Branching and workflow](#branching-and-workflow)
7. [Submitting a pull request](#submitting-a-pull-request)
8. [Coding conventions](#coding-conventions)

---

## Code of conduct

This project follows the [Contributor Covenant v2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). By participating you agree to uphold it. Report violations to [jeremie.olivier.es@gmail.com](mailto:jeremie.olivier.es@gmail.com).

---

## Language policy

| Context | Language |
|---------|----------|
| Code, comments, commit messages | **English** |
| GitHub issue titles and bodies | **English** |
| PR descriptions | **English** |
| User-facing UI strings | **English** |
| Spec files (`spec/`) | Bilingual / French is fine where already established |

---

## How to report a bug

1. **Search existing issues** first — someone may have already reported it.
2. Open a new issue and use the **`IMPL-*`** naming convention (e.g. `IMPL-L2-07 — fix slot picker on mobile`).
3. Add the label `bug` and the `implementation` label.
4. Include:
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser / OS / wallet context (inside Circles playground or standalone?)
   - Relevant console errors or network logs

---

## How to suggest a feature

Features that do not fit the current MVP scope are tracked as **`FEAT-L4-*`** issues.

1. Search [`spec/PRD-MVP.md`](spec/PRD-MVP.md) to check whether a decision (`DIV-*`) already covers your idea.
2. If not, open an issue:
   - **Decision needed (no code):** prefix `DIV-Lx-yy — …`, label `decision`
   - **Implementation (code change):** prefix `IMPL-Lx-yy — …`, label `implementation`
   - **Post-MVP backlog:** prefix `FEAT-L4-xx — …`
3. Never mix a decision and code in the same issue or PR.

See [AGENTS.md § Two issue types](AGENTS.md) for the full workflow.

---

## Development setup

**Prerequisites:** Node 20+, pnpm 9+, macOS or Linux.

```bash
# 1. Clone and install
git clone https://github.com/gnosis-box/THP-for-Good.git
cd THP-for-Good
pnpm install

# 2. Environment
cp .env.example .env.local
# Fill in ADMIN_ADDRESSES and any other required vars

# 3. Start dev server
pnpm dev          # http://localhost:3000

# 4. Verify
pnpm lint         # ESLint (not `next lint` — see AGENTS.md gotchas)
pnpm build        # Production build — must pass before any PR
```

**macOS note:** if `pnpm install` fails on `better-sqlite3`, run `npm rebuild better-sqlite3` once. See [AGENTS.md § Local dev on macOS](AGENTS.md).

**Testing inside Circles:** paste `http://localhost:3000` into [circles.gnosis.io/playground](https://circles.gnosis.io/playground) after deploying to any HTTPS URL. The wallet is injected by the host — there is no connect button.

---

## Branching and workflow

```
feature/<short-slug>   →   dev   →   staging   →   master (production)
```

| Branch | Purpose | Preview URL |
|--------|---------|-------------|
| `dev` | Integration branch; all feature PRs target here | `dev.thp.gnosis.box` |
| `staging` | Pre-production QA | `staging.thp.gnosis.box` |
| `master` | Production | `thp.gnosis.box` |

- Branch off **`dev`** for all new work: `git checkout -b feature/my-feature origin/dev`
- Keep commits atomic and descriptive (`feat(booking): add slot picker`, `fix(db): path resolution`)
- Rebase on `origin/dev` before opening a PR: `git rebase origin/dev`
- Every merged PR to `dev` triggers an automatic **preview deployment** — the URL is posted as a PR comment

---

## Submitting a pull request

### Before you open a PR

- [ ] `pnpm lint` — zero errors
- [ ] `pnpm build` — succeeds and all expected routes appear in the prerender list
- [ ] The PR is linked to an `IMPL-*` issue on the [project board](https://github.com/orgs/gnosis-box/projects/1/views/1)
- [ ] The issue card has been moved to **Running** on the board
- [ ] You have read the relevant [locked decisions](AGENTS.md#locked-decisions-do-not-contradict-in-code-or-docs) and your change does not contradict them

### PR description template

```markdown
## Summary
- <bullet: what changed>
- <bullet: why>

## Issue
Closes IMPL-Lx-yy

## Test plan
- [ ] Manual step 1
- [ ] Manual step 2
- [ ] pnpm lint ✅  /  pnpm build ✅
```

### After merging

Move the issue card to **Done** on the [project board](https://github.com/orgs/gnosis-box/projects/1/views/1).

---

## Coding conventions

Follow [AGENTS.md](AGENTS.md) for the full set of rules. Key points:

- **No connect button** — wallet is injected by the Circles host via `onWalletChange`.
- **Never top-level import Circles SDKs** from server components — always dynamically import inside a `useEffect`.
- **Use `sdk.rpc.profile.getProfileView()`** for read flows, not `sdk.getAvatar()`.
- **Do not hand-edit `components/ui/*`** — regenerate via `pnpm dlx shadcn@latest add <name> --overwrite`.
- **Dark-only theme** — no light-mode toggle in MVP.
- **English only** in all code and GitHub artifacts.
