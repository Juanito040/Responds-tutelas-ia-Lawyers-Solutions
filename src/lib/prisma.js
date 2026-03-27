// Singleton de Prisma Client con driver adapter para Prisma 7 + Supabase
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis;

function createPrismaClient() {
  // Eliminar parámetros propietarios de Prisma antes de pasar a pg.Pool
  // (?pgbouncer=true es un hint para el motor binario de Prisma, no para pg)
  const rawUrl = process.env.DATABASE_URL || "";
  const url = new URL(rawUrl);
  url.searchParams.delete("pgbouncer");
  url.searchParams.delete("connection_limit");
  url.searchParams.delete("pool_timeout");

  const pool = new pg.Pool({
    connectionString: url.toString(),
    max: 10,
    // En producción validamos el certificado SSL; en desarrollo lo omitimos
    // porque Supabase pooler usa cert de AWS que en algunos entornos locales no resuelve
    ssl: process.env.NODE_ENV === "production"
      ? true
      : { rejectUnauthorized: false },
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
