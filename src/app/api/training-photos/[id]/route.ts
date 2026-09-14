import { NextResponse } from "next/server";
import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

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
    await prisma.trainingPhoto.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting training photo:", error);
    return NextResponse.json({ error: "Failed to delete training photo" }, { status: 500 });
  }
}

export async function PUT(
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
    const data = await request.json();

    const updated = await prisma.trainingPhoto.update({
      where: { id },
      data: {
        ...(data.titlePl !== undefined && { titlePl: data.titlePl }),
        ...(data.titleUa !== undefined && { titleUa: data.titleUa }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.featured !== undefined && { featured: Boolean(data.featured) }),
        ...(data.sortOrder !== undefined && { sortOrder: Number(data.sortOrder) }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating training photo:", error);
    return NextResponse.json({ error: "Failed to update training photo" }, { status: 500 });
  }
}
