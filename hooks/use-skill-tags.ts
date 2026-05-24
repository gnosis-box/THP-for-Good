'use client';

import { useCallback, useEffect, useState } from 'react';

import { mergeSkillTag } from '@/components/experts/SkillTagPicker';
import type { TagRow } from '@/lib/db';

type Options = {
  /** Admin requests include pending tags when wallet header is sent. */
  walletAddress?: string;
  enabled?: boolean;
};

export function useSkillTags({ walletAddress, enabled = true }: Options = {}) {
  const [tags, setTags] = useState<TagRow[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const headers: HeadersInit = {};
      if (walletAddress) {
        headers['x-wallet-address'] = walletAddress;
      }
      const res = await fetch('/api/tags', { headers });
      if (!res.ok) throw new Error('Failed to load skills');
      const data = (await res.json()) as TagRow[];
      setTags(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load skills');
      setTags([]);
    } finally {
      setLoading(false);
    }
  }, [enabled, walletAddress]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const addLocalTag = useCallback((label: string, status: TagRow['status'] = 'approved') => {
    setTags((prev) => mergeSkillTag(prev, label, status));
  }, []);

  return { tags, setTags, loading, error, reload, addLocalTag };
}
