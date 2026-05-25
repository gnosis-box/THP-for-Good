import type { TagRow } from '@/lib/db';

export function normalizeSkillLabel(label: string): string {
  return label.trim();
}

export function findTagByLabelCaseInsensitive(
  tags: TagRow[],
  label: string,
): TagRow | undefined {
  const query = normalizeSkillLabel(label).toLowerCase();
  if (!query) return undefined;
  return tags.find((tag) => tag.label.toLowerCase() === query);
}

export function isSkillSelectedCaseInsensitive(selected: string[], label: string): boolean {
  const query = normalizeSkillLabel(label).toLowerCase();
  if (!query) return false;
  return selected.some((skill) => skill.toLowerCase() === query);
}

export function resolveSkillLabel(tags: TagRow[], label: string): string | null {
  const trimmed = normalizeSkillLabel(label);
  if (!trimmed) return null;
  return findTagByLabelCaseInsensitive(tags, trimmed)?.label ?? trimmed;
}
