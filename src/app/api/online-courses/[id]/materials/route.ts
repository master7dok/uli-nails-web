import { NextResponse } from "next/server";
import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isDatabaseAvailable())) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const { id: courseId } = await params;
    const data = await request.json();

    const lastMaterial = await prisma.onlineCourseMaterial.findFirst({
      where: { courseId },
      orderBy: { sortOrder: "desc" },
    });
    const nextSort = (lastMaterial?.sortOrder ?? -1) + 1;

    const material = await prisma.onlineCourseMaterial.create({
      data: {
        courseId,
        titleUa: data.titleUa || "Новий урок / матеріал",
        titlePl: data.titlePl || "Nowa lekcja / materiał",
        descriptionUa: data.descriptionUa || null,
        descriptionPl: data.descriptionPl || null,
        type: data.type || "video", // "video" | "pdf" | "presentation"
        fileUrl: data.fileUrl || null,
        videoEmbedUrl: data.videoEmbedUrl || null,
        sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : nextSort,
      },
    });

    return NextResponse.json(material, { status: 201 });
  } catch (error: any) {
    console.error("Error creating course material:", error);
    return NextResponse.json({ error: error?.message || "Failed to create material" }, { status: 500 });
  }
}
