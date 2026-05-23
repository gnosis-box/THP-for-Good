import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { DonationSection } from '@/components/about/DonationSection';
import { cn } from '@/lib/utils';

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 flex flex-col gap-12">

      {/* Hero */}
      <section className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold tracking-tight">What is THP for Good?</h1>
        <p className="text-muted-foreground leading-relaxed">
          THP for Good is a solidarity-based initiative by{' '}
          <a href="https://www.thehackingproject.org" target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-2">
            The Hacking Project
          </a>{' '}
          that connects people building public good projects with experienced web3 mentors — and funds
          their training through the{' '}
          <a href="https://aboutcircles.com" target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-2">
            Circles
          </a>{' '}
          trust network.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          The program empowers the community to choose who receives support, fostering inclusivity,
          collaboration, and purpose-driven learning.
        </p>
      </section>

      {/* How it works */}
      <section className="flex flex-col gap-6">
        <h2 className="text-lg font-semibold">How it works</h2>
        <ol className="flex flex-col gap-6">
          <li className="flex gap-4">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">1</span>
            <div className="flex flex-col gap-1">
              <p className="font-medium">Browse experts</p>
              <p className="text-sm text-muted-foreground">
                Explore mentors from The Hacking Project community — each with their skills, price per
                session, and their Circles trust score.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">2</span>
            <div className="flex flex-col gap-1">
              <p className="font-medium">Pick a slot & pay in CRC</p>
              <p className="text-sm text-muted-foreground">
                Choose an availability slot from the expert&apos;s Cal.com calendar, then pay in{' '}
                <strong>CRC</strong> — the community currency of the Circles network. No credit card,
                no intermediary.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">3</span>
            <div className="flex flex-col gap-2">
              <p className="font-medium">Payment split — solidarity by design</p>
              <blockquote className="border-l-2 border-accent pl-3 text-sm text-accent">
                At least 50% of every session goes to THP for Good to fund future learners.
              </blockquote>
              <p className="text-sm text-muted-foreground">
                Every session payment is automatically split: at least <strong>50% goes to the THP for
                Good foundation</strong> to fund future learners, the rest to the mentor. The exact
                split is set by each mentor.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">4</span>
            <div className="flex flex-col gap-1">
              <p className="font-medium">Trust the expert</p>
              <p className="text-sm text-muted-foreground">
                After a session, the booking flow adds a Circles trust edge to your expert — growing
                the web of trust that powers the network.
              </p>
            </div>
          </li>
        </ol>
      </section>

      {/* DAO treasury + donation */}
      <DonationSection />

      {/* Circles */}
      <section className="rounded-xl border border-border bg-muted/40 px-5 py-5 flex flex-col gap-3">
        <h2 className="text-base font-semibold">Powered by Circles</h2>
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
          className="text-sm text-primary underline underline-offset-2 w-fit"
        >
          Learn more about Circles →
        </a>
      </section>

      {/* CTA */}
      <section className="flex flex-col gap-3 sm:flex-row">
        <Link href="/" className={cn(buttonVariants(), 'inline-flex min-h-11 items-center justify-center')}>
          Find an expert
        </Link>
        <Link
          href="/mentor/register"
          className={cn(buttonVariants({ variant: 'outline' }), 'inline-flex min-h-11 items-center justify-center')}
        >
          Offer your expertise
        </Link>
      </section>

    </div>
  );
}
