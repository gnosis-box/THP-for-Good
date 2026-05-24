import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { DonationSection } from '@/components/about/DonationSection';
import { AboutHero, AboutHowItWorks } from '@/components/about/AboutSections';
import { cn } from '@/lib/utils';

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 flex flex-col gap-12">
      <AboutHero />

      <AboutHowItWorks />

      <DonationSection />

      <section className="flex flex-col gap-2">
        <Link
          href="/stats"
          className="text-sm text-primary underline underline-offset-2 w-fit"
        >
          View transparency dashboard →
        </Link>
      </section>

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

      <section className="flex flex-col gap-3 sm:flex-row">
        <Link href="/" className={cn(buttonVariants(), 'inline-flex min-h-11 items-center justify-center')}>
          Find an expert
        </Link>
        <Link
          href="/expert/register"
          className={cn(buttonVariants({ variant: 'outline' }), 'inline-flex min-h-11 items-center justify-center')}
        >
          Offer your expertise
        </Link>
      </section>
    </div>
  );
}
