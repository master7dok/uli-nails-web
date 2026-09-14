import { NextResponse } from "next/server";
import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { defaultPortfolio } from "@/lib/defaultData";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const isInit = await prisma.setting.findUnique({
      where: { key: "portfolio_initialized" },
    });

    if (!isInit) {
      for (const item of defaultPortfolio) {
        if (item.id !== id) {
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
      }
      await prisma.setting.upsert({
        where: { key: "portfolio_initialized" },
        create: { key: "portfolio_initialized", value: "true" },
        update: { value: "true" },
      });
      return NextResponse.json({ success: true });
    }

    const existing = await prisma.portfolioItem.findUnique({
      where: { id },
    });

    if (existing) {
      await prisma.portfolioItem.delete({
        where: { id },
      });
    } else {
      console.log(`Portfolio item ${id} not found in DB or already deleted.`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting portfolio item:", error);
    return NextResponse.json({ error: error?.message || "Failed to delete portfolio item" }, { status: 500 });
  }
}
