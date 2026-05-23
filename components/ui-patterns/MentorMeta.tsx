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
          className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs leading-snug text-muted-foreground"
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
