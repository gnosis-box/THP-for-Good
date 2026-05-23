import type { StatsEnrichment, StatsReconcile } from '@/lib/db';

export type StatsTreasuryPayload = {
  address: string;
  balanceCrc: number | null;
  eventsUrl: string;
  graphUrl: string;
};

export type StatsGroupPayload = {
  address: string;
  balanceCrc: number | null;
  eventsUrl: string;
  graphUrl: string;
};

export type StatsExpertPayload = {
  id: number;
  name: string;
  address: string;
  eventsUrl: string;
  graphUrl: string;
};

export type StatsApiResponse = {
  treasury: StatsTreasuryPayload;
  group: StatsGroupPayload;
  experts: StatsExpertPayload[];
  enrichment: StatsEnrichment;
  reconcile: StatsReconcile;
  meta: {
    startBlock: number | null;
    generatedAt: string;
  };
};
