'use client';

import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { FadeContent } from '@/components/motion/fade-content';
import { PageHeader } from '@/components/layout/PageHeader';
import { MetricsPanel } from '@/components/ui-patterns/metrics-panel';

export function AboutHero() {
  return (
    <MetricsPanel muted>
      <FadeContent>
        <PageHeader title="What is THP for Good?" />
        <div className="mx-auto flex max-w-lg flex-col gap-4 text-center">
          <p className="text-muted-foreground leading-relaxed">
            THP for Good is a solidarity-based initiative by{' '}
            <a
              href="https://www.thehackingproject.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-2"
            >
              The Hacking Project
            </a>{' '}
            that connects people building public good projects with experienced web3 experts — and
            funds their training through the{' '}
            <a
              href="https://aboutcircles.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-2"
            >
              Circles
            </a>{' '}
            trust network.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The program empowers the community to choose who receives support, fostering
            inclusivity, collaboration, and purpose-driven learning.
          </p>
        </div>
      </FadeContent>
    </MetricsPanel>
  );
}

const STEPS = [
  {
    title: 'Browse experts',
    body: (
      <>
        Explore experts from The Hacking Project community — each with their skills, price per
        session, and their Circles trust score.
      </>
    ),
  },
  {
    title: 'Pick a slot & pay in CRC',
    body: (
      <>
        Choose an availability slot from the expert&apos;s Cal.com calendar, then pay in{' '}
        <strong>CRC</strong> — the community currency of the Circles network. No credit card, no
        intermediary.
      </>
    ),
  },
  {
    title: 'Payment split — solidarity by design',
    body: (
      <>
        <blockquote className="motion-quote-border border-l-2 border-accent pl-3 text-sm text-foreground">
          At least 50% of every session goes to THP for Good to fund future learners.
        </blockquote>
        <p className="text-sm text-muted-foreground">
          Every session payment is automatically split: at least{' '}
          <strong>50% goes to the THP for Good foundation</strong> to fund future learners, the rest
          to the expert. The exact split is set by each expert.
        </p>
      </>
    ),
    gap: 'gap-2' as const,
  },
  {
    title: 'Trust the expert',
    body: (
      <>
        After a session, the booking flow adds a Circles trust edge to your expert — growing the web
        of trust that powers the network.
      </>
    ),
  },
];

export function AboutHowItWorks() {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold">How it works</h2>
      <ol className="flex flex-col gap-6">
        {STEPS.map((step, index) => (
          <ScrollReveal key={step.title} as="li" delay={index * 0.05} className="flex gap-4">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              {index + 1}
            </span>
            <div className={`flex flex-col ${step.gap ?? 'gap-1'}`}>
              <p className="font-medium">{step.title}</p>
              <div className="text-sm text-muted-foreground">{step.body}</div>
            </div>
          </ScrollReveal>
        ))}
      </ol>
    </section>
  );
}
