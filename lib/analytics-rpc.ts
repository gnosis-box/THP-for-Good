/** Live Circles RPC reads for public stats — no wallet or booking data. */

export async function fetchAvatarBalanceCrc(address: string): Promise<number | null> {
  try {
    const { Sdk } = await import('@aboutcircles/sdk');
    const sdk = new Sdk();
    const view = await sdk.rpc.profile.getProfileView(address as `0x${string}`);
    if (!view?.v2Balance) return null;
    const n = parseFloat(view.v2Balance as string);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}
