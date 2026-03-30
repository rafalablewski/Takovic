import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

/** Non-empty URL required by `neon()` at import time; `next build` often has no env yet. */
const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://build:build@127.0.0.1:5432/build";

const sql = neon(connectionString);

export const db = drizzle(sql, { schema });

export type Database = typeof db;
