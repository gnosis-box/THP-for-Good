import mentorsData from '@/data/mentors.json';

import type { Mentor, MentorsData } from '@/lib/types';

const data = mentorsData as MentorsData;

export function getAllMentors(): Mentor[] {
  return data.mentors;
}

export function getMentorById(id: string): Mentor | undefined {
  return data.mentors.find((mentor) => mentor.id === id);
}

export function filterMentors(query: string, mentors: Mentor[] = data.mentors): Mentor[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return mentors;

  return mentors.filter((mentor) => {
    const haystack = [mentor.name, mentor.bio, ...mentor.tags].join(' ').toLowerCase();
    return haystack.includes(normalized);
  });
}
