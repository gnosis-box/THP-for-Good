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
  balanceCrc: number | null;
  eventsUrl: string;
  graphUrl: string;
};

export type StatsDuneAggregate = {
  crcToTreasury: number | null;
  crcToExperts: number | null;
  paidTxCount: number | null;
  cachedAt: string | null;
  source: 'dune';
};

export type StatsApiResponse = {
  treasury: StatsTreasuryPayload;
  group: StatsGroupPayload;
  experts: StatsExpertPayload[];
  enrichment: StatsEnrichment;
  reconcile: StatsReconcile;
  dune: StatsDuneAggregate | null;
  meta: {
    startBlock: number | null;
    generatedAt: string;
    expertBalancesTruncated: boolean;
  };
};
