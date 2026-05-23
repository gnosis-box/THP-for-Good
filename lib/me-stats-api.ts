export type MeStatsResponse = {
  mentorId: number;
  mentorName: string;
  address: string;
  balanceCrc: number | null;
  eventsUrl: string;
  graphUrl: string;
  paidBookingCount: number;
  bookingIntentCount: number;
  trustAttestationCount: number;
};
