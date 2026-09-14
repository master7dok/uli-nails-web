import { NextResponse } from "next/server";
import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

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

    const { items } = await request.json(); // [{ id: string, sortOrder: number }]

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await prisma.$transaction(
      items.map((item: { id: string; sortOrder: number }) =>
        prisma.leadMagnet.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering lead magnets:", error);
    return NextResponse.json(
      { error: "Failed to reorder lead magnets" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  return POST(request);
}
