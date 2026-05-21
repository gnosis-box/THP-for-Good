import "server-only";

import { unstable_cache } from "next/cache";

import { buildBaseMentors, type Mentor } from "@/lib/mentors";

type CirclesProfile = {
  name?: string;
  description?: string;
  imageUrl?: string;
  previewImageUrl?: string;
};

export async function enrichMentorFromCircles(mentor: Mentor): Promise<Mentor> {
  if (!mentor.circlesAddress) return { ...mentor, profileLoaded: true };

  try {
    const { Sdk } = await import("@aboutcircles/sdk");
    const sdk = new Sdk();
    const view = await sdk.rpc.profile.getProfileView(mentor.circlesAddress);

    if (!view.avatarInfo) {
      return { ...mentor, profileLoaded: true };
    }

    let ipfs: CirclesProfile = {};
    if (view.avatarInfo.cidV0) {
      try {
        const full = await sdk.rpc.profile.getProfileByCid(view.avatarInfo.cidV0);
        if (full) ipfs = full as CirclesProfile;
      } catch {
        // IPFS optional
      }
    }

    const name =
      ipfs.name?.trim() || view.profile?.name?.trim() || mentor.name;
    const bio = ipfs.description?.trim() || mentor.bio;
    const imageUrl = ipfs.previewImageUrl || ipfs.imageUrl;

    return {
      ...mentor,
      name,
      bio,
      imageUrl,
      trustedByCount: view.trustStats?.trustedByCount,
      trustsCount: view.trustStats?.trustsCount,
      profileLoaded: true,
    };
  } catch {
    return { ...mentor, profileLoaded: true };
  }
}

async function enrichAllMentors(mentors: Mentor[]): Promise<Mentor[]> {
  return Promise.all(mentors.map(enrichMentorFromCircles));
}

async function loadMentorsUncached(): Promise<Mentor[]> {
  try {
    return await enrichAllMentors(buildBaseMentors());
  } catch {
    return buildBaseMentors().map((m) => ({ ...m, profileLoaded: true }));
  }
}

export const getCachedMentors = unstable_cache(
  loadMentorsUncached,
  ["mentors-profiles-v1"],
  { revalidate: 300 },
);
