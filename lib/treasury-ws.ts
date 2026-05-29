import { TREASURY_ORG_ADDRESS } from '@/lib/analytics-explorer';
import {
  isTreasuryInboundSummary,
  parseInboundFromMessage,
  type RawCirclesEvent,
  type TreasuryInboundEvent,
} from '@/lib/treasury-events';

const WSS_URL = 'wss://rpc.aboutcircles.com/ws/subscribe';
const MAX_BACKOFF_MS = 30_000;
const INITIAL_BACKOFF_MS = 1_000;

export type TreasuryWsCallbacks = {
  onInbound: (event: TreasuryInboundEvent) => void;
  onStatus?: (status: 'connecting' | 'open' | 'closed' | 'error') => void;
};

export type TreasuryWsClient = {
  destroy: () => void;
};

export function createTreasuryWsClient(callbacks: TreasuryWsCallbacks): TreasuryWsClient {
  let ws: WebSocket | null = null;
  let destroyed = false;
  let backoffMs = INITIAL_BACKOFF_MS;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  function clearReconnect() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  }

  function subscribe() {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(
      JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'circles_subscribe',
        params: ['circles', { address: TREASURY_ORG_ADDRESS }],
      }),
    );
  }

  function handleMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(String(event.data)) as unknown;

      if (Array.isArray(data)) {
        for (const item of data) {
          const parsed = parseInboundFromMessage(item);
          if (parsed) callbacks.onInbound(parsed);
        }
        return;
      }

      const parsed = parseInboundFromMessage(data);
      if (parsed) {
        callbacks.onInbound(parsed);
        return;
      }

      if (data && typeof data === 'object') {
        const record = data as Record<string, unknown>;
        const params = record.params;
        if (params && typeof params === 'object') {
          const raw = params as RawCirclesEvent;
          if (isTreasuryInboundSummary(raw)) {
            const inbound = parseInboundFromMessage({ event: raw.event, values: raw.values });
            if (inbound) callbacks.onInbound(inbound);
          }
        }
      }
    } catch {
      /* ignore malformed frames */
    }
  }

  function scheduleReconnect() {
    if (destroyed) return;
    clearReconnect();
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, backoffMs);
    backoffMs = Math.min(backoffMs * 2, MAX_BACKOFF_MS);
  }

  function connect() {
    if (destroyed || typeof WebSocket === 'undefined') return;
    callbacks.onStatus?.('connecting');
    try {
      ws = new WebSocket(WSS_URL);
    } catch {
      callbacks.onStatus?.('error');
      ws = null;
      scheduleReconnect();
      return;
    }

    ws.onopen = () => {
      backoffMs = INITIAL_BACKOFF_MS;
      callbacks.onStatus?.('open');
      subscribe();
    };

    ws.onmessage = handleMessage;

    ws.onerror = () => {
      callbacks.onStatus?.('error');
    };

    ws.onclose = () => {
      callbacks.onStatus?.('closed');
      ws = null;
      if (!destroyed) scheduleReconnect();
    };
  }

  connect();

  return {
    destroy() {
      destroyed = true;
      clearReconnect();
      if (ws) {
        ws.onclose = null;
        ws.close();
        ws = null;
      }
    },
  };
}
