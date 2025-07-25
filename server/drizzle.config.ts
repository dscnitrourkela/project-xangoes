import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config();

export default defineConfig({
    out: "./drizzle",
    schema: "./src/db/schema/index.ts",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL as string,
    },
});
