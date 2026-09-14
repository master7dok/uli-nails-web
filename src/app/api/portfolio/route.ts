import { NextResponse } from "next/server";
import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { defaultPortfolio } from "@/lib/defaultData";

export async function GET() {
  try {
    if (await isDatabaseAvailable()) {
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

      const items = await prisma.portfolioItem.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      });
      return NextResponse.json(items);
    }
    return NextResponse.json(defaultPortfolio);
  } catch (error) {
    console.warn("Could not query portfolio from database, using fallback:", error);
    return NextResponse.json(defaultPortfolio);
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isDatabaseAvailable())) {
      return NextResponse.json(
        { error: "База даних тимчасово недоступна. Будь ласка, перевірте PostgreSQL / Baza danych jest niedostępna." },
        { status: 503 }
      );
    }

    await prisma.setting.upsert({
      where: { key: "portfolio_initialized" },
      create: { key: "portfolio_initialized", value: "true" },
      update: { value: "true" },
    });

    const data = await request.json();
    if (!data.imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    }

    const item = await prisma.portfolioItem.create({
      data: {
        imageUrl: data.imageUrl,
        titlePl: data.titlePl || "",
        titleUa: data.titleUa || "",
        category: data.category || "gel",
        featured: Boolean(data.featured),
        sortOrder: Number(data.sortOrder) || 0,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error adding portfolio item:", error);
    return NextResponse.json({ error: "Failed to add portfolio item" }, { status: 500 });
  }
}
