import { Pool, type PoolConfig } from "pg";
import { getEnv } from "./env";

let pool: Pool | null = null;

function poolConfig(): PoolConfig | null {
  const raw = getEnv().TIGER_DATABASE_URL;
  if (!raw) return null;

  // pg v8 treats sslmode=require like verify-full; strip it and set ssl explicitly.
  const parsed = new URL(raw);
  parsed.searchParams.delete("sslmode");
  const connectionString = parsed.toString();

  const rejectUnauthorized = process.env.TIGER_SSL_REJECT_UNAUTHORIZED === "true";
  return {
    connectionString,
    ssl: { rejectUnauthorized },
  };
}

function getPool(): Pool | null {
  const config = poolConfig();
  if (!config) return null;
  if (!pool) pool = new Pool(config);
  return pool;
}

export async function ensureSchema(): Promise<void> {
  const p = getPool();
  if (!p) return;
  await p.query(`CREATE EXTENSION IF NOT EXISTS vector`);
  await p.query(`
    CREATE TABLE IF NOT EXISTS loaf_echoes (
      memo_id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      embedding vector(32)
    )
  `);
}

function embed(text: string): number[] {
  const v = new Array(32).fill(0);
  const t = text.toLowerCase();
  for (let i = 0; i < t.length; i++) v[i % 32] += t.charCodeAt(i) / 255;
  const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
  return v.map((x) => x / norm);
}

export async function storeEcho(memoId: string, content: string): Promise<boolean> {
  try {
    const p = getPool();
    if (!p) return false;
    await ensureSchema();
    const e = embed(content);
    await p.query(
      `INSERT INTO loaf_echoes (memo_id, content, embedding) VALUES ($1, $2, $3::vector)
       ON CONFLICT (memo_id) DO UPDATE SET content = $2, embedding = $3::vector`,
      [memoId, content, `[${e.join(",")}]`],
    );
    return true;
  } catch (err) {
    console.warn("[tiger] storeEcho failed:", err instanceof Error ? err.message : err);
    return false;
  }
}

export async function findSimilar(content: string, limit = 2): Promise<string[]> {
  try {
    const p = getPool();
    if (!p) return [];
    await ensureSchema();
    const e = embed(content);
    const { rows } = await p.query<{ content: string }>(
      `SELECT content FROM loaf_echoes ORDER BY embedding <-> $1::vector LIMIT $2`,
      [`[${e.join(",")}]`, limit],
    );
    return rows.map((r) => r.content).filter((c) => c !== content);
  } catch (err) {
    console.warn("[tiger] findSimilar failed:", err instanceof Error ? err.message : err);
    return [];
  }
}
