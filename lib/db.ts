import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

export type TagRow = {
  id: number;
  label: string;
};

export type MentorRow = {
  id: number;
  circles_address: string;
  name: string;
  bio: string | null;
  calendar_link: string;
  google_calendar_id: string | null;
  cal_event_type_id: number | null;
  price_crc: number;
  active: number;
  created_at: string;
  skills: string[];
};

export type BookingRow = {
  id: number;
  mentor_id: number;
  booker_address: string;
  tx_hash: string | null;
  slot_time: string | null;
  calendar_event_url: string | null;
  cal_booking_uid: string | null;
  created_at: string;
};

export type InsertMentorData = {
  circles_address: string;
  name: string;
  bio?: string;
  calendar_link: string;
  google_calendar_id?: string;
  cal_event_type_id?: number;
  price_crc?: number;
  skills: string[];
};

export type InsertBookingData = {
  mentor_id: number;
  booker_address: string;
  tx_hash?: string;
  slot_time?: string;
  calendar_event_url?: string;
  cal_booking_uid?: string;
};

type MentorRowRaw = Omit<MentorRow, 'skills'> & { skills: string };

const dataDir = path.join(process.cwd(), 'data');
fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'thp.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

const schema = fs.readFileSync(path.join(process.cwd(), 'lib', 'schema.sql'), 'utf-8');
db.exec(schema);

// Idempotent column migrations for existing databases
for (const sql of [
  'ALTER TABLE mentors ADD COLUMN google_calendar_id TEXT',
  'ALTER TABLE mentors ADD COLUMN cal_event_type_id INTEGER',
  'ALTER TABLE bookings ADD COLUMN slot_time TEXT',
  'ALTER TABLE bookings ADD COLUMN calendar_event_url TEXT',
  'ALTER TABLE bookings ADD COLUMN cal_booking_uid TEXT',
]) {
  try { db.exec(sql); } catch { /* column already exists */ }
}

export function getAllMentors(skillFilter?: string, includeInactive = false): MentorRow[] {
  let sql = `
    SELECT
      m.*,
      GROUP_CONCAT(st.label) AS skills
    FROM mentors m
    LEFT JOIN mentor_skills ms ON ms.mentor_id = m.id
    LEFT JOIN skill_tags st ON st.id = ms.tag_id
    WHERE ${includeInactive ? '1=1' : 'm.active = 1'}
  `;
  const params: string[] = [];

  if (skillFilter) {
    sql += `
      AND m.id IN (
        SELECT ms2.mentor_id
        FROM mentor_skills ms2
        JOIN skill_tags st2 ON st2.id = ms2.tag_id
        WHERE st2.label = ?
      )
    `;
    params.push(skillFilter);
  }

  sql += ' GROUP BY m.id';

  const rows = db.prepare(sql).all(...params) as MentorRowRaw[];
  return rows.map((r) => ({
    ...r,
    skills: r.skills ? r.skills.split(',') : [],
  }));
}

export function getMentorById(id: number): MentorRow | undefined {
  const sql = `
    SELECT
      m.*,
      GROUP_CONCAT(st.label) AS skills
    FROM mentors m
    LEFT JOIN mentor_skills ms ON ms.mentor_id = m.id
    LEFT JOIN skill_tags st ON st.id = ms.tag_id
    WHERE m.id = ?
    GROUP BY m.id
  `;
  const row = db.prepare(sql).get(id) as MentorRowRaw | undefined;
  if (!row) return undefined;
  return { ...row, skills: row.skills ? row.skills.split(',') : [] };
}

export function insertMentor(data: InsertMentorData): number {
  const insertMentorStmt = db.prepare(`
    INSERT OR IGNORE INTO mentors (circles_address, name, bio, calendar_link, google_calendar_id, cal_event_type_id, price_crc)
    VALUES (@circles_address, @name, @bio, @calendar_link, @google_calendar_id, @cal_event_type_id, @price_crc)
  `);

  const upsertTagStmt = db.prepare(`
    INSERT OR IGNORE INTO skill_tags (label) VALUES (?)
  `);

  const insertSkillStmt = db.prepare(`
    INSERT OR IGNORE INTO mentor_skills (mentor_id, tag_id)
    SELECT ?, id FROM skill_tags WHERE label = ?
  `);

  const getMentorIdStmt = db.prepare(
    'SELECT id FROM mentors WHERE circles_address = ?'
  );

  const run = db.transaction(() => {
    insertMentorStmt.run({
      circles_address: data.circles_address,
      name: data.name,
      bio: data.bio ?? null,
      calendar_link: data.calendar_link,
      google_calendar_id: data.google_calendar_id ?? null,
      cal_event_type_id: data.cal_event_type_id ?? null,
      price_crc: data.price_crc ?? 100,
    });

    const row = getMentorIdStmt.get(data.circles_address) as { id: number };
    const mentorId = row.id;

    for (const skill of data.skills) {
      upsertTagStmt.run(skill);
      insertSkillStmt.run(mentorId, skill);
    }

    return mentorId;
  });

  return run() as number;
}

export function getAllTags(): TagRow[] {
  return db.prepare('SELECT id, label FROM skill_tags ORDER BY label').all() as TagRow[];
}

export function insertBooking(data: InsertBookingData): number {
  const stmt = db.prepare(`
    INSERT INTO bookings (mentor_id, booker_address, tx_hash, slot_time, calendar_event_url, cal_booking_uid)
    VALUES (@mentor_id, @booker_address, @tx_hash, @slot_time, @calendar_event_url, @cal_booking_uid)
  `);
  const result = stmt.run({
    mentor_id: data.mentor_id,
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

export default db;
