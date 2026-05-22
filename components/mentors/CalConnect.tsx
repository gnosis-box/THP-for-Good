'use client';

import { useEffect, useMemo, useState } from 'react';
import { OnboardingEmbed } from '@calcom/atoms';
import type { OnboardingEmbedProps } from '@calcom/atoms';

type CalEventType = { id: number; slug: string; title: string };

type Props = {
  onConnect: (eventTypeId: number) => void;
};

async function generatePkce() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const codeVerifier = btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier));
  const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return { codeVerifier, codeChallenge };
}

type AuthProps = OnboardingEmbedProps['authorization'];
const SCOPES: AuthProps['scope'] = ['EVENT_TYPE_READ', 'BOOKING_WRITE'];

export function CalConnect({ onConnect }: Props) {
  const oAuthClientId = process.env.NEXT_PUBLIC_CAL_OAUTH_CLIENT_ID ?? '';
  const state = useMemo(() => crypto.randomUUID(), []);
  const [pkce, setPkce] = useState<{ codeVerifier: string; codeChallenge: string } | null>(null);
  const [eventTypes, setEventTypes] = useState<CalEventType[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generatePkce().then(setPkce);
  }, []);

  async function handleAuth({ code }: { code: string }) {
    if (!pkce) return;
    setLoading(true);
    setError(null);
    try {
      const redirectUri = `${window.location.origin}/cal/callback`;

      const tokenRes = await fetch('https://api.cal.com/v2/auth/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: oAuthClientId,
          code_verifier: pkce.codeVerifier,
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
        }),
      });
      if (!tokenRes.ok) throw new Error('Token exchange failed');
      const tokenData = (await tokenRes.json()) as { access_token?: string; accessToken?: string };
      const accessToken = tokenData.access_token ?? tokenData.accessToken;
      if (!accessToken) throw new Error('No access token in response');

      const etRes = await fetch('https://api.cal.com/v2/event-types', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'cal-api-version': '2024-08-13',
        },
      });
      if (!etRes.ok) throw new Error('Could not fetch event types');

      type EtResponse = {
        data?: CalEventType[] | { eventTypeGroups?: Array<{ eventTypes: CalEventType[] }> };
      };
      const etData = (await etRes.json()) as EtResponse;
      let types: CalEventType[] = [];
      if (Array.isArray(etData.data)) {
        types = etData.data;
      } else if (etData.data && 'eventTypeGroups' in etData.data) {
        types = (etData.data.eventTypeGroups ?? []).flatMap((g) => g.eventTypes);
      }
      setEventTypes(types);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setLoading(false);
    }
  }

  if (!oAuthClientId) {
    return (
      <p className="text-xs text-muted-foreground">
        Cal.com integration not configured (<code>NEXT_PUBLIC_CAL_OAUTH_CLIENT_ID</code> missing).
      </p>
    );
  }

  if (!pkce) return null;

  if (eventTypes !== null) {
    if (eventTypes.length === 0) {
      return <p className="text-sm text-muted-foreground">No event types found on your Cal.com account.</p>;
    }
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs text-green-700 font-medium">Cal.com connected — select a booking event type:</p>
        <select
          defaultValue=""
          onChange={(e) => onConnect(parseInt(e.target.value, 10))}
          className="h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="" disabled>Select an event type…</option>
          {eventTypes.map((et) => (
            <option key={et.id} value={et.id}>
              {et.title} ({et.slug})
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <OnboardingEmbed
        oAuthClientId={oAuthClientId}
        authorization={{
          scope: SCOPES,
          redirectUri: `${typeof window !== 'undefined' ? window.location.origin : ''}/cal/callback`,
          state,
          codeChallenge: pkce.codeChallenge,
        }}
        onAuthorizationAllowed={handleAuth}
        onError={(err) => setError(err.message)}
      />
      {loading && <p className="text-sm text-muted-foreground">Connecting…</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
