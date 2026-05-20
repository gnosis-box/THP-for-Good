import type { TagAttestation, TagTrustStore } from '@/lib/types';

const STORAGE_KEY = 'thp-tag-trust-v1';

function readStore(): TagTrustStore {
  if (typeof window === 'undefined') return { attestations: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { attestations: [] };
    return JSON.parse(raw) as TagTrustStore;
  } catch {
    return { attestations: [] };
  }
}

function writeStore(store: TagTrustStore): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getAttestations(): TagAttestation[] {
  return readStore().attestations;
}

export function getAttestationForBooking(
  mentorId: string,
  studentAddress: string,
): TagAttestation | undefined {
  const lower = studentAddress.toLowerCase();
  return getAttestations().find(
    (item) =>
      item.mentorId === mentorId &&
      item.studentAddress.toLowerCase() === lower,
  );
}

export function addAttestation(attestation: TagAttestation): void {
  const store = readStore();
  store.attestations.unshift(attestation);
  writeStore(store);
}

export function updateAttestationTrustHash(
  mentorId: string,
  studentAddress: string,
  trustTxHash: `0x${string}`,
): void {
  const store = readStore();
  const lower = studentAddress.toLowerCase();
  store.attestations = store.attestations.map((item) =>
    item.mentorId === mentorId && item.studentAddress.toLowerCase() === lower
      ? { ...item, trustTxHash }
      : item,
  );
  writeStore(store);
}
