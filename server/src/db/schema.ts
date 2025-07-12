import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { env } from "../config/env";
import * as schema from "./schema/index";

let pool = new Pool({
    connectionString: env.DATABASE_URL,
});

export let db = drizzle(pool, { schema });

export const resetDbConnection = async () => {
    await pool.end();
    pool = new Pool({ connectionString: env.DATABASE_URL });
    db = drizzle(pool, { schema });
};
