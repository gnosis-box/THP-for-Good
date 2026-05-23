/** User-facing UI copy outside payment/trust (English UI). */

export const UI_COPY = {
  home: {
    title: 'Find an Expert',
    subtitle: 'Book a 1:1 session. Pay in CRC. Fund the next cohort.',
    filterLabel: 'Which domain do you want help with?',
    emptySearch: 'No mentors found for this search.',
    searchPlaceholder: 'Search by name, skill or bio…',
    filterAll: 'All',
  },
  circlesHint: {
    title: 'Open in Circles to pay with CRC',
    body: 'Connect your wallet and pay in CRC inside the Circles miniapp.',
    cta: 'Launch in Circles playground',
  },
  booking: {
    stepTime: 'Choose time',
    stepDetails: 'Your details',
    stepPay: 'Review & pay',
    back: '← Back',
    editProfile: 'Edit my profile',
    availability: 'Availability',
    bookSession: 'Book session',
    reviewAndPay: 'Review & pay',
    selectSlotFirst: 'Select a slot above first.',
    noCalSelf:
      'No availability configured yet. Click "Edit my profile" to connect your Cal.com.',
    noCalVisitor: 'Availability not configured for this mentor yet.',
    about: 'About',
  },
  calls: {
    emitted: 'Emitted',
    received: 'Received',
    emptyEmitted: 'No bookings yet. Book a session with an expert.',
    emptyReceived: 'No incoming bookings yet.',
  },
  register: {
    title: 'Offer your expertise',
  },
} as const;

export function splitLine(expertPercent: number, treasuryPercent: number): string {
  return `${expertPercent}% to expert · ${treasuryPercent}% to THP for Good`;
}
