import { PrismaClient } from "@prisma/client";
import net from "net";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // Keep internal Prisma logging clean; errors are handled gracefully via try/catch in handlers
    log: [],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

let lastStatus: { online: boolean; timestamp: number } | null = null;
const CHECK_CACHE_MS = 10000; // Cache connection state for 10 seconds

/**
 * Fast non-blocking check to verify if the configured PostgreSQL host is reachable.
 * Resolves within ~15ms on local connection refused or 400ms timeout, preventing
 * multi-second request freezes and noisy stderr logs when PostgreSQL is offline.
 */
export async function isDatabaseAvailable(): Promise<boolean> {
  const now = Date.now();
  if (lastStatus && now - lastStatus.timestamp < CHECK_CACHE_MS) {
    return lastStatus.online;
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || (!dbUrl.startsWith("postgres://") && !dbUrl.startsWith("postgresql://"))) {
    lastStatus = { online: false, timestamp: now };
    return false;
  }

  try {
    // Convert protocol to http for robust standard URL parsing
    const url = new URL(
      dbUrl.replace(/^postgresql:\/\//, "http://").replace(/^postgres:\/\//, "http://")
    );
    const host = url.hostname || "localhost";
    const port = parseInt(url.port || "5432", 10);

    const isOnline = await new Promise<boolean>((resolve) => {
      const socket = new net.Socket();
      let settled = false;

      const finish = (online: boolean) => {
        if (settled) return;
        settled = true;
        socket.destroy();
        resolve(online);
      };

      socket.setTimeout(400);
      socket.once("connect", () => finish(true));
      socket.once("timeout", () => finish(false));
      socket.once("error", () => finish(false));

      socket.connect(port, host);
    });

    lastStatus = { online: isOnline, timestamp: now };
    return isOnline;
  } catch {
    lastStatus = { online: false, timestamp: now };
    return false;
  }
}
