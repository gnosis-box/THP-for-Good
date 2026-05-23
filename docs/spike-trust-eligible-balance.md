# SPIKE-L4-02 — Trust-eligible CRC at booking (simulation)

**Issue:** [#53](https://github.com/gnosis-box/THP-for-Good/issues/53)  
**Verdict:** **GO** (pathfinder simulation, display-only)

## Approach

Circles `sdk.rpc.pathfinder.findMaxFlow({ from, to, useWrappedBalances: false })` returns the maximum **unwrapped** CRC movable along trust paths between two avatars.

For a split PAY session (expert % + foundation %):

1. `maxToExpert` = findMaxFlow(booker → expert)
2. `maxToFoundation` = findMaxFlow(booker → foundation treasury sink via `resolveFoundationSink`)
3. **Bookable (simulation)** = bottleneck: min of `(maxToExpert / expertLeg) * price`, `(maxToFoundation / foundationLeg) * price`

## Implementation (POC)

- [`lib/trust-eligible-balance.ts`](../lib/trust-eligible-balance.ts)
- [`hooks/use-trust-eligible-balance.ts`](../hooks/use-trust-eligible-balance.ts)
- UI: [`components/mentors/PayButton.tsx`](../components/mentors/PayButton.tsx) — lines under total balance
- CLI probe: `node scripts/probe-trust-eligible-balance.mjs <from> <expert> [priceCrc] [mentorSharePercent]`

## UX copy

- Total balance: existing `useCrcBalance` (`v2Balance`)
- *~X CRC reachable toward [Expert] (simulation)*
- *~Y CRC reachable toward foundation (simulation)*
- *~Z CRC estimated bookable at this price (simulation)*

Disclaimer: estimate only; PAY still uses `TransferBuilder` advanced path. Mismatch possible if wrapped CRC or host simulation differs.

## Out of scope (this spike)

- Blocking PAY when `bookableCrc < priceCrc` (keep DIV-L1-09 toast on tx failure)
- Wrapped-balance path (`useWrappedBalances: true`) — follow-up if advanced transfers require it
- Expert “acceptance” policy beyond trust graph topology

## Manual validation

```bash
node scripts/probe-trust-eligible-balance.mjs 0xYourAvatar 0xExpertAddress 100 20
```

Compare output with PayButton simulation lines in Circles playground.
