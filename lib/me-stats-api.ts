export type MeStatsResponse = {
  expertId: number;
  expertName: string;
  address: string;
  balanceCrc: number | null;
  eventsUrl: string;
  graphUrl: string;
  paidBookingCount: number;
  bookingIntentCount: number;
  trustAttestationCount: number;
};
