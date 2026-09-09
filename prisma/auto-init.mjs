import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";

async function autoInit() {
  const dbUrl = process.env.DATABASE_URL || "";
  console.log("[auto-init] Checking database configuration...");

  if (!dbUrl || (!dbUrl.startsWith("postgres://") && !dbUrl.startsWith("postgresql://"))) {
    console.log("[auto-init] DATABASE_URL is not configured for PostgreSQL, skipping auto-init.");
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
