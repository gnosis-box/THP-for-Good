import { NextResponse } from "next/server";

import { getCachedMentors } from "@/lib/mentor-profiles.server";

export const revalidate = 300;

export async function GET() {
  try {
    const mentors = await getCachedMentors();
    return NextResponse.json(mentors);
  } catch {
    const { buildBaseMentors } = await import("@/lib/mentors");
    return NextResponse.json(
      buildBaseMentors().map((m) => ({ ...m, profileLoaded: true })),
    );
  }
}
