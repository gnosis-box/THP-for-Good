import { getAppOrigin } from '@/lib/site-metadata';
import { UI_COPY } from '@/lib/ui-copy';

export const dynamic = 'force-static';

function absoluteUrl(origin: string, path: string): string {
  if (path === '/') return `${origin}/`;
  return `${origin}${path}`;
}

export async function GET() {
  const origin = getAppOrigin();
  const hero = UI_COPY.home.hero;

  const body = `# THP for Good

> ${hero.title}

${hero.subtitle}

## Primary actions

- Find an expert: browse profiles on the home page and book a 1:1 session
- Book in CRC: pay with Circles personal currency inside the Circles miniapp
- Offer expertise: register as a THP expert
- Donate: support the learner treasury on the About page

## Key pages

- Home (expert directory): ${absoluteUrl(origin, '/')}
- About & donate: ${absoluteUrl(origin, '/about')}
- Transparency dashboard: ${absoluteUrl(origin, '/stats')}
- Offer your expertise: ${absoluteUrl(origin, '/expert/register')}
- DAO governance: ${absoluteUrl(origin, '/dao')}
- My calls: ${absoluteUrl(origin, '/calls')}
- Expert profile pattern: ${absoluteUrl(origin, '/expert/{slug}')} (opaque public slug, not numeric id)

## Circles context

THP for Good runs on Gnosis Chain inside the Circles ecosystem. Sessions are paid in CRC and strengthen trust between participants. See ${absoluteUrl(origin, '/about')} for how Circles, the treasury, and learner funding work.

## Out of scope

This guide does not cover admin routes, API endpoints, wallet internals, or payment signing details.
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
