import { initDatabase } from "@repo/database";

import { env } from "@/env";

export const db = initDatabase({
  dev: env.NODE_ENV === "development",
  logLevel:
    env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error", "warn"],
});
