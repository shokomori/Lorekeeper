CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  username      TEXT,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  google_id     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS users_username_lower_idx ON users (lower(username)) WHERE username IS NOT NULL;

CREATE TABLE IF NOT EXISTS campaigns (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS npcs (
  id          SERIAL PRIMARY KEY,
  campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  role        TEXT NOT NULL DEFAULT '',
  notes       TEXT NOT NULL DEFAULT '',
  image_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS locations (
  id          SERIAL PRIMARY KEY,
  campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  notes       TEXT NOT NULL DEFAULT '',
  image_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  id          SERIAL PRIMARY KEY,
  campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  date        DATE NOT NULL,
  recap       TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS session_npcs (
  session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  npc_id     INTEGER NOT NULL REFERENCES npcs(id) ON DELETE CASCADE,
  PRIMARY KEY (session_id, npc_id)
);

CREATE TABLE IF NOT EXISTS session_locations (
  session_id  INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  location_id INTEGER NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  PRIMARY KEY (session_id, location_id)
);

CREATE INDEX IF NOT EXISTS campaigns_user_idx ON campaigns (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS npcs_campaign_idx ON npcs (campaign_id, created_at DESC);
CREATE INDEX IF NOT EXISTS locations_campaign_idx ON locations (campaign_id, created_at DESC);
CREATE INDEX IF NOT EXISTS sessions_campaign_idx ON sessions (campaign_id, date DESC);
