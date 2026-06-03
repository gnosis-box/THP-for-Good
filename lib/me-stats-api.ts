export type MeStatsResponse = {
  expertId: number;
  expertPublicSlug: string;
  expertName: string;
  address: string;
  balanceCrc: number | null;
  eventsUrl: string;
  graphUrl: string;
  paidBookingCount: number;
  bookingIntentCount: number;
  trustAttestationCount: number;
};
