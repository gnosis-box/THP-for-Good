/** User-facing UI copy outside payment/trust (English UI). */

export const UI_COPY = {
  home: {
    title: 'Find a mentor',
    subtitle: 'Book a 1:1 session. Pay in CRC. Fund the next cohort.',
    filterLabel: 'Which domain do you want help with?',
    emptySearch: 'No mentors found for this search.',
    searchPlaceholder: 'Search by name, skill or bio…',
    filterAll: 'All',
    languageFilterLabel: 'Session language',
    languageFilterAll: 'Any language',
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
    successTrustReminder: (expertName: string) =>
      `After your call, trust ${expertName} on My Calls to strengthen the Circles network.`,
    viewMyCalls: 'View my calls',
    openCalBooking: 'Open Cal.com booking',
    openExpertCalendar: 'Open expert calendar',
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
  support: {
    reportIssue: 'Report issue',
    reportIssueAria: 'Report an issue or send feedback on GitHub',
  },
  trustCard: {
    loading: 'Trust…',
    trust: 'Trust',
    trustBack: 'Trust back',
    trusting: 'Trusting…',
    trustsYou: 'Trusts you',
    youTrust: 'You trust',
    mutual: 'Mutual trust',
    trustFailed: 'Trust failed. Please try again.',
  },
  register: {
    title: 'Offer your expertise',
    editTitle: 'Edit your expert profile',
    editSubtitle: 'Update your skills, availability, and session details.',
    inactiveNotice:
      'Your profile is hidden from the expert directory. Save your changes to publish it again.',
    viewPublicProfile: 'View public profile',
    saveChanges: 'Save changes',
    publishProfile: 'Publish profile',
    saving: 'Saving…',
    registering: 'Registering…',
    registerCta: 'Register as expert',
    stopExpertHint:
      'You will no longer appear in the expert directory. Existing bookings are kept.',
    stopExpertCta: 'Stop offering sessions',
    stopExpertLoading: 'Updating…',
    stopExpertConfirm:
      'Remove your expert profile from the directory? You can register again later.',
  },
  stats: {
    title: 'Stats',
    subtitle: 'On-chain treasury and Circles activity, plus off-chain session metrics.',
    howToReadTitle: 'How to read this dashboard',
    howToReadBullets: [
      'CRC transfers and volume — use the Circles Explorer links below; the authoritative source is on-chain, not summed in this app.',
      'Treasury balance — live read from the Circles network (refreshed every few minutes).',
      'Session counts and skills — from THP app records only; they are labelled separately and are not on-chain totals.',
      'Booker wallet addresses are never shown here — only public explorer links and aggregates.',
    ] as const,
    treasuryTitle: 'THP for Good treasury',
    treasuryBalance: 'CRC balance (on-chain)',
    treasuryBalanceUnavailable: 'Balance unavailable',
    viewOnChainActivity: 'View on-chain activity',
    trustGraph: 'Trust graph',
    groupTitle: 'THP Circles group',
    groupBalance: 'CRC balance (on-chain)',
    analyticsFromBlock: (block: number) =>
      `Circles Explorer links below filter activity from block ${block.toLocaleString()}.`,
    expertBalancesTruncated: 'CRC balances shown for the first active experts only.',
    expertsTitle: 'Active experts',
    expertsEmpty: 'No active experts listed yet.',
    snapshotTitle: 'Activity snapshot',
    snapshotOffChainNote: 'Counts below are from app records — not on-chain totals.',
    activeExperts: 'Active experts',
    paidBookings: 'Paid sessions (tx recorded)',
    bookingIntent: 'Booking intents (no tx yet)',
    trustAttestations: 'Trust actions logged',
    topSkills: 'Top skills',
    recentPaidTitle: 'Recent paid sessions',
    recentPaidEmpty: 'No paid sessions with on-chain tx yet.',
    viewTx: 'View tx',
    reconcileTitle: (count: number) =>
      `${count} booking${count === 1 ? '' : 's'} awaiting on-chain confirmation (over 24h)`,
    loading: 'Loading stats…',
    loadError: 'Could not load stats. Try again later.',
    umamiTitle: 'Web analytics',
    umamiNote: 'Page views and funnel — not financial data.',
    openUmamiDashboard: 'Open Umami dashboard',
  },
} as const;

export function splitLine(expertPercent: number, treasuryPercent: number): string {
  return `${expertPercent}% to expert · ${treasuryPercent}% to THP for Good`;
}
