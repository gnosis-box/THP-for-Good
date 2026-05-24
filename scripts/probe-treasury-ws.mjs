#!/usr/bin/env node
/**
 * Phase 0 spike: log treasury WSS events (Node 22+ has global WebSocket).
 * Usage: node scripts/probe-treasury-ws.mjs
 */
const TREASURY = '0xc02D5aaCA64dE428D571dA42538232C431E0CDeD';
const GROUP = '0x2b5e4045936ef12250a8c01e4cbf71e9bee69e00';

const ws = new WebSocket('wss://rpc.aboutcircles.com/ws/subscribe');

ws.onopen = () => {
  console.log('[probe] connected');
  ws.send(
    JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'circles_subscribe',
      params: ['circles', { address: TREASURY }],
    }),
  );
};

ws.onmessage = (event) => {
  try {
    const data = JSON.parse(String(event.data));
    const raw = data?.params ?? data?.result ?? data;
    const name = raw?.event ?? raw?.values?.$event;
    if (name === 'CrcV2_TransferSummary') {
      const to = raw?.values?.to ?? raw?.to;
      const from = raw?.values?.from ?? raw?.from;
      if (String(to).toLowerCase() === TREASURY.toLowerCase() && String(from).toLowerCase() !== GROUP) {
        console.log('[probe] TransferSummary inbound', JSON.stringify(raw, null, 2));
      }
    }
  } catch {
    console.log('[probe] raw', event.data);
  }
};

ws.onerror = () => console.error('[probe] error');
ws.onclose = () => console.log('[probe] closed');

console.log('[probe] waiting for treasury events… Ctrl+C to exit');
