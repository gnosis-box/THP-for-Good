import Script from 'next/script';

import { isUmamiEnabled } from '@/lib/analytics-umami';

export function UmamiScript() {
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID?.trim();
  const scriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL?.trim();

  if (!isUmamiEnabled() || !websiteId || !scriptUrl) {
    return null;
  }

  return (
    <Script
      defer
      src={scriptUrl}
      data-website-id={websiteId}
      strategy="afterInteractive"
    />
  );
}
