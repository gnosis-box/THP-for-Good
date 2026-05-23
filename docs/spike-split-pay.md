# SPIKE-L2-01 — Split PAY feasibility

**Verdict: GO** (SDK batch path)

## Approach

Use two `constructAdvancedTransfer` legs (expert + foundation) concatenated into a single `sendTransactions([...])` call.

- Foundation: `0x2b5E4045936ef12250a8c01e4Cbf71E9bEE69e00`
- Mentor share: 10 / 20 / 30 / 50 % (`mentors.mentor_share_percent`, default 20)
- Remainder to foundation (admin floor ≥ 50 % satisfied when mentor ≤ 50 %)

## Implementation

- [`lib/crc-pay.ts`](../lib/crc-pay.ts) — `buildSplitPayTransactions()`
- [`components/mentors/PayButton.tsx`](../components/mentors/PayButton.tsx)

## Playground validation (manual)

- [ ] Connect wallet in Circles playground
- [ ] Book session — confirm **one** wallet prompt for batched txs
- [ ] Verify GnosisScan: two transfers from booker (expert + foundation)

## Fallback

If playground rejects batch: document failure on issue #30 and implement viem manual encoding (DIV-L2-01 option B).
