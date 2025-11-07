import type { PrismaClientOptions } from "@prisma/client/runtime/library";
import type { MaybeUndefined } from "typyx";
import { env } from "@rccyx/env";
import { PrismaClient as FullPrismaClient } from "./raw";
import { PrismaPg } from "@prisma/adapter-pg";

export type DatabaseClient = Omit<
  FullPrismaClient,
  | "$connect"
  | "$on"
  | "$use"
  | "$extends"
  | "$executeRaw"
  | "$executeRawUnsafe"
  | "$queryRaw"
  | "$queryRawUnsafe"
>;

const globalForDb = globalThis as unknown as {
  prisma: MaybeUndefined<DatabaseClient>;
};

const errorFormat: PrismaClientOptions["errorFormat"] = "pretty";
const log: PrismaClientOptions["log"] =
  env.NEXT_PUBLIC_CURRENT_ENV === "development"
    ? ["query", "info", "warn", "error"]
    : ["error"];

const transactionOptions = {
  maxWait: 10_000,
  timeout: 30_000,
  isolationLevel: "ReadCommitted",
} as const;

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

const db =
  globalForDb.prisma ??
  (new FullPrismaClient({
    errorFormat,
    adapter,
    log,
    transactionOptions,
  }) satisfies DatabaseClient);

// hot reloads when next refreshes
if (env.NODE_ENV === "development") globalForDb.prisma = db;

export { db };
