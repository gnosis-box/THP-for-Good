'use client';

import { useEffect, useRef, useState } from 'react';

import { LiveTreasuryCounter } from '@/components/motion/live-treasury-counter';
import {
  MetricsActions,
  MetricsExternalLink,
  MetricsHero,
  MetricsPanel,
  MetricsPanelMono,
  MetricsPanelTitle,
} from '@/components/ui-patterns/metrics-panel';
import { UI_COPY } from '@/lib/ui-copy';

function fmt(n: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n);
}

type Props = {
  address: string;
  initialBalance: number | null;
  eventsUrl: string;
  graphUrl: string;
};

export function LiveTreasuryMetricsPanel({
  address,
  initialBalance,
  eventsUrl,
  graphUrl,
}: Props) {
  const copy = UI_COPY.stats;
  const panelRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry?.isIntersecting ?? false),
      { rootMargin: '0px', threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <MetricsPanel ref={panelRef}>
      <MetricsPanelTitle>{copy.treasuryTitle}</MetricsPanelTitle>
      <MetricsPanelMono>{address}</MetricsPanelMono>
      <MetricsHero
        label={copy.treasuryBalance}
        value={
          initialBalance != null ? (
            <LiveTreasuryCounter
              mode="balance"
              enabled={visible}
              subscribeWs={visible}
              initialBalance={initialBalance}
              format={fmt}
            />
          ) : (
            copy.treasuryBalanceUnavailable
          )
        }
      />
      <MetricsActions>
        <MetricsExternalLink href={eventsUrl}>{copy.viewOnChainActivity}</MetricsExternalLink>
        <MetricsExternalLink href={graphUrl}>{copy.trustGraph}</MetricsExternalLink>
      </MetricsActions>
    </MetricsPanel>
  );
}
