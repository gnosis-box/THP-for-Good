async function buildContractRunner(address: string) {
  const { sendTransactions } = await import('@aboutcircles/miniapp-sdk');
  return {
    address: address as `0x${string}`,
    publicClient: null as unknown,
    init: async () => {},
    sendTransaction: (txs: { to: string; data: string; value?: bigint }[]) =>
      sendTransactions(
        txs.map((tx) => ({ to: tx.to, data: tx.data, value: String(tx.value ?? '0') })),
      ),
  };
}

export async function addTrust(viewerAddress: string, expertAddress: string): Promise<void> {
  const [{ Sdk }, { circlesConfig }] = await Promise.all([
    import('@aboutcircles/sdk'),
    import('@aboutcircles/sdk-utils'),
  ]);
  const runner = await buildContractRunner(viewerAddress);
  const sdk = new Sdk(circlesConfig[100], runner);
  const avatar = await sdk.getAvatar(viewerAddress as `0x${string}`);
  await avatar.trust.add(expertAddress as `0x${string}`);
}

export async function removeTrust(viewerAddress: string, expertAddress: string): Promise<void> {
  const [{ Sdk }, { circlesConfig }] = await Promise.all([
    import('@aboutcircles/sdk'),
    import('@aboutcircles/sdk-utils'),
  ]);
  const runner = await buildContractRunner(viewerAddress);
  const sdk = new Sdk(circlesConfig[100], runner);
  const avatar = await sdk.getAvatar(viewerAddress as `0x${string}`);
  await avatar.trust.add(expertAddress as `0x${string}`, 0n);
}
