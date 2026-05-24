'use client';

import { SkillTagPicker } from '@/components/experts/SkillTagPicker';
import { LanguagePicker } from '@/components/experts/LanguagePicker';
import type { TagRow } from '@/lib/db';

type Props = {
  tags: TagRow[];
  tagsLoading?: boolean;
  selectedSkills: string[];
  onSelectedSkillsChange: (skills: string[]) => void;
  spokenLanguages: string[];
  callLanguages: string[];
  onSpokenLanguagesChange: (codes: string[]) => void;
  onCallLanguagesChange: (codes: string[]) => void;
  newSkill: string;
  onNewSkillChange: (value: string) => void;
  onAddNewSkill: () => void;
  size?: 'sm' | 'md';
  skillsRequired?: boolean;
  skillsHelperText?: string;
};

/** Shared skills + session languages block for register, edit, and promote flows. */
export function ExpertProfileFields({
  tags,
  tagsLoading = false,
  selectedSkills,
  onSelectedSkillsChange,
  spokenLanguages,
  callLanguages,
  onSpokenLanguagesChange,
  onCallLanguagesChange,
  newSkill,
  onNewSkillChange,
  onAddNewSkill,
  size = 'md',
  skillsRequired = false,
  skillsHelperText,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <SkillTagPicker
        tags={tags}
        selected={selectedSkills}
        onSelectedChange={onSelectedSkillsChange}
        loading={tagsLoading}
        required={skillsRequired}
        helperText={skillsHelperText}
        size={size}
        newSkill={newSkill}
        onNewSkillChange={onNewSkillChange}
        onAddNewSkill={onAddNewSkill}
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
