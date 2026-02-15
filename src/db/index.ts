import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

export function createDB(connectionString: string) {
  const sql = neon(connectionString);
  return drizzle(sql);
}

export type DB = ReturnType<typeof createDB>;
