import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { DonationSection } from '@/components/about/DonationSection';
import { cn } from '@/lib/utils';

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl flex flex-col gap-14 py-10">

      {/* Hero */}
      <section className="flex flex-col gap-5">
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          What is THP for Good?
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          THP for Good is a solidarity-based initiative by{' '}
          <a href="https://www.thehackingproject.org" target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-2 decoration-accent/60 hover:decoration-accent">
            The Hacking Project
          </a>{' '}
          that connects people building public good projects with experienced mentors — and funds
          their training through the{' '}
          <a href="https://aboutcircles.com" target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-2 decoration-accent/60 hover:decoration-accent">
            Circles
          </a>{' '}
          trust network.
        </p>
        <p className="text-base text-muted-foreground leading-relaxed">
          The program empowers the community to choose who receives support, fostering inclusivity,
          collaboration, and purpose-driven learning.
        </p>
      </section>

      {/* How it works */}
      <section className="flex flex-col gap-8">
        <h2 className="font-display text-2xl font-bold tracking-tight">How it works</h2>
        <ol className="flex flex-col gap-8">
          {[
            {
              label: 'Browse experts',
              body: 'Explore mentors from The Hacking Project community — each with their skills, price per session, and their Circles trust score.',
            },
            {
              label: 'Pick a slot & pay in CRC',
              body: 'Choose an availability slot from the expert\'s Cal.com calendar, then pay in CRC — the community currency of the Circles network. No credit card, no intermediary.',
            },
            {
              label: 'Solidarity by design',
              body: 'Every session payment is automatically split: at least 50% goes to the THP for Good foundation to fund future learners, the rest to the expert.',
              highlight: 'At least 50% of every session goes to THP for Good.',
            },
            {
              label: 'Trust the expert',
              body: 'After a session, the booking flow adds a Circles trust edge to your expert — growing the web of trust that powers the network.',
            },
          ].map((step, i) => (
            <li key={i} className="flex gap-5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-sm font-bold text-accent ring-1 ring-accent/25">
                {i + 1}
              </span>
              <div className="flex flex-col gap-2 pt-1">
                <p className="font-display font-semibold leading-tight">{step.label}</p>
                {step.highlight && (
                  <p className="text-sm font-medium text-accent">{step.highlight}</p>
                )}
                <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* DAO treasury + donation */}
      <DonationSection />

      {/* Circles */}
      <section className="rounded-2xl border border-border/60 bg-card px-6 py-6 flex flex-col gap-4">
        <h2 className="font-display text-lg font-bold">Powered by Circles</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Circles is a decentralised money system on Gnosis Chain where trust between people creates
          currency. CRC tokens are personal — each person mints their own — and flow through the
          network only between people who trust each other. This makes payments here a statement of
          trust, not just a transaction.
        </p>
        <a
          href="https://aboutcircles.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary underline underline-offset-2 w-fit hover:text-primary/80"
        >
          Learn more about Circles →
        </a>
      </section>

      {/* CTA */}
      <section className="flex flex-col gap-3 sm:flex-row">
        <Link href="/" className={cn(buttonVariants(), 'inline-flex min-h-11 items-center justify-center font-display font-semibold')}>
          Find an expert
        </Link>
        <Link
          href="/mentor/register"
          className={cn(buttonVariants({ variant: 'outline' }), 'inline-flex min-h-11 items-center justify-center font-display font-semibold')}
        >
          Offer your expertise
        </Link>
      </section>

    </div>
  );
}
