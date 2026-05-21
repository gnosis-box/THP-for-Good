CREATE TABLE IF NOT EXISTS skill_tags (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT    UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS mentors (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  circles_address    TEXT    UNIQUE NOT NULL,
  name               TEXT    NOT NULL,
  bio                TEXT,
  calendar_link      TEXT    NOT NULL,
  google_calendar_id TEXT,
  price_crc          INTEGER DEFAULT 100,
  active             INTEGER DEFAULT 1,
  created_at         TEXT    DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS mentor_skills (
  mentor_id INTEGER NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  tag_id    INTEGER NOT NULL REFERENCES skill_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (mentor_id, tag_id)
);

CREATE TABLE IF NOT EXISTS bookings (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  mentor_id           INTEGER NOT NULL REFERENCES mentors(id),
  booker_address      TEXT    NOT NULL,
  tx_hash             TEXT,
  slot_time           TEXT,
  calendar_event_url  TEXT,
  created_at          TEXT    DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admins (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  circles_address TEXT    UNIQUE NOT NULL,
  created_at      TEXT    DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS trust_attestations (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id    INTEGER NOT NULL REFERENCES bookings(id),
  trust_tx_hash TEXT,
  attested_at   TEXT    DEFAULT (datetime('now'))
);
