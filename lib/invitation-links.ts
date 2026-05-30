import db from '@/lib/db';

export type InvitationLinkStatus = 'available' | 'used' | 'invalid';

export type InvitationLinkRow = {
  id: number;
  url: string;
  status: InvitationLinkStatus;
  added_by: string;
  created_at: string;
  consumed_at: string | null;
  consumed_by: string | null;
};

export type AllocateInviteLinkResult =
  | { kind: 'link'; url: string }
  | { kind: 'fallback' };

const MAX_ALLOCATION_RETRIES = 5;

export function isValidInviteUrl(raw: string): boolean {
  try {
    const url = new URL(raw.trim());
    return url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function getAllInvitationLinks(status?: InvitationLinkStatus | 'all'): InvitationLinkRow[] {
  if (status && status !== 'all') {
    return db
      .prepare(
        `SELECT id, url, status, added_by, created_at, consumed_at, consumed_by
         FROM invitation_links
         WHERE status = ?
         ORDER BY created_at ASC`,
      )
      .all(status) as InvitationLinkRow[];
  }

  return db
    .prepare(
      `SELECT id, url, status, added_by, created_at, consumed_at, consumed_by
       FROM invitation_links
       ORDER BY created_at ASC`,
    )
    .all() as InvitationLinkRow[];
}

export function countInvitationLinksByStatus(): Record<InvitationLinkStatus, number> {
  const rows = db
    .prepare(`SELECT status, COUNT(*) AS n FROM invitation_links GROUP BY status`)
    .all() as { status: InvitationLinkStatus; n: number }[];

  return {
    available: rows.find((r) => r.status === 'available')?.n ?? 0,
    used: rows.find((r) => r.status === 'used')?.n ?? 0,
    invalid: rows.find((r) => r.status === 'invalid')?.n ?? 0,
  };
}

export function insertInvitationLink(url: string, addedBy: string): InvitationLinkRow {
  const trimmed = url.trim();
  const result = db
    .prepare(
      `INSERT INTO invitation_links (url, added_by, status)
       VALUES (?, ?, 'available')`,
    )
    .run(trimmed, addedBy);

  return db
    .prepare(
      `SELECT id, url, status, added_by, created_at, consumed_at, consumed_by
       FROM invitation_links WHERE id = ?`,
    )
    .get(result.lastInsertRowid) as InvitationLinkRow;
}

export function allocateInviteLink(consumedBy: string): AllocateInviteLinkResult {
  const selectNextAvailable = db.prepare(`
    SELECT id, url FROM invitation_links
    WHERE status = 'available'
    ORDER BY created_at ASC
    LIMIT 1
  `);

  const markUsed = db.prepare(`
    UPDATE invitation_links
    SET status = 'used', consumed_at = datetime('now'), consumed_by = ?
    WHERE id = ? AND status = 'available'
  `);

  const markInvalid = db.prepare(`
    UPDATE invitation_links SET status = 'invalid' WHERE id = ? AND status = 'available'
  `);

  const allocate = db.transaction((): AllocateInviteLinkResult => {
    for (let attempt = 0; attempt < MAX_ALLOCATION_RETRIES; attempt += 1) {
      const row = selectNextAvailable.get() as { id: number; url: string } | undefined;
      if (!row) return { kind: 'fallback' };

      if (!isValidInviteUrl(row.url)) {
        markInvalid.run(row.id);
        continue;
      }

      const updated = markUsed.run(consumedBy, row.id);
      if (updated.changes === 0) continue;

      return { kind: 'link', url: row.url.trim() };
    }
    return { kind: 'fallback' };
  });

  return allocate();
}
