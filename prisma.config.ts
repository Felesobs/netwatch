import { defineConfig } from "prisma/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrate: {
    adapter(env: Record<string, string | undefined>) {
      const pool = new Pool({ connectionString: env["DATABASE_URL"] });
      return new PrismaPg(pool);
    },
  },
});	