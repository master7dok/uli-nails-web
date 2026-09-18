import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { defaultTrainingPhotos } from "@/lib/defaultData";

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
      where: { key: "training_photos_initialized" },
    });

    if (!isInit) {
      for (const photo of defaultTrainingPhotos) {
        await prisma.trainingPhoto.upsert({
          where: { id: photo.id || "" },
          create: {
            id: photo.id,
            imageUrl: photo.imageUrl,
            titlePl: photo.titlePl || "",
            titleUa: photo.titleUa || "",
            category: photo.category || "process",
            featured: photo.featured,
            sortOrder: photo.sortOrder,
          },
          update: {},
        });
      }
      await prisma.setting.upsert({
        where: { key: "training_photos_initialized" },
        create: { key: "training_photos_initialized", value: "true" },
        update: { value: "true" },
      });
    }

    const { items } = await request.json(); // [{ id: string, sortOrder: number }]

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await prisma.$transaction(
      items.map((item: { id: string; sortOrder: number }) =>
        prisma.trainingPhoto.update({
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
    console.error("Error reordering training photos:", error);
    return NextResponse.json(
      { error: "Failed to reorder training photos" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  return POST(request);
}
