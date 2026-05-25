'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useWallet } from '@/components/wallet/WalletProvider';
import { cn } from '@/lib/utils';

const REPO = 'gnosis-box/THP-for-Good';

interface FieldDef {
  id: string;
  type: 'input' | 'textarea' | 'select';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  rows?: number;
}

interface FeedbackTypeDef {
  id: string;
  icon: string;
  label: string;
  description: string;
  titlePrefix: string;
  labels: string;
  fields: FieldDef[];
}

const FEEDBACK_TYPES: FeedbackTypeDef[] = [
  {
    id: 'idea',
    icon: '💡',
    label: 'New idea',
    description: "A feature or capability you'd love to see",
    titlePrefix: '[Idea]',
    labels: 'enhancement',
    fields: [
      { id: 'title', type: 'input', label: 'Give your idea a title', required: true },
      { id: 'problem', type: 'textarea', label: 'What problem does it solve?', required: true },
      { id: 'solution', type: 'textarea', label: 'How would you solve it? (optional)' },
    ],
  },
  {
    id: 'ux',
    icon: '🎨',
    label: 'UX improvement',
    description: 'Something that felt confusing or could be smoother',
    titlePrefix: '[UX]',
    labels: 'enhancement',
    fields: [
      {
        id: 'area',
        type: 'select',
        label: 'Which part of the app?',
        required: true,
        options: [
          'Home / Expert list',
          'Expert profile',
          'Booking flow',
          'My Calls',
          'Registration',
          'Stats',
          'Other',
        ],
      },
      { id: 'current', type: 'textarea', label: "What's the current friction?", required: true },
      { id: 'better', type: 'textarea', label: 'What would work better?', required: true },
    ],
  },
  {
    id: 'collab',
    icon: '🤝',
    label: 'Collaboration',
    description: 'Partnership, integration, or content opportunity',
    titlePrefix: '[Collab]',
    labels: 'question',
    fields: [
      { id: 'org', type: 'input', label: 'Your name / organisation (optional)' },
      {
        id: 'collab_type',
        type: 'select',
        label: 'Type of collaboration',
        required: true,
        options: ['Partnership', 'Integration / API', 'Content / writing', 'Speaking / event', 'Other'],
      },
      { id: 'details', type: 'textarea', label: 'Tell us more', required: true },
    ],
  },
  {
    id: 'bug',
    icon: '🐛',
    label: 'Bug report',
    description: 'Something broken or not working as expected',
    titlePrefix: '[Bug]',
    labels: 'bug',
    fields: [
      { id: 'page', type: 'input', label: 'Which page?', placeholder: '/mentor/3, /calls, …' },
      { id: 'steps', type: 'textarea', label: 'Steps to reproduce', required: true },
      {
        id: 'expected',
        type: 'textarea',
        label: 'What did you expect to happen?',
        required: true,
      },
    ],
  },
  {
    id: 'general',
    icon: '💬',
    label: 'General feedback',
    description: 'Thoughts, impressions, or anything on your mind',
    titlePrefix: '[Feedback]',
    labels: 'question',
    fields: [
      {
        id: 'thoughts',
        type: 'textarea',
        label: 'Your thoughts',
        required: true,
        rows: 5,
      },
    ],
  },
];

function buildGithubIssueUrl(
  type: FeedbackTypeDef,
  values: Record<string, string>,
  pathname: string,
  isMiniappHost: boolean,
): string {
  const lines: string[] = [
    `**Submitted via THP for Good** — Page: \`${pathname || '/'}\` · Miniapp host: ${isMiniappHost ? 'yes' : 'no'}`,
    '',
    '---',
    '',
  ];

  for (const field of type.fields) {
    const val = values[field.id]?.trim();
    if (val) {
      lines.push(`### ${field.label.replace(' (optional)', '')}`, val, '');
    }
  }

  const titleValue = values['title']?.trim() || values['area']?.trim();
  const title = titleValue
    ? `${type.titlePrefix}: ${titleValue}`
    : `${type.titlePrefix}: `;

  const url = new URL(`https://github.com/${REPO}/issues/new`);
  url.searchParams.set('title', title);
  url.searchParams.set('body', lines.join('\n'));
  url.searchParams.set('labels', type.labels);

  return url.toString();
}

interface FeedbackSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackSheet({ open, onOpenChange }: FeedbackSheetProps) {
  const pathname = usePathname();
  const { isMiniappHost } = useWallet();
  const [selectedType, setSelectedType] = useState<FeedbackTypeDef | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  function reset() {
    setSelectedType(null);
    setValues({});
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  function handleTypeSelect(type: FeedbackTypeDef) {
    setSelectedType(type);
    setValues({});
  }

  function handleReviewOnGithub() {
    if (!selectedType) return;
    const url = buildGithubIssueUrl(selectedType, values, pathname, isMiniappHost);
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  const isValid =
    selectedType?.fields
      .filter((f) => f.required)
      .every((f) => values[f.id]?.trim()) ?? false;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[90dvh] overflow-y-auto rounded-t-2xl pb-[env(safe-area-inset-bottom)]"
      >
        <SheetHeader className="border-b border-border pb-4 pr-10">
          {selectedType ? (
            <>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Back to type selection"
                >
                  <ArrowLeft className="size-4" aria-hidden />
                </button>
                <SheetTitle>
                  {selectedType.icon} {selectedType.label}
                </SheetTitle>
              </div>
              <SheetDescription>{selectedType.description}</SheetDescription>
            </>
          ) : (
            <>
              <SheetTitle>Give feedback</SheetTitle>
              <SheetDescription>What would you like to share?</SheetDescription>
            </>
          )}
        </SheetHeader>

        {!selectedType ? (
          <div className="flex flex-col gap-2 p-4">
            {FEEDBACK_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => handleTypeSelect(type)}
                className="flex items-start gap-3 rounded-lg border border-border px-4 py-3 text-left transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="mt-0.5 shrink-0 text-xl leading-none" aria-hidden>
                  {type.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{type.label}</p>
                  <p className="text-xs text-muted-foreground">{type.description}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4 p-4">
            {selectedType.fields.map((field) => (
              <div key={field.id} className="flex flex-col gap-1.5">
                <label htmlFor={`feedback-${field.id}`} className="text-sm font-medium text-foreground">
                  {field.label}
                  {field.required && (
                    <span className="ml-1 text-destructive" aria-hidden>
                      *
                    </span>
                  )}
                </label>

                {field.type === 'input' && (
                  <Input
                    id={`feedback-${field.id}`}
                    placeholder={field.placeholder}
                    value={values[field.id] ?? ''}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [field.id]: e.target.value }))
                    }
                  />
                )}

                {field.type === 'textarea' && (
                  <Textarea
                    id={`feedback-${field.id}`}
                    placeholder={field.placeholder}
                    rows={field.rows ?? 3}
                    value={values[field.id] ?? ''}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [field.id]: e.target.value }))
                    }
                  />
                )}

                {field.type === 'select' && (
                  <select
                    id={`feedback-${field.id}`}
                    value={values[field.id] ?? ''}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [field.id]: e.target.value }))
                    }
                    className={cn(
                      'h-9 w-full rounded-lg border border-border bg-transparent px-2.5 py-1',
                      'text-sm text-foreground outline-none transition-colors',
                      'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
                      'dark:bg-input/30',
                      !values[field.id] && 'text-muted-foreground',
                    )}
                  >
                    <option value="" disabled>
                      Choose…
                    </option>
                    {field.options?.map((opt) => (
                      <option key={opt} value={opt} className="text-foreground bg-popover">
                        {opt}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}

            <div className="mt-2 flex flex-col gap-2">
              <Button
                type="button"
                onClick={handleReviewOnGithub}
                disabled={!isValid}
                className="w-full"
              >
                Review on GitHub
                <ExternalLink className="ml-1.5 size-3.5" aria-hidden />
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Opens a pre-filled GitHub issue — you can review before submitting.
              </p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
