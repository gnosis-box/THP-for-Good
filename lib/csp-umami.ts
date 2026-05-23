/** Parse Umami script URL origin for CSP directives (build-time env). */
export function umamiOriginFromEnv(): string | null {
  const raw = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL?.trim();
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

export function buildContentSecurityPolicy(frameAncestors: string): string {
  const umamiOrigin = umamiOriginFromEnv();
  const parts = [
    `frame-ancestors ${frameAncestors}`,
    'frame-src https://calendar.google.com',
  ];
  if (umamiOrigin) {
    parts.push(`script-src 'self' 'unsafe-inline' ${umamiOrigin}`);
    parts.push(
      `connect-src 'self' ${umamiOrigin} https://rpc.aboutcircles.com https://explorer.aboutcircles.com`,
    );
  }
  return parts.join('; ') + ';';
}
