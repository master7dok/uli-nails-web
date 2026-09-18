import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { defaultPortfolio } from "@/lib/defaultData";

export async function POST(request: Request) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isDatabaseAvailable())) {
      return NextResponse.json(
        { error: "База даних тимчасово недоступна." },
        { status: 503 }
      );
    }

    // Ensure database is initialized with defaults if not already
    const isInit = await prisma.setting.findUnique({
      where: { key: "portfolio_initialized" },
    });

    if (!isInit) {
      for (const item of defaultPortfolio) {
        await prisma.portfolioItem.upsert({
          where: { id: item.id || "" },
          create: {
            id: item.id,
            imageUrl: item.imageUrl,
            titlePl: item.titlePl || "",
            titleUa: item.titleUa || "",
            category: item.category || "gel",
            featured: item.featured,
            sortOrder: item.sortOrder,
          },
          update: {},
        });
      }
      await prisma.setting.upsert({
        where: { key: "portfolio_initialized" },
        create: { key: "portfolio_initialized", value: "true" },
        update: { value: "true" },
      });
    }

    const { items } = await request.json(); // [{ id: string, sortOrder: number }]

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await prisma.$transaction(
      items.map((item: { id: string; sortOrder: number }) =>
        prisma.portfolioItem.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );

    try {
      revalidatePath("/");
      revalidatePath("/admin");
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering portfolio items:", error);
    return NextResponse.json(
      { error: "Failed to reorder portfolio items" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  return POST(request);
}
