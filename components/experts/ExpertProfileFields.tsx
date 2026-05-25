'use client';

import { SkillTagPicker } from '@/components/experts/SkillTagPicker';
import { LanguagePicker } from '@/components/experts/LanguagePicker';
import type { TagRow } from '@/lib/db';

type Props = {
  tags: TagRow[];
  setTags: React.Dispatch<React.SetStateAction<TagRow[]>>;
  tagsLoading?: boolean;
  selectedSkills: string[];
  onSelectedSkillsChange: (skills: string[]) => void;
  spokenLanguages: string[];
  callLanguages: string[];
  onSpokenLanguagesChange: (codes: string[]) => void;
  onCallLanguagesChange: (codes: string[]) => void;
  size?: 'sm' | 'md';
  skillsRequired?: boolean;
  skillsHelperText?: string;
  newTagStatus?: TagRow['status'];
};

/** Shared skills + session languages block for register, edit, and promote flows. */
export function ExpertProfileFields({
  tags,
  setTags,
  tagsLoading = false,
  selectedSkills,
  onSelectedSkillsChange,
  spokenLanguages,
  callLanguages,
  onSpokenLanguagesChange,
  onCallLanguagesChange,
  size = 'md',
  skillsRequired = false,
  skillsHelperText,
  newTagStatus = 'approved',
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <SkillTagPicker
        tags={tags}
        setTags={setTags}
        selected={selectedSkills}
        onSelectedChange={onSelectedSkillsChange}
        loading={tagsLoading}
        required={skillsRequired}
        helperText={skillsHelperText}
        size={size}
        newTagStatus={newTagStatus}
      />
      <LanguagePicker
        spoken={spokenLanguages}
        call={callLanguages}
        onSpokenChange={onSpokenLanguagesChange}
        onCallChange={onCallLanguagesChange}
        size={size}
      />
    </div>
  );
}
