'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

type CalEventType = { id: number; slug: string; title: string };

type Props = {
  onConnect: (eventTypeId: number) => void;
};

export function CalConnect({ onConnect }: Props) {
  const [username, setUsername] = useState('');
  const [eventTypes, setEventTypes] = useState<CalEventType[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchEventTypes() {
    const u = username.trim().replace(/^@/, '');
    if (!u) return;
    setLoading(true);
    setError(null);
    setEventTypes(null);
    try {
      const res = await fetch(`/api/cal/event-types?username=${encodeURIComponent(u)}`);
      if (!res.ok) throw new Error('Could not fetch event types');
      const data = (await res.json()) as CalEventType[];
      if (data.length === 0) throw new Error(`No public event types found for @${u}`);
      setEventTypes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  if (eventTypes !== null) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs text-success font-medium">Found {eventTypes.length} event type{eventTypes.length !== 1 ? 's' : ''} — select one:</p>
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
      <div className="flex gap-2">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), fetchEventTypes())}
          placeholder="Your Cal.com username (e.g. zet-web3)"
          className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={loading || !username.trim()}
          onClick={fetchEventTypes}
        >
          {loading ? 'Loading…' : 'Load'}
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">
        Find your username at{' '}
        <span className="font-mono">cal.com/your-username</span>
      </p>
    </div>
  );
}
