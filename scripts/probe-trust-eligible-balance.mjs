/**
 * SPIKE #53 — probe trust-path max flow toward expert + foundation.
 * Run: node scripts/probe-trust-eligible-balance.mjs <from> <expert> [priceCrc] [mentorSharePercent]
 */
import { Sdk } from '@aboutcircles/sdk';

const ATTO = 10n ** 18n;
const PAY_FOUNDATION = '0xc02D5aaCA64dE428D571dA42538232C431E0CDeD';

function attoToCrc(atto) {
  return Number(atto / ATTO);
}

async function maxFlow(from, to) {
  const sdk = new Sdk();
  const atto = await sdk.rpc.pathfinder.findMaxFlow({
    from: from.toLowerCase(),
    to: to.toLowerCase(),
    useWrappedBalances: false,
  });
  return attoToCrc(atto);
}

function bookable(price, share, toExpert, toFoundation) {
  const expertLeg = (price * share) / 100;
  const foundationLeg = price - expertLeg;
  const caps = [];
  if (expertLeg > 0) caps.push((toExpert / expertLeg) * price);
  if (foundationLeg > 0) caps.push((toFoundation / foundationLeg) * price);
  return caps.length ? Math.floor(Math.min(...caps)) : 0;
}

const from = process.argv[2];
const expert = process.argv[3];
const price = Number(process.argv[4] ?? '100');
const share = Number(process.argv[5] ?? '20');

if (!from?.startsWith('0x') || !expert?.startsWith('0x')) {
  console.error(
    'Usage: node scripts/probe-trust-eligible-balance.mjs <from> <expert> [priceCrc] [mentorSharePercent]',
  );
  process.exit(1);
}

const [toExpert, toFoundation] = await Promise.all([
  maxFlow(from, expert),
  maxFlow(from, PAY_FOUNDATION),
]);

console.log(
  JSON.stringify(
    {
      from,
      expert,
      foundation: PAY_FOUNDATION,
      priceCrc: price,
      mentorSharePercent: share,
      toExpertCrc: toExpert,
      toFoundationCrc: toFoundation,
      bookableCrc: bookable(price, share, toExpert, toFoundation),
    },
    null,
    2,
  ),
);
