import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";
import net from "net";

async function isPortOpen(dbUrl) {
  try {
    const url = new URL(
      dbUrl.replace(/^postgresql:\/\//, "http://").replace(/^postgres:\/\//, "http://")
    );
    const host = url.hostname || "localhost";
    const port = parseInt(url.port || "5432", 10);
    return await new Promise((resolve) => {
      const socket = new net.Socket();
      let settled = false;
      const finish = (open) => {
        if (settled) return;
        settled = true;
        socket.destroy();
        resolve(open);
      };
      socket.setTimeout(500);
      socket.once("connect", () => finish(true));
      socket.once("timeout", () => finish(false));
      socket.once("error", () => finish(false));
      socket.connect(port, host);
    });
  } catch {
    return false;
  }
}

async function autoInit() {
  const dbUrl = process.env.DATABASE_URL || "";
  console.log("[auto-init] Checking database configuration...");

  if (!dbUrl || (!dbUrl.startsWith("postgres://") && !dbUrl.startsWith("postgresql://"))) {
    console.log("[auto-init] DATABASE_URL is not configured for PostgreSQL, skipping auto-init.");
    return;
  }

  const online = await isPortOpen(dbUrl);
  if (!online) {
    console.log("[auto-init] Database host is currently offline. Starting server immediately with fallback data.");
    return;
  }

  console.log("[auto-init] PostgreSQL detected. Ensuring tables are created with prisma db push...");
  try {
    execSync("npx prisma db push --skip-generate", { stdio: "inherit" });
    console.log("[auto-init] Database schema pushed successfully.");
  } catch (err) {
    console.warn("[auto-init] Warning: prisma db push encountered an issue:", err.message);
  }

  const prisma = new PrismaClient();
  try {
    const courseCount = await prisma.course.count();
    console.log(`[auto-init] Current course count: ${courseCount}`);

    if (courseCount === 0) {
      console.log("[auto-init] Database is empty. Seeding initial courses, services, portfolio, and settings...");
      execSync("node prisma/seed.mjs", { stdio: "inherit" });
      console.log("[auto-init] Seeding complete!");
    } else {
      console.log("[auto-init] Database already contains courses. Preserving existing data.");
      // Migrate legacy categories if present
      await prisma.service.updateMany({
        where: { category: { in: ["gel", "extension"] } },
        data: { category: "manicure" },
      });
      await prisma.service.updateMany({
        where: { category: "care" },
        data: { category: "additional" },
      });
    }
  } catch (err) {
    console.warn("[auto-init] Warning during database check/seeding:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

autoInit().catch((err) => {
  console.warn("[auto-init] Non-fatal auto-init error:", err);
});
