import { NextResponse } from "next/server";
import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { defaultTrainingPhotos } from "@/lib/defaultData";

export async function GET() {
  try {
    if (await isDatabaseAvailable()) {
      // Check if training photos table has been initialized
      const isInit = await prisma.setting.findUnique({
        where: { key: "training_photos_initialized" },
      });

      if (!isInit) {
        // Automatically seed default training photos into PostgreSQL with their IDs
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

      const items = await prisma.trainingPhoto.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      });
      return NextResponse.json(items);
    }
    return NextResponse.json(defaultTrainingPhotos);
  } catch (error) {
    console.warn("Could not query training photos from database, using fallback:", error);
    return NextResponse.json(defaultTrainingPhotos);
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

    // Ensure initialized flag is set so we don't accidentally re-seed defaults later
    await prisma.setting.upsert({
      where: { key: "training_photos_initialized" },
      create: { key: "training_photos_initialized", value: "true" },
      update: { value: "true" },
    });

    const data = await request.json();
    if (!data.imageUrl) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 });
    }

    const item = await prisma.trainingPhoto.create({
      data: {
        imageUrl: data.imageUrl,
        titlePl: data.titlePl || "",
        titleUa: data.titleUa || "",
        category: data.category || "process",
        objectPosition: data.objectPosition || "center",
        featured: Boolean(data.featured),
        sortOrder: Number(data.sortOrder) || 0,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error adding training photo:", error);
    return NextResponse.json({ error: "Failed to add training photo" }, { status: 500 });
  }
}
