# SPIKE-L4-01 — cal.diy / calendar integration

**Verdict: DEFER custom cal.diy self-host for hackathon; KEEP current Cal.com slots API path on `Dev`.**

## Current state (post-merge `Dev`)

- [`SlotPicker`](../components/mentors/SlotPicker.tsx) loads slots via `/api/mentors/[id]/availability` (Cal.com)
- PAY requires slot + email; booking creates Cal.com reservation via [`lib/calcom.ts`](../lib/calcom.ts)
- DIV-L1-05 original spec (static grid + manual `calendar_link`) superseded by team integration — reconcile via **DIV-L1-05 bis** if product wants revert

## cal.diy evaluation

| Criterion | Assessment |
|-----------|------------|
| Self-host on Coolify | Feasible (Node 18+, PostgreSQL) but **heavy** for hackathon timeline |
| Per-expert booking page | Supported via Cal.com today; cal.diy would duplicate effort |
| Post-PAY flow | Already covered by Cal.com booking after CRC tx |
| vs SPIKE goal | cal.diy remains valid **L4** alternative if Cal.com limits hit |

## Recommendation

1. **MVP:** keep Cal.com + availability API (no cal.diy deploy this sprint).
2. **PRD:** add DIV-L1-05 bis noting Cal.com path as accepted MVP calendar.
3. **L4:** revisit cal.diy if Infisical/Coolify capacity allows dedicated instance.

## Follow-up IMPL (optional)

- `IMPL-L1-05` persist `slot_label` in DB for `/calls` history display
- Schema cleanup: drop unused `google_calendar_id` if fully migrated to Cal.com
