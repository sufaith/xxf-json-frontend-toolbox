CREATE TABLE IF NOT EXISTS chat_profiles (
  device_id TEXT PRIMARY KEY NOT NULL,
  nickname TEXT NOT NULL,
  avatar_seed TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_slug TEXT NOT NULL,
  device_id TEXT NOT NULL,
  nickname TEXT NOT NULL,
  avatar_seed TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('text', 'image', 'video')),
  content TEXT NOT NULL DEFAULT '',
  media_key TEXT,
  media_type TEXT,
  media_name TEXT,
  media_size INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_uploads (
  media_key TEXT PRIMARY KEY NOT NULL,
  room_slug TEXT NOT NULL,
  device_id TEXT NOT NULL,
  media_type TEXT NOT NULL,
  media_name TEXT NOT NULL,
  media_size INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id
ON chat_messages(room_slug, id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_device_created
ON chat_messages(device_id, created_at);

CREATE INDEX IF NOT EXISTS idx_chat_uploads_device_created
ON chat_uploads(device_id, created_at);

PRAGMA optimize;
