import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { getMigrationHealth, runDbMigrations } from '../lib/db-migrate';

function parseArgs(argv: string[]) {
  const dryRun = argv.includes('--dry-run');
  const dbPathIdx = argv.indexOf('--db-path');
  const dbPath =
    dbPathIdx >= 0 && argv[dbPathIdx + 1]
      ? argv[dbPathIdx + 1]
      : path.join(process.cwd(), 'data', 'thp.db');
  return { dryRun, dbPath };
}

function main() {
  const { dryRun, dbPath } = parseArgs(process.argv.slice(2));

  if (dbPath !== ':memory:') {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }

  const db = new Database(dbPath);
  if (dbPath !== ':memory:') {
    db.pragma('journal_mode = WAL');
  }
  db.pragma('busy_timeout = 5000');

  const before = getMigrationHealth(db);
  console.log('[repair-db-fk] before:', before);

  const result = runDbMigrations(db, { dryRun });
  console.log('[repair-db-fk] actions:', result.actions);
  console.log('[repair-db-fk] after:', result.health);

  db.close();

  if (!result.health.migrationHealthy && !dryRun) {
    console.error('[repair-db-fk] migration still unhealthy after repair');
    process.exit(2);
  }
  if (dryRun && !before.migrationHealthy) {
    process.exit(1);
  }
  if (!dryRun && result.repaired) {
    process.exit(1);
  }
  process.exit(0);
}

main();
