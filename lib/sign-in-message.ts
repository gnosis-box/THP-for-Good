export function buildSignInMessage(
  address: string,
  purpose = "mentor booking",
): string {
  const nonce = Math.random().toString(36).slice(2, 10);
  const issuedAt = new Date().toISOString();
  return [
    `Sign in for ${purpose}.`,
    "",
    `Address: ${address}`,
    `Nonce: ${nonce}`,
    `Issued At: ${issuedAt}`,
  ].join("\n");
}

const SIGNED_IN_KEY = "thp-mentor-signed-in";

export function getSignedInSession(address: string | null): boolean {
  if (!address || typeof window === "undefined") return false;
  try {
    const raw = sessionStorage.getItem(SIGNED_IN_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { address: string; verified: boolean };
    return (
      parsed.address.toLowerCase() === address.toLowerCase() && parsed.verified
    );
  } catch {
    return false;
  }
}

export function setSignedInSession(address: string, verified: boolean): void {
  sessionStorage.setItem(
    SIGNED_IN_KEY,
    JSON.stringify({ address, verified }),
  );
}

export function clearSignedInSession(): void {
  sessionStorage.removeItem(SIGNED_IN_KEY);
}
