import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

import { defaultSettings } from "@/lib/defaultData";

export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
    const map: Record<string, string> = { ...defaultSettings };
    settings.forEach((s) => {
      map[s.key] = s.value;
    });
    return NextResponse.json(map);
  } catch (error) {
    console.warn("Database unavailable for settings, returning defaults:", error);
    return NextResponse.json(defaultSettings);
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json(); // { key: value, ... }

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === "string") {
        await prisma.setting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
