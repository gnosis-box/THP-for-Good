import type { StatsEnrichment, StatsReconcile } from '@/lib/db';

export type StatsTreasuryPayload = {
  address: string;
  balanceCrc: number | null;
  eventsUrl: string;
  graphUrl: string;
};

export type StatsExpertPayload = {
  id: number;
  name: string;
  address: string;
  paidSessionCount: number;
  eventsUrl: string;
  graphUrl: string;
};

export type WebAnalyticsPayload = {
  available: boolean;
  periodDays: number;
  dashboardUrl: string;
  visitors?: number;
  visits?: number;
  pageviews?: number;
  bounceRate?: number | null;
  avgVisitSeconds?: number | null;
};

export type StatsApiResponse = {
  treasury: StatsTreasuryPayload;
  experts: StatsExpertPayload[];
  enrichment: StatsEnrichment;
  reconcile: StatsReconcile;
  webAnalytics: WebAnalyticsPayload;
  meta: {
    startBlock: number | null;
    generatedAt: string;
  };
};
