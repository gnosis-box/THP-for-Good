export type TrustRelationKind = 'none' | 'incoming' | 'outgoing' | 'mutual';

export async function queryTrustEdge(truster: string, trustee: string): Promise<boolean> {
  const res = await fetch('https://rpc.aboutcircles.com/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'circles_query',
      params: [
        {
          Namespace: 'V_Crc',
          Table: 'TrustRelations',
          Columns: ['truster', 'trustee', 'expiryTime'],
          Filter: [
            { Type: 'FilterPredicate', FilterType: 'Equals', Column: 'truster', Value: truster.toLowerCase() },
            { Type: 'FilterPredicate', FilterType: 'Equals', Column: 'trustee', Value: trustee.toLowerCase() },
          ],
          Limit: 1,
        },
      ],
    }),
  });
  const json = (await res.json()) as { result?: { rows?: unknown[][] } };
  return (json.result?.rows?.length ?? 0) > 0;
}

export async function resolveTrustRelation(
  viewerAddress: string,
  otherAddress: string,
): Promise<TrustRelationKind> {
  const [outgoing, incoming] = await Promise.all([
    queryTrustEdge(viewerAddress, otherAddress),
    queryTrustEdge(otherAddress, viewerAddress),
  ]);
  if (outgoing && incoming) return 'mutual';
  if (outgoing) return 'outgoing';
  if (incoming) return 'incoming';
  return 'none';
}
