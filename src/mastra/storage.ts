import path from "node:path";
import type { MastraCompositeStore } from "@mastra/core/storage";
import { LibSQLStore } from "@mastra/libsql";
import { PostgresStore } from "@mastra/pg";
import { getEnv } from "../lib/env";

function tigerPostgresConfig(): {
  connectionString: string;
  ssl: { rejectUnauthorized: boolean };
} | null {
  const raw = getEnv().TIGER_DATABASE_URL;
  if (!raw) return null;

  const parsed = new URL(raw);
  parsed.searchParams.delete("sslmode");
  return {
    connectionString: parsed.toString(),
    ssl: {
      rejectUnauthorized: process.env.TIGER_SSL_REJECT_UNAUTHORIZED === "true",
    },
  };
}

let storage: MastraCompositeStore | null = null;

/** Persistent Mastra storage: Tiger Postgres when configured, else local LibSQL file. */
export function getMastraStorage(): MastraCompositeStore {
  if (storage) return storage;

  const pg = tigerPostgresConfig();
  if (pg) {
    storage = new PostgresStore({
      id: "loafline-mastra",
      connectionString: pg.connectionString,
      ssl: pg.ssl,
      schemaName: "mastra",
    });
    return storage;
  }

  const dbPath = path.join(process.cwd(), ".mastra", "loafline.db");
  storage = new LibSQLStore({
    id: "loafline-mastra",
    url: `file:${dbPath}`,
  });
  return storage;
}
