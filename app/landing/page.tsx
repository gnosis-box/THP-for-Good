import type { Metadata } from 'next';

import { LandingView } from '@/components/landing/LandingView';
import {
  buildDefaultOpenGraph,
  buildDefaultTwitter,
  SITE_NAME,
} from '@/lib/site-metadata';
import { UI_COPY } from '@/lib/ui-copy';

export const metadata: Metadata = {
  title: SITE_NAME,
  description: UI_COPY.landing.subtitle,
  alternates: { canonical: '/landing' },
  openGraph: buildDefaultOpenGraph({
    url: '/landing',
    title: SITE_NAME,
    description: UI_COPY.landing.subtitle,
  }),
  twitter: buildDefaultTwitter({
    title: SITE_NAME,
    description: UI_COPY.landing.subtitle,
  }),
  robots: { index: false, follow: false },
};

export default function LandingPage() {
  return <LandingView />;
}
