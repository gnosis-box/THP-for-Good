import { cn } from '@/lib/utils';

type SkillTagsProps = {
  skills: string[];
  className?: string;
};

export function MentorSkillTags({ skills, className }: SkillTagsProps) {
  if (skills.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)} aria-label="Expertise">
      {skills.map((skill) => (
        <span
          key={skill}
          className="inline-flex rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium leading-snug text-accent/90 ring-1 ring-accent/20"
        >
          {skill}
        </span>
      ))}
    </div>
  );
}

type SplitShareProps = {
  expertPercent: number;
  className?: string;
};

export function MentorSplitShare({ expertPercent, className }: SplitShareProps) {
  const treasuryPercent = 100 - expertPercent;

  return (
    <div className={cn('flex flex-wrap gap-x-1.5 gap-y-0.5 text-xs leading-snug text-accent', className)}>
      <span className="whitespace-nowrap">{expertPercent}% to expert</span>
      <span className="whitespace-nowrap">{treasuryPercent}% to THP for Good</span>
    </div>
  );
}
