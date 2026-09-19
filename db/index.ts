import "server-only";

import { drizzle } from "drizzle-orm/neon-http";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error("缺少 DATABASE_URL");
}

export const db = drizzle(databaseUrl);