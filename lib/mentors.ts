export type TimeSlot = {
  id: string;
  label: string;
  shortLabel: string;
};

export type Mentor = {
  slug: string;
  name: string;
  tags: string[];
  bio: string;
  slots: TimeSlot[];
  circlesAddress: `0x${string}` | null;
  imageUrl?: string;
  trustedByCount?: number;
  trustsCount?: number;
  profileLoaded?: boolean;
};

export type BookedCall = {
  id: string;
  mentorSlug: string;
  mentorName: string;
  tags: string[];
  slotId: string;
  slotLabel: string;
  txHash: string;
  bookedAt: string;
  imageUrl?: string;
};

export const BOOKING_AMOUNT_CRC = 100;
export const BOOKING_AMOUNT_ATTO = BigInt(100) * BigInt(10 ** 18);

const DEFAULT_MENTOR_ENV = "NEXT_PUBLIC_MENTOR_DEFAULT_ADDRESS";

const DAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"] as const;

function mentorAddress(envKey: string): `0x${string}` | null {
  const value = process.env[envKey] ?? process.env[DEFAULT_MENTOR_ENV];
  if (!value || !/^0x[a-fA-F0-9]{40}$/.test(value)) return null;
  return value as `0x${string}`;
}

/** Créneaux sur les 5 prochains jours ouvrés (dates réelles). */
export function buildUpcomingSlots(slug: string, count = 9): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  for (let dayOffset = 0; slots.length < count && dayOffset < 21; dayOffset++) {
    const day = new Date(cursor);
    day.setDate(cursor.getDate() + dayOffset);
    const dow = day.getDay();
    if (dow === 0 || dow === 6) continue;

    for (const hour of [10, 14]) {
      if (slots.length >= count) break;
      const dateKey = day.toISOString().slice(0, 10);
      const dayLabel = DAY_LABELS[dow];
      slots.push({
        id: `${slug}-${dateKey}-${hour}`,
        label: `${dayLabel} ${hour}:00`,
        shortLabel: `${dayLabel}\n${hour}h`,
      });
    }
  }

  while (slots.length < count) {
    const i = slots.length;
    slots.push({
      id: `${slug}-fallback-${i}`,
      label: `Créneau ${i + 1}`,
      shortLabel: `${i + 1}`,
    });
  }

  return slots.slice(0, count);
}

const MENTOR_SEEDS: Omit<Mentor, "slots" | "profileLoaded">[] = [
  {
    slug: "zet",
    name: "Zet",
    tags: ["AI", "Dev"],
    bio: "CTO @THP, contributor web3 on Intuition",
    circlesAddress: mentorAddress("NEXT_PUBLIC_MENTOR_ZET_ADDRESS"),
  },
  {
    slug: "flo",
    name: "Flo",
    tags: ["Legal", "RoR"],
    bio: "Legal & regulatory mentor",
    circlesAddress: mentorAddress("NEXT_PUBLIC_MENTOR_FLO_ADDRESS"),
  },
  {
    slug: "dimitry",
    name: "Dimitry",
    tags: ["Pate", "Image"],
    bio: "Product & visual design mentor",
    circlesAddress: mentorAddress("NEXT_PUBLIC_MENTOR_DIMITRY_ADDRESS"),
  },
  {
    slug: "vincent",
    name: "Vincent",
    tags: ["photo", "Dev"],
    bio: "Photography & development mentor",
    circlesAddress: mentorAddress("NEXT_PUBLIC_MENTOR_VINCENT_ADDRESS"),
  },
];

export function buildBaseMentors(): Mentor[] {
  return MENTOR_SEEDS.map((seed) => ({
    ...seed,
    slots: buildUpcomingSlots(seed.slug),
    profileLoaded: false,
  }));
}

export const MENTORS: Mentor[] = buildBaseMentors();

export function getMentorBySlug(
  slug: string,
  mentors: Mentor[] = MENTORS,
): Mentor | undefined {
  return mentors.find((m) => m.slug === slug);
}

export function isMentorConfigured(mentor: Mentor): boolean {
  return mentor.circlesAddress !== null;
}

const DOMAIN_KEYWORDS: Record<string, string[]> = {
  ai: ["ai"],
  developpement: ["dev"],
  development: ["dev"],
  legal: ["legal"],
  dev: ["dev"],
  photo: ["photo"],
  image: ["image"],
};

export function filterMentorsByDomain(
  mentors: Mentor[],
  query: string,
): Mentor[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return mentors;

  const tokens = trimmed
    .split(/[;,]/)
    .map((t) => t.trim())
    .filter(Boolean);

  if (tokens.length === 0) return mentors;

  return mentors.filter((mentor) =>
    tokens.some((token) => {
      const keywords = DOMAIN_KEYWORDS[token] ?? [token];
      const haystack = [mentor.name, mentor.bio, ...mentor.tags]
        .join(" ")
        .toLowerCase();
      return keywords.some(
        (kw) => haystack.includes(kw) || kw.includes(haystack),
      );
    }),
  );
}
