import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { parseCallLanguageCodes, parseLanguageCodes, serializeCallLanguageCodes } from '@/lib/languages';

export type TagRow = {
  id: number;
  label: string;
  status: 'approved' | 'pending';
};

export type ExpertRow = {
  id: number;
  circles_address: string;
  name: string;
  bio: string | null;
  calendar_link: string;
  google_calendar_id: string | null;
  cal_event_type_id: number | null;
  price_crc: number;
  expert_share_percent: number;
  active: number;
  created_at: string;
  skills: string[];
  spoken_languages: string[];
  call_languages: string[];
};

export type BookingRow = {
  id: number;
  expert_id: number;
  booker_address: string;
  tx_hash: string | null;
  slot_time: string | null;
  calendar_event_url: string | null;
  cal_booking_uid: string | null;
  created_at: string;
};

export type InsertExpertData = {
  circles_address: string;
  name: string;
  bio?: string;
  calendar_link: string;
  google_calendar_id?: string;
  cal_event_type_id?: number;
  price_crc?: number;
  expert_share_percent?: number;
  skills: string[];
  spoken_languages?: string[];
  call_languages?: string[];
};

export type InsertBookingData = {
  expert_id: number;
  booker_address: string;
  tx_hash?: string;
  slot_time?: string;
  calendar_event_url?: string;
  cal_booking_uid?: string;
};

type ExpertRowRaw = Omit<ExpertRow, 'skills' | 'spoken_languages' | 'call_languages'> & {
  skills: string;
  spoken_languages: string | null;
  call_languages: string | null;
};

function mapExpertRow(row: ExpertRowRaw): ExpertRow {
  return {
    ...row,
    skills: row.skills ? row.skills.split(',') : [],
    spoken_languages: parseLanguageCodes(row.spoken_languages),
    call_languages: parseCallLanguageCodes(row.call_languages),
  };
}

const dataDir = path.join(process.cwd(), 'data');

/** File-backed SQLite cannot be opened by parallel Next.js build workers. */
function resolveDbPath(): string {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return ':memory:';
  }
  fs.mkdirSync(dataDir, { recursive: true });
  return path.join(dataDir, 'thp.db');
}

const dbPath = resolveDbPath();
const db = new Database(dbPath);

if (dbPath !== ':memory:') {
  db.pragma('journal_mode = WAL');
}
db.pragma('busy_timeout = 5000');

function tableExists(name: string): boolean {
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
    .get(name) as { name: string } | undefined;
  return !!row;
}

function tryExec(sql: string): void {
  try {
    db.exec(sql);
  } catch {
    /* already applied */
  }
}

const schema = fs.readFileSync(path.join(process.cwd(), 'lib', 'schema.sql'), 'utf-8');
db.exec(schema);

/** Legacy column adds before renaming mentors → experts. */
if (tableExists('mentors')) {
  for (const sql of [
    'ALTER TABLE mentors ADD COLUMN google_calendar_id TEXT',
    'ALTER TABLE mentors ADD COLUMN cal_event_type_id INTEGER',
    'ALTER TABLE mentors ADD COLUMN mentor_share_percent INTEGER DEFAULT 20',
    'ALTER TABLE mentors ADD COLUMN spoken_languages TEXT',
    'ALTER TABLE mentors ADD COLUMN call_languages TEXT',
  ]) {
    tryExec(sql);
  }
}

/** One-time rename for databases created before expert naming. */
if (tableExists('mentors')) {
  tryExec('ALTER TABLE mentors RENAME TO experts');
}
if (tableExists('mentor_skills')) {
  tryExec('ALTER TABLE mentor_skills RENAME TO expert_skills');
}
tryExec('ALTER TABLE expert_skills RENAME COLUMN mentor_id TO expert_id');
tryExec('ALTER TABLE bookings RENAME COLUMN mentor_id TO expert_id');
tryExec('ALTER TABLE experts RENAME COLUMN mentor_share_percent TO expert_share_percent');

for (const sql of [
  'ALTER TABLE experts ADD COLUMN google_calendar_id TEXT',
  'ALTER TABLE experts ADD COLUMN cal_event_type_id INTEGER',
  'ALTER TABLE bookings ADD COLUMN slot_time TEXT',
  'ALTER TABLE bookings ADD COLUMN calendar_event_url TEXT',
  'ALTER TABLE bookings ADD COLUMN cal_booking_uid TEXT',
  "ALTER TABLE skill_tags ADD COLUMN status TEXT NOT NULL DEFAULT 'approved'",
  'ALTER TABLE experts ADD COLUMN expert_share_percent INTEGER DEFAULT 20',
  'ALTER TABLE experts ADD COLUMN spoken_languages TEXT',
  'ALTER TABLE experts ADD COLUMN call_languages TEXT',
]) {
  tryExec(sql);
}

export function getAllExperts(
  skillFilter?: string,
  includeInactive = false,
  callLanguageFilter?: string,
): ExpertRow[] {
  let sql = `
    SELECT
      e.*,
      GROUP_CONCAT(st.label) AS skills
    FROM experts e
    LEFT JOIN expert_skills es ON es.expert_id = e.id
    LEFT JOIN skill_tags st ON st.id = es.tag_id
    WHERE ${includeInactive ? '1=1' : 'e.active = 1'}
  `;
  const params: string[] = [];

  if (skillFilter) {
    sql += `
      AND e.id IN (
        SELECT es2.expert_id
        FROM expert_skills es2
        JOIN skill_tags st2 ON st2.id = es2.tag_id
        WHERE st2.label = ?
      )
    `;
    params.push(skillFilter);
  }

  if (callLanguageFilter) {
    sql += `
      AND (
        e.call_languages LIKE ?
        OR e.call_languages LIKE ?
        OR e.call_languages LIKE ?
        OR e.call_languages = ?
      )
    `;
    const code = callLanguageFilter.toLowerCase();
    params.push(`${code},%`, `%,${code}`, `%,${code},%`, code);
  }

  sql += ' GROUP BY e.id';

  const rows = db.prepare(sql).all(...params) as ExpertRowRaw[];
  return rows.map(mapExpertRow);
}

export function getExpertById(id: number): ExpertRow | undefined {
  const sql = `
    SELECT
      e.*,
      GROUP_CONCAT(st.label) AS skills
    FROM experts e
    LEFT JOIN expert_skills es ON es.expert_id = e.id
    LEFT JOIN skill_tags st ON st.id = es.tag_id
    WHERE e.id = ?
    GROUP BY e.id
  `;
  const row = db.prepare(sql).get(id) as ExpertRowRaw | undefined;
  if (!row) return undefined;
  return mapExpertRow(row);
}

export function getExpertByCirclesAddress(address: string): ExpertRow | undefined {
  const sql = `
    SELECT
      e.*,
      GROUP_CONCAT(st.label) AS skills
    FROM experts e
    LEFT JOIN expert_skills es ON es.expert_id = e.id
    LEFT JOIN skill_tags st ON st.id = es.tag_id
    WHERE LOWER(e.circles_address) = LOWER(?)
    GROUP BY e.id
  `;
  const row = db.prepare(sql).get(address) as ExpertRowRaw | undefined;
  if (!row) return undefined;
  return mapExpertRow(row);
}

export function insertExpert(data: InsertExpertData): number {
  const insertExpertStmt = db.prepare(`
    INSERT OR IGNORE INTO experts (
      circles_address, name, bio, calendar_link, google_calendar_id, cal_event_type_id,
      price_crc, expert_share_percent, spoken_languages, call_languages
    )
    VALUES (
      @circles_address, @name, @bio, @calendar_link, @google_calendar_id, @cal_event_type_id,
      @price_crc, @expert_share_percent, @spoken_languages, @call_languages
    )
  `);

  const updateLanguagesStmt = db.prepare(`
    UPDATE experts
    SET spoken_languages = @spoken_languages, call_languages = @call_languages
    WHERE id = @id
  `);

  const upsertTagStmt = db.prepare(`
    INSERT OR IGNORE INTO skill_tags (label) VALUES (?)
  `);

  const insertSkillStmt = db.prepare(`
    INSERT OR IGNORE INTO expert_skills (expert_id, tag_id)
    SELECT ?, id FROM skill_tags WHERE label = ?
  `);

  const getExpertIdStmt = db.prepare(
    'SELECT id FROM experts WHERE circles_address = ?',
  );

  const run = db.transaction(() => {
    const spokenSerialized =
      data.spoken_languages && data.spoken_languages.length > 0
        ? data.spoken_languages.join(',')
        : null;
    const callSerialized =
      data.call_languages && data.call_languages.length > 0
        ? serializeCallLanguageCodes(data.call_languages)
        : serializeCallLanguageCodes(data.spoken_languages ?? []);

    insertExpertStmt.run({
      circles_address: data.circles_address,
      name: data.name,
      bio: data.bio ?? null,
      calendar_link: data.calendar_link,
      google_calendar_id: data.google_calendar_id ?? null,
      cal_event_type_id: data.cal_event_type_id ?? null,
      price_crc: data.price_crc ?? 100,
      expert_share_percent: data.expert_share_percent ?? 20,
      spoken_languages: spokenSerialized,
      call_languages: callSerialized,
    });

    const row = getExpertIdStmt.get(data.circles_address) as { id: number };
    const expertId = row.id;

    if (spokenSerialized !== null) {
      updateLanguagesStmt.run({
        spoken_languages: spokenSerialized,
        call_languages: callSerialized,
        id: expertId,
      });
    }

    for (const skill of data.skills) {
      upsertTagStmt.run(skill);
      insertSkillStmt.run(expertId, skill);
    }

    return expertId;
  });

  return run() as number;
}

/** Re-apply seed language fields for an existing expert (idempotent). */
export function syncExpertLanguages(
  circlesAddress: string,
  spoken: string[],
  call: string[],
): boolean {
  const spokenSerialized = spoken.length > 0 ? spoken.join(',') : null;
  const callSerialized = serializeCallLanguageCodes(call.length > 0 ? call : spoken);
  const result = db
    .prepare(
      `UPDATE experts SET spoken_languages = ?, call_languages = ?
       WHERE LOWER(circles_address) = LOWER(?)`,
    )
    .run(spokenSerialized, callSerialized, circlesAddress);
  return result.changes > 0;
}

export function getAllTags(includePending = false): TagRow[] {
  if (includePending) {
    return db
      .prepare('SELECT id, label, COALESCE(status, \'approved\') AS status FROM skill_tags ORDER BY label')
      .all() as TagRow[];
  }
  return db
    .prepare(
      "SELECT id, label, COALESCE(status, 'approved') AS status FROM skill_tags WHERE COALESCE(status, 'approved') = 'approved' ORDER BY label",
    )
    .all() as TagRow[];
}

export function proposeSkillTag(label: string): number {
  const existing = db
    .prepare('SELECT id, status FROM skill_tags WHERE LOWER(label) = LOWER(?)')
    .get(label) as { id: number; status: string } | undefined;
  if (existing) {
    if (existing.status === 'approved') return existing.id;
    return existing.id;
  }
  const result = db
    .prepare("INSERT INTO skill_tags (label, status) VALUES (?, 'pending')")
    .run(label.trim());
  return result.lastInsertRowid as number;
}

export function approveSkillTag(id: number): void {
  db.prepare("UPDATE skill_tags SET status = 'approved' WHERE id = ?").run(id);
}

export function insertBooking(data: InsertBookingData): number {
  const stmt = db.prepare(`
    INSERT INTO bookings (expert_id, booker_address, tx_hash, slot_time, calendar_event_url, cal_booking_uid)
    VALUES (@expert_id, @booker_address, @tx_hash, @slot_time, @calendar_event_url, @cal_booking_uid)
  `);
  const result = stmt.run({
    expert_id: data.expert_id,
    booker_address: data.booker_address,
    tx_hash: data.tx_hash ?? null,
    slot_time: data.slot_time ?? null,
    calendar_event_url: data.calendar_event_url ?? null,
    cal_booking_uid: data.cal_booking_uid ?? null,
  });
  return result.lastInsertRowid as number;
}

export type AdminRow = { id: number; circles_address: string; created_at: string };

export function getDbAdmins(): AdminRow[] {
  return db.prepare('SELECT * FROM admins ORDER BY created_at DESC').all() as AdminRow[];
}

export function addDbAdmin(address: string): void {
  db.prepare('INSERT OR IGNORE INTO admins (circles_address) VALUES (?)').run(address.toLowerCase());
}

export function removeDbAdmin(id: number): void {
  db.prepare('DELETE FROM admins WHERE id = ?').run(id);
}

export function isAdminAddress(address: string): boolean {
  const envAdmins = (process.env.ADMIN_ADDRESSES ?? '').toLowerCase().split(',').filter(Boolean);
  const addr = address.toLowerCase();
  if (envAdmins.includes(addr)) return true;
  const row = db.prepare('SELECT id FROM admins WHERE circles_address = ?').get(addr);
  return !!row;
}

export function getBookingsByAddress(address: string): BookingRow[] {
  return db
    .prepare('SELECT * FROM bookings WHERE booker_address = ? ORDER BY created_at DESC')
    .all(address) as BookingRow[];
}

export type BookingWithExpertName = BookingRow & { expert_name: string };

export function getBookingsByProviderAddress(providerAddress: string): BookingWithExpertName[] {
  return db
    .prepare(
      `SELECT b.*, e.name AS expert_name
       FROM bookings b
       JOIN experts e ON e.id = b.expert_id
       WHERE LOWER(e.circles_address) = LOWER(?)
       ORDER BY b.created_at DESC`,
    )
    .all(providerAddress) as BookingWithExpertName[];
}

export type AdminHealthStats = {
  bookings: {
    total: number;
    today: number;
    last7Days: number;
    withTx: number;
    withoutTx: number;
    withoutTrust: number;
  };
  experts: {
    total: number;
    active: number;
    inactive: number;
    activeWithoutCal: number;
    activeWithoutLanguages: number;
  };
  tags: {
    pending: number;
    approved: number;
  };
  recentBookings: Array<{
    id: number;
    expert_name: string;
    booker_address: string;
    tx_hash: string | null;
    slot_time: string | null;
    created_at: string;
    has_trust: boolean;
  }>;
};

export function getAdminHealthStats(): AdminHealthStats {
  const bookingCounts = db
    .prepare(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN date(created_at) = date('now') THEN 1 ELSE 0 END) AS today,
         SUM(CASE WHEN datetime(created_at) >= datetime('now', '-7 days') THEN 1 ELSE 0 END) AS last7_days,
         SUM(CASE WHEN tx_hash IS NOT NULL AND tx_hash != '' THEN 1 ELSE 0 END) AS with_tx,
         SUM(CASE WHEN tx_hash IS NULL OR tx_hash = '' THEN 1 ELSE 0 END) AS without_tx,
         SUM(CASE WHEN (tx_hash IS NOT NULL AND tx_hash != '')
           AND NOT EXISTS (SELECT 1 FROM trust_attestations t WHERE t.booking_id = bookings.id)
           THEN 1 ELSE 0 END) AS without_trust
       FROM bookings`,
    )
    .get() as {
      total: number;
      today: number;
      last7_days: number;
      with_tx: number;
      without_tx: number;
      without_trust: number;
    };

  const expertCounts = db
    .prepare(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) AS active,
         SUM(CASE WHEN active != 1 THEN 1 ELSE 0 END) AS inactive,
         SUM(CASE WHEN active = 1 AND cal_event_type_id IS NULL THEN 1 ELSE 0 END) AS active_without_cal,
         SUM(CASE WHEN active = 1 AND (call_languages IS NULL OR call_languages = '') THEN 1 ELSE 0 END) AS active_without_languages
       FROM experts`,
    )
    .get() as {
      total: number;
      active: number;
      inactive: number;
      active_without_cal: number;
      active_without_languages: number;
    };

  const tagCounts = db
    .prepare(
      `SELECT
         SUM(CASE WHEN COALESCE(status, 'approved') = 'pending' THEN 1 ELSE 0 END) AS pending,
         SUM(CASE WHEN COALESCE(status, 'approved') = 'approved' THEN 1 ELSE 0 END) AS approved
       FROM skill_tags`,
    )
    .get() as { pending: number; approved: number };

  const recentBookings = db
    .prepare(
      `SELECT
         b.id,
         e.name AS expert_name,
         b.booker_address,
         b.tx_hash,
         b.slot_time,
         b.created_at,
         EXISTS(SELECT 1 FROM trust_attestations t WHERE t.booking_id = b.id) AS has_trust
       FROM bookings b
       JOIN experts e ON e.id = b.expert_id
       ORDER BY b.created_at DESC
       LIMIT 10`,
    )
    .all() as Array<{
      id: number;
      expert_name: string;
      booker_address: string;
      tx_hash: string | null;
      slot_time: string | null;
      created_at: string;
      has_trust: number;
    }>;

  return {
    bookings: {
      total: bookingCounts.total ?? 0,
      today: bookingCounts.today ?? 0,
      last7Days: bookingCounts.last7_days ?? 0,
      withTx: bookingCounts.with_tx ?? 0,
      withoutTx: bookingCounts.without_tx ?? 0,
      withoutTrust: bookingCounts.without_trust ?? 0,
    },
    experts: {
      total: expertCounts.total ?? 0,
      active: expertCounts.active ?? 0,
      inactive: expertCounts.inactive ?? 0,
      activeWithoutCal: expertCounts.active_without_cal ?? 0,
      activeWithoutLanguages: expertCounts.active_without_languages ?? 0,
    },
    tags: {
      pending: tagCounts.pending ?? 0,
      approved: tagCounts.approved ?? 0,
    },
    recentBookings: recentBookings.map((row) => ({
      id: row.id,
      expert_name: row.expert_name,
      booker_address: row.booker_address,
      tx_hash: row.tx_hash,
      slot_time: row.slot_time,
      created_at: row.created_at,
      has_trust: row.has_trust === 1,
    })),
  };
}

export type StatsTagCount = { label: string; count: number };

export type StatsRecentPaidBooking = {
  id: number;
  expertName: string;
  txHash: string;
  createdAt: string;
};

export type StatsEnrichment = {
  activeExperts: number;
  totalExperts: number;
  tagCounts: StatsTagCount[];
  trustAttestationCount: number;
  trustAttestationsWithTxHash: number;
  paidBookingCount: number;
  bookingIntentCount: number;
  recentPaidBookings: StatsRecentPaidBooking[];
};

export type StatsReconcile = {
  pendingTxCount: number;
  oldestPendingAgeHours: number | null;
};

export function getExpertPaidSessionCounts(): Map<number, number> {
  const rows = db
    .prepare(
      `SELECT expert_id, COUNT(*) AS n FROM bookings
       WHERE tx_hash IS NOT NULL AND TRIM(tx_hash) != ''
       GROUP BY expert_id`,
    )
    .all() as { expert_id: number; n: number }[];
  return new Map(rows.map((r) => [r.expert_id, r.n]));
}

export function getStatsEnrichment(): StatsEnrichment {
  const activeExperts = (
    db.prepare('SELECT COUNT(*) AS n FROM experts WHERE active = 1').get() as { n: number }
  ).n;
  const totalExperts = (
    db.prepare('SELECT COUNT(*) AS n FROM experts').get() as { n: number }
  ).n;
  const tagCounts = db
    .prepare(
      `SELECT st.label AS label, COUNT(*) AS count
       FROM expert_skills es
       JOIN skill_tags st ON st.id = es.tag_id
       GROUP BY st.label
       ORDER BY count DESC, st.label ASC`,
    )
    .all() as StatsTagCount[];
  const trustAttestationCount = (
    db.prepare('SELECT COUNT(*) AS n FROM trust_attestations').get() as { n: number }
  ).n;
  const trustAttestationsWithTxHash = (
    db
      .prepare(
        `SELECT COUNT(*) AS n FROM trust_attestations
         WHERE trust_tx_hash IS NOT NULL AND TRIM(trust_tx_hash) != ''`,
      )
      .get() as { n: number }
  ).n;
  const paidBookingCount = (
    db
      .prepare(
        `SELECT COUNT(*) AS n FROM bookings
         WHERE tx_hash IS NOT NULL AND TRIM(tx_hash) != ''`,
      )
      .get() as { n: number }
  ).n;
  const bookingIntentCount = (
    db
      .prepare(
        `SELECT COUNT(*) AS n FROM bookings
         WHERE tx_hash IS NULL OR TRIM(tx_hash) = ''`,
      )
      .get() as { n: number }
  ).n;
  const recentPaidBookings = db
    .prepare(
      `SELECT b.id AS id, e.name AS expertName, b.tx_hash AS txHash, b.created_at AS createdAt
       FROM bookings b
       JOIN experts e ON e.id = b.expert_id
       WHERE b.tx_hash IS NOT NULL AND TRIM(b.tx_hash) != ''
       ORDER BY b.created_at DESC
       LIMIT 10`,
    )
    .all() as StatsRecentPaidBooking[];

  return {
    activeExperts,
    totalExperts,
    tagCounts,
    trustAttestationCount,
    trustAttestationsWithTxHash,
    paidBookingCount,
    bookingIntentCount,
    recentPaidBookings,
  };
}

export function getStatsReconcile(): StatsReconcile {
  const pendingTxCount = (
    db
      .prepare(
        `SELECT COUNT(*) AS n FROM bookings
         WHERE (tx_hash IS NULL OR TRIM(tx_hash) = '')
           AND datetime(created_at) <= datetime('now', '-24 hours')`,
      )
      .get() as { n: number }
  ).n;

  const oldest = db
    .prepare(
      `SELECT MIN(created_at) AS oldest FROM bookings
       WHERE tx_hash IS NULL OR TRIM(tx_hash) = ''`,
    )
    .get() as { oldest: string | null };

  let oldestPendingAgeHours: number | null = null;
  if (oldest?.oldest) {
    const ms = Date.now() - new Date(oldest.oldest).getTime();
    if (Number.isFinite(ms) && ms > 0) {
      oldestPendingAgeHours = Math.floor(ms / (1000 * 60 * 60));
    }
  }

  return { pendingTxCount, oldestPendingAgeHours };
}

export function insertTrustAttestation(bookingId: number, trustTxHash?: string | null): void {
  db.prepare(
    `INSERT OR IGNORE INTO trust_attestations (booking_id, trust_tx_hash) VALUES (?, ?)`,
  ).run(bookingId, trustTxHash?.trim() || null);
}

export function getExpertPaidBookingCount(expertId: number): number {
  return (
    db
      .prepare(
        `SELECT COUNT(*) AS n FROM bookings
         WHERE expert_id = ? AND tx_hash IS NOT NULL AND TRIM(tx_hash) != ''`,
      )
      .get(expertId) as { n: number }
  ).n;
}

export function getExpertTrustAttestationCount(expertId: number): number {
  return (
    db
      .prepare(
        `SELECT COUNT(*) AS n FROM trust_attestations t
         JOIN bookings b ON b.id = t.booking_id
         WHERE b.expert_id = ?`,
      )
      .get(expertId) as { n: number }
  ).n;
}

export function getExpertBookingIntentCount(expertId: number): number {
  return (
    db
      .prepare(
        `SELECT COUNT(*) AS n FROM bookings
         WHERE expert_id = ? AND (tx_hash IS NULL OR TRIM(tx_hash) = '')`,
      )
      .get(expertId) as { n: number }
  ).n;
}

export default db;
