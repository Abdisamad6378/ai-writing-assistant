// server/db.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS drafts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      content_type TEXT NOT NULL DEFAULT 'blog',
      tone TEXT NOT NULL DEFAULT 'casual',
      topic TEXT NOT NULL DEFAULT '',
      provider TEXT,
      model TEXT,
      tokens_used INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

const insertDraft = async ({
  id,
  title,
  content,
  contentType,
  tone,
  topic,
  provider,
  model,
  tokensUsed,
}) => {
  const { rows } = await pool.query(
    `INSERT INTO drafts (id, title, content, content_type, tone, topic, provider, model, tokens_used)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [id, title, content, contentType, tone, topic, provider, model, tokensUsed]
  );
  return rows[0];
};

const getDrafts = async () => {
  const { rows } = await pool.query(
    'SELECT * FROM drafts ORDER BY updated_at DESC'
  );
  return rows;
};

const getDraftById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM drafts WHERE id = $1', [id]);
  return rows[0] || null;
};

const updateDraft = async (id, content) => {
  const { rows } = await pool.query(
    `UPDATE drafts SET content = $2, updated_at = now() WHERE id = $1 RETURNING *`,
    [id, content]
  );
  return rows[0] || null;
};

const deleteDraft = async (id) => {
  const { rowCount } = await pool.query('DELETE FROM drafts WHERE id = $1', [id]);
  return rowCount > 0;
};

module.exports = {
  pool,
  initDb,
  insertDraft,
  getDrafts,
  getDraftById,
  updateDraft,
  deleteDraft,
};