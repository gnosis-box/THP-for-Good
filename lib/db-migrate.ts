import type Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

export type MigrationHealth = {
  mentorsTableExists: boolean;
  mentorSkillsTableExists: boolean;
  bookingsFkTarget: 'experts' | 'mentors' | 'unknown';
  expertSkillsFkTarget: 'experts' | 'mentors' | 'unknown';
  migrationHealthy: boolean;
  expertCount: number;
  bookingCount: number;
};

export type MigrationResult = {
  health: MigrationHealth;
  repaired: boolean;
  actions: string[];
};

type FkRow = { table: string; from: string; to: string };

function tableExists(db: Database.Database, name: string): boolean {
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
    .get(name) as { name: string } | undefined;
  return !!row;
}

function tryExec(db: Database.Database, sql: string): void {
  try {
    db.exec(sql);
  } catch {
    /* already applied */
  }
}

function foreignKeyList(db: Database.Database, table: string): FkRow[] {
  return db.prepare(`PRAGMA foreign_key_list(${table})`).all() as FkRow[];
}

function fkTargetForColumn(
  db: Database.Database,
  table: string,
  column: string,
): 'experts' | 'mentors' | 'unknown' {
  const fk = foreignKeyList(db, table).find((row) => row.from === column);
  if (!fk) return 'unknown';
  if (fk.table === 'experts' || fk.table === 'mentors') return fk.table;
  return 'unknown';
}

function fkReferencesMentors(db: Database.Database, table: string, column: string): boolean {
  return fkTargetForColumn(db, table, column) === 'mentors';
}

export function getMigrationHealth(db: Database.Database): MigrationHealth {
  const bookingsFkTarget = tableExists(db, 'bookings')
    ? fkTargetForColumn(db, 'bookings', 'expert_id')
    : 'unknown';
  const expertSkillsFkTarget = tableExists(db, 'expert_skills')
    ? fkTargetForColumn(db, 'expert_skills', 'expert_id')
    : 'unknown';
  const mentorsTableExists = tableExists(db, 'mentors');
  const mentorSkillsTableExists = tableExists(db, 'mentor_skills');

  const expertCount = tableExists(db, 'experts')
    ? ((db.prepare('SELECT COUNT(*) AS n FROM experts').get() as { n: number }).n ?? 0)
    : 0;
  const bookingCount = tableExists(db, 'bookings')
    ? ((db.prepare('SELECT COUNT(*) AS n FROM bookings').get() as { n: number }).n ?? 0)
    : 0;

  const migrationHealthy =
    !mentorsTableExists &&
    !mentorSkillsTableExists &&
    bookingsFkTarget === 'experts' &&
    expertSkillsFkTarget === 'experts';

  return {
    mentorsTableExists,
    mentorSkillsTableExists,
    bookingsFkTarget,
    expertSkillsFkTarget,
    migrationHealthy,
    expertCount,
    bookingCount,
  };
}

function runLegacyRenames(db: Database.Database): void {
  if (tableExists(db, 'mentors')) {
    for (const sql of [
      'ALTER TABLE mentors ADD COLUMN google_calendar_id TEXT',
      'ALTER TABLE mentors ADD COLUMN cal_event_type_id INTEGER',
      'ALTER TABLE mentors ADD COLUMN mentor_share_percent INTEGER DEFAULT 20',
      'ALTER TABLE mentors ADD COLUMN spoken_languages TEXT',
      'ALTER TABLE mentors ADD COLUMN call_languages TEXT',
    ]) {
      tryExec(db, sql);
    }
  }

  if (tableExists(db, 'mentors') && !tableExists(db, 'experts')) {
    tryExec(db, 'ALTER TABLE mentors RENAME TO experts');
  }
  if (tableExists(db, 'mentor_skills') && !tableExists(db, 'expert_skills')) {
    tryExec(db, 'ALTER TABLE mentor_skills RENAME TO expert_skills');
  }
  tryExec(db, 'ALTER TABLE expert_skills RENAME COLUMN mentor_id TO expert_id');
  tryExec(db, 'ALTER TABLE bookings RENAME COLUMN mentor_id TO expert_id');
  tryExec(db, 'ALTER TABLE experts RENAME COLUMN mentor_share_percent TO expert_share_percent');
}

function applySchema(db: Database.Database): void {
  const schemaPath = path.join(process.cwd(), 'lib', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
}

function applyColumnMigrations(db: Database.Database): void {
  for (const sql of [
    'ALTER TABLE experts ADD COLUMN google_calendar_id TEXT',
    'ALTER TABLE experts ADD COLUMN cal_event_type_id INTEGER',
    'ALTER TABLE bookings ADD COLUMN slot_time TEXT',
    'ALTER TABLE bookings ADD COLUMN call_domain TEXT',
    'ALTER TABLE bookings ADD COLUMN call_context TEXT',
    'ALTER TABLE bookings ADD COLUMN calendar_event_url TEXT',
    'ALTER TABLE bookings ADD COLUMN cal_booking_uid TEXT',
    "ALTER TABLE skill_tags ADD COLUMN status TEXT NOT NULL DEFAULT 'approved'",
    'ALTER TABLE experts ADD COLUMN expert_share_percent INTEGER DEFAULT 20',
    'ALTER TABLE experts ADD COLUMN spoken_languages TEXT',
    'ALTER TABLE experts ADD COLUMN call_languages TEXT',
    'CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_tx_hash ON bookings(tx_hash) WHERE tx_hash IS NOT NULL',
  ]) {
    tryExec(db, sql);
  }
}

export function mergeLegacyMentorsIntoExperts(db: Database.Database): boolean {
  if (!tableExists(db, 'mentors') || !tableExists(db, 'experts')) return false;

  const shareCol = tableExists(db, 'mentors')
    ? (() => {
        const cols = db.prepare('PRAGMA table_info(mentors)').all() as { name: string }[];
        if (cols.some((c) => c.name === 'expert_share_percent')) return 'expert_share_percent';
        if (cols.some((c) => c.name === 'mentor_share_percent')) return 'mentor_share_percent';
        return null;
      })()
    : null;

  const shareExpr = shareCol ? `COALESCE(${shareCol}, 20)` : '20';

  const result = db
    .prepare(
      `INSERT OR IGNORE INTO experts (
         circles_address, name, bio, calendar_link, google_calendar_id,
         cal_event_type_id, price_crc, expert_share_percent,
         spoken_languages, call_languages, active, created_at
       )
       SELECT
         circles_address, name, bio, calendar_link, google_calendar_id,
         cal_event_type_id, price_crc, ${shareExpr},
         spoken_languages, call_languages, active, created_at
       FROM mentors
       WHERE circles_address NOT IN (SELECT circles_address FROM experts)`,
    )
    .run();

  return result.changes > 0;
}

export function repairBookingsForeignKey(db: Database.Database): boolean {
  if (!tableExists(db, 'bookings')) return false;
  if (!fkReferencesMentors(db, 'bookings', 'expert_id')) return false;

  db.exec(`
    CREATE TABLE bookings_new (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      expert_id           INTEGER NOT NULL REFERENCES experts(id),
      booker_address      TEXT    NOT NULL,
      tx_hash             TEXT,
      slot_time           TEXT,
      call_domain         TEXT,
      call_context        TEXT,
      calendar_event_url  TEXT,
      cal_booking_uid     TEXT,
      created_at          TEXT    DEFAULT (datetime('now'))
    );
    INSERT INTO bookings_new (
      id, expert_id, booker_address, tx_hash, slot_time, call_domain, call_context,
      calendar_event_url, cal_booking_uid, created_at
    )
    SELECT
      id, expert_id, booker_address, tx_hash, slot_time, call_domain, call_context,
      calendar_event_url, cal_booking_uid, created_at
    FROM bookings;
    DROP TABLE bookings;
    ALTER TABLE bookings_new RENAME TO bookings;
  `);
  return true;
}

export function repairExpertSkillsForeignKey(db: Database.Database): boolean {
  if (!tableExists(db, 'expert_skills')) return false;
  if (!fkReferencesMentors(db, 'expert_skills', 'expert_id')) return false;

  const idCol = (() => {
    const cols = db.prepare('PRAGMA table_info(expert_skills)').all() as { name: string }[];
    if (cols.some((c) => c.name === 'expert_id')) return 'expert_id';
    if (cols.some((c) => c.name === 'mentor_id')) return 'mentor_id';
    return 'expert_id';
  })();

  db.exec(`
    CREATE TABLE expert_skills_new (
      expert_id INTEGER NOT NULL REFERENCES experts(id) ON DELETE CASCADE,
      tag_id    INTEGER NOT NULL REFERENCES skill_tags(id) ON DELETE CASCADE,
      PRIMARY KEY (expert_id, tag_id)
    );
    INSERT OR IGNORE INTO expert_skills_new (expert_id, tag_id)
      SELECT ${idCol}, tag_id FROM expert_skills;
    DROP TABLE expert_skills;
    ALTER TABLE expert_skills_new RENAME TO expert_skills;
  `);
  return true;
}

export function dropLegacyMentorTables(db: Database.Database): boolean {
  let dropped = false;
  if (tableExists(db, 'mentor_skills')) {
    db.exec('DROP TABLE mentor_skills');
    dropped = true;
  }
  if (tableExists(db, 'mentors')) {
    db.exec('DROP TABLE mentors');
    dropped = true;
  }
  return dropped;
}

export function runDbMigrations(
  db: Database.Database,
  options: { dryRun?: boolean } = {},
): MigrationResult {
  const actions: string[] = [];
  const before = getMigrationHealth(db);

  if (options.dryRun) {
    if (before.mentorsTableExists) actions.push('would merge mentors → experts');
    if (before.bookingsFkTarget === 'mentors') actions.push('would rebuild bookings FK → experts');
    if (before.expertSkillsFkTarget === 'mentors') actions.push('would rebuild expert_skills FK → experts');
    if (before.mentorsTableExists || before.mentorSkillsTableExists) {
      actions.push('would drop legacy mentor tables');
    }
    if (actions.length === 0) actions.push('no repairs needed');
    return { health: before, repaired: false, actions };
  }

  runLegacyRenames(db);
  applySchema(db);
  applyColumnMigrations(db);

  if (mergeLegacyMentorsIntoExperts(db)) actions.push('merged mentors → experts');
  if (repairBookingsForeignKey(db)) actions.push('rebuilt bookings FK → experts');
  if (repairExpertSkillsForeignKey(db)) actions.push('rebuilt expert_skills FK → experts');
  if (dropLegacyMentorTables(db)) actions.push('dropped legacy mentor tables');

  db.pragma('foreign_keys = ON');

  const after = getMigrationHealth(db);
  return {
    health: after,
    repaired: actions.length > 0,
    actions: actions.length > 0 ? actions : ['schema up to date'],
  };
}
