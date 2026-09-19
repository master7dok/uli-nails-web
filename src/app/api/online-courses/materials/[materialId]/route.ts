import { NextResponse } from "next/server";
import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ materialId: string }> }
) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isDatabaseAvailable())) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const { materialId } = await params;
    const data = await request.json();

    const updated = await prisma.onlineCourseMaterial.update({
      where: { id: materialId },
      data: {
        ...(data.titleUa !== undefined && { titleUa: data.titleUa }),
        ...(data.titlePl !== undefined && { titlePl: data.titlePl }),
        ...(data.descriptionUa !== undefined && { descriptionUa: data.descriptionUa || null }),
        ...(data.descriptionPl !== undefined && { descriptionPl: data.descriptionPl || null }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.fileUrl !== undefined && { fileUrl: data.fileUrl || null }),
        ...(data.videoEmbedUrl !== undefined && { videoEmbedUrl: data.videoEmbedUrl || null }),
        ...(data.sortOrder !== undefined && { sortOrder: Number(data.sortOrder) || 0 }),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating material:", error);
    return NextResponse.json({ error: error?.message || "Failed to update material" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ materialId: string }> }
) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isDatabaseAvailable())) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const { materialId } = await params;
    await prisma.onlineCourseMaterial.delete({ where: { id: materialId } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting material:", error);
    return NextResponse.json({ error: error?.message || "Failed to delete material" }, { status: 500 });
  }
}
