import { MongoClient, type Collection } from "mongodb";
import { getEnv } from "./env";
import type { LoafRecord } from "./types";

let client: MongoClient | null = null;

async function collection(): Promise<Collection<LoafRecord> | null> {
  const env = getEnv();
  if (!env.MONGODB_URI) return null;
  if (!client) {
    client = new MongoClient(env.MONGODB_URI);
    await client.connect();
  }
  return client.db(env.MONGODB_DB).collection<LoafRecord>("loafs");
}

export async function saveLoaf(record: LoafRecord): Promise<string> {
  const col = await collection();
  if (!col) return `local-${Date.now()}`;
  const r = await col.insertOne(record);
  return String(r.insertedId);
}

export async function listLoafs(limit = 15): Promise<LoafRecord[]> {
  const col = await collection();
  if (!col) return [];
  return col.find({}).sort({ createdAt: -1 }).limit(limit).toArray();
}
