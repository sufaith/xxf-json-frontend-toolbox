CREATE TABLE IF NOT EXISTS chat_rooms (
  room_slug TEXT PRIMARY KEY NOT NULL,
  owner_device_id TEXT NOT NULL,
  owner_token_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_rooms_owner_device
ON chat_rooms(owner_device_id);

PRAGMA optimize;
