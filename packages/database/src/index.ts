import { PrismaClient } from "@prisma/client";
export * from "@prisma/client";

type InitDatabaseOptions = {
  logLevel: ("query" | "error" | "warn")[];
  dev: boolean;
};

export const initDatabase = ({
  dev,
  logLevel
}: InitDatabaseOptions) => {
  const createPrismaClient = () =>
    new PrismaClient({
      log: logLevel,
    });
  
  const globalForPrisma = globalThis as unknown as {
    prisma: ReturnType<typeof createPrismaClient> | undefined;
  };
  
  const db = globalForPrisma.prisma ?? createPrismaClient();
  
  if (dev) globalForPrisma.prisma = db;

  return db;
}
