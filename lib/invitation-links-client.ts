export type InvitationClaimResult = {
  ok: true;
  source: 'pool' | 'fallback';
  invitation_url: string;
  reason?: 'empty_pool';
};

export async function claimInvitationLink(walletAddress: string | null): Promise<InvitationClaimResult> {
  const response = await fetch('/api/invitation-links/claim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wallet_address: walletAddress }),
  });

  const payload = (await response.json()) as InvitationClaimResult & { error?: string };
  if (!response.ok || !payload?.invitation_url) {
    throw new Error(payload?.error ?? 'Failed to claim invitation link');
  }
  return payload;
}
