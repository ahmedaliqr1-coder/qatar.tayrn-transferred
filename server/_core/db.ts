import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../../drizzle/schema";
import { ENV } from "./env";

if (!ENV.databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const client = postgres(ENV.databaseUrl);
export const db = drizzle(client, { schema });
