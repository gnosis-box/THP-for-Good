import Database from 'better-sqlite3';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { getMigrationHealth, runDbMigrations } from '../lib/db-migrate';

function main() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'thp-legacy-'));
  const dbPath = path.join(tmpDir, 'thp.db');

  const db = new Database(dbPath);
  db.exec(`
    CREATE TABLE skill_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL DEFAULT 'approved'
    );
    CREATE TABLE mentors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      circles_address TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      bio TEXT,
      calendar_link TEXT NOT NULL,
      price_crc INTEGER DEFAULT 100,
      mentor_share_percent INTEGER DEFAULT 20,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE mentor_skills (
      mentor_id INTEGER NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
      tag_id INTEGER NOT NULL REFERENCES skill_tags(id) ON DELETE CASCADE,
      PRIMARY KEY (mentor_id, tag_id)
    );
    CREATE TABLE bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mentor_id INTEGER NOT NULL REFERENCES mentors(id),
      booker_address TEXT NOT NULL,
      tx_hash TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    INSERT INTO mentors (circles_address, name, calendar_link) VALUES ('0xaaa', 'Legacy1', '');
    INSERT INTO mentors (circles_address, name, calendar_link) VALUES ('0xbbb', 'Legacy2', '');
  `);

  const schema = fs.readFileSync(path.join(process.cwd(), 'lib', 'schema.sql'), 'utf-8');
  db.exec(schema);
  try {
    db.exec('ALTER TABLE bookings RENAME COLUMN mentor_id TO expert_id');
  } catch {
    /* already renamed */
  }

  for (let i = 3; i <= 12; i++) {
    db.prepare(
      'INSERT INTO experts (circles_address, name, calendar_link) VALUES (?, ?, ?)',
    ).run(`0x${i.toString(16)}`, `Expert${i}`, '');
  }

  const expertId = (
    db.prepare('SELECT id FROM experts WHERE circles_address = ?').get('0xc') as { id: number }
  ).id;

  const before = getMigrationHealth(db);
  if (before.bookingsFkTarget !== 'mentors') {
    console.error('simulate-legacy-db: expected bookings expert_id FK to mentors before repair, got', before);
    process.exit(1);
  }

  db.pragma('foreign_keys = ON');
  let fkFailed = false;
  try {
    db.prepare('INSERT INTO bookings (expert_id, booker_address) VALUES (?, ?)').run(
      expertId,
      '0xbooker',
    );
  } catch {
    fkFailed = true;
  }
  if (!fkFailed) {
    console.error('simulate-legacy-db: expected FK failure before repair for expert', expertId);
    process.exit(1);
  }

  const repair = runDbMigrations(db);
  if (!repair.health.migrationHealthy) {
    console.error('simulate-legacy-db: migration unhealthy after repair', repair.health);
    process.exit(1);
  }

  db.prepare('INSERT INTO bookings (expert_id, booker_address) VALUES (?, ?)').run(
    expertId,
    '0xbooker',
  );

  console.log('[simulate-legacy-db] OK — expert', expertId, 'bookable after repair');
  db.close();
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

main();
