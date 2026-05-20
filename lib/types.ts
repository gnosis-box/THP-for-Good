export type MentorSlot = {
  id: string;
  label: string;
  available: boolean;
};

export type Mentor = {
  id: string;
  name: string;
  walletAddress: `0x${string}`;
  bio: string;
  tags: string[];
  notifyEmail?: string;
  notifyWebhook?: string;
  slots: MentorSlot[];
};

export type MentorsData = {
  mentors: Mentor[];
};

export type BookingStatus = 'booked' | 'completed';

export type Booking = {
  id: string;
  mentorId: string;
  slotId: string;
  studentAddress: `0x${string}`;
  amountCrc: string;
  txHash: `0x${string}`;
  paidAt: string;
  status: BookingStatus;
};

export type BookingsStore = {
  bookings: Booking[];
};

export type TagAttestation = {
  mentorId: string;
  tag: string;
  studentAddress: `0x${string}`;
  trustTxHash?: `0x${string}`;
  at: string;
};

export type TagTrustStore = {
  attestations: TagAttestation[];
};

export type MentorCirclesOverlay = {
  imageUrl?: string;
  trustsCount?: number;
  trustedByCount?: number;
  v2Balance?: string;
};
