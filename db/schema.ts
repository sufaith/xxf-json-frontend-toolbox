export const noteSpacesSchema = `
CREATE TABLE IF NOT EXISTS note_spaces (
  slug TEXT PRIMARY KEY NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`;
