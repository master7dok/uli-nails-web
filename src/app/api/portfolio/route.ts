import { NextResponse } from "next/server";
import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

import { defaultPortfolio } from "@/lib/defaultData";

export async function GET() {
  try {
    if (await isDatabaseAvailable()) {
      const items = await prisma.portfolioItem.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      });
      if (items.length > 0) {
        return NextResponse.json(items);
      }
    }
    return NextResponse.json(defaultPortfolio);
  } catch (error) {
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
        { error: "База даних тимчасово недоступна. Будь ласка, перевірте PostgreSQL / Baza даних jest niedostępna." },
        { status: 503 }
      );
    }

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
