export type AnalyticsEvent =
  | "sign_in_success"
  | "booking_success"
  | "trust_success";

/** No-op outside production analytics tooling (Coolify has no Vercel Analytics). */
export function trackEvent(
  name: AnalyticsEvent,
  properties?: Record<string, string | number | boolean>,
): void {
  void name;
  void properties;
}
