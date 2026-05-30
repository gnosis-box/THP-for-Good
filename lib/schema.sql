CREATE TABLE IF NOT EXISTS skill_tags (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  label  TEXT    UNIQUE NOT NULL,
  status TEXT    NOT NULL DEFAULT 'approved'
);

CREATE TABLE IF NOT EXISTS experts (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  circles_address      TEXT    UNIQUE NOT NULL,
  name                 TEXT    NOT NULL,
  bio                  TEXT,
  calendar_link        TEXT    NOT NULL,
  google_calendar_id   TEXT,
  cal_event_type_id    INTEGER,
  price_crc            INTEGER DEFAULT 100,
  expert_share_percent INTEGER DEFAULT 20,
  spoken_languages     TEXT,
  call_languages       TEXT,
  active               INTEGER DEFAULT 1,
  created_at           TEXT    DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS expert_skills (
  expert_id INTEGER NOT NULL REFERENCES experts(id) ON DELETE CASCADE,
  tag_id    INTEGER NOT NULL REFERENCES skill_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (expert_id, tag_id)
);

CREATE TABLE IF NOT EXISTS bookings (
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

CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_tx_hash ON bookings(tx_hash) WHERE tx_hash IS NOT NULL;

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

CREATE TABLE IF NOT EXISTS invitation_links (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  url         TEXT    UNIQUE NOT NULL,
  status      TEXT    NOT NULL DEFAULT 'available',
  added_by    TEXT    NOT NULL,
  created_at  TEXT    DEFAULT (datetime('now')),
  consumed_at TEXT,
  consumed_by TEXT,
  CHECK (status IN ('available', 'used', 'invalid'))
);

CREATE INDEX IF NOT EXISTS idx_invitation_links_status_created
  ON invitation_links(status, created_at, id);
