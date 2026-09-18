import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { defaultTrainingPhotos } from "@/lib/defaultData";

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

    // Check if training_photos_initialized is set
    const isInit = await prisma.setting.findUnique({
      where: { key: "training_photos_initialized" },
    });

    if (!isInit) {
      // If not yet initialized, seed all default photos EXCEPT the one being deleted!
      for (const photo of defaultTrainingPhotos) {
        if (photo.id !== id) {
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
      }
      await prisma.setting.upsert({
        where: { key: "training_photos_initialized" },
        create: { key: "training_photos_initialized", value: "true" },
        update: { value: "true" },
      });
      return NextResponse.json({ success: true });
    }

    // If already initialized: check if the item exists in the DB before deleting
    const existing = await prisma.trainingPhoto.findUnique({
      where: { id },
    });

    if (existing) {
      await prisma.trainingPhoto.delete({
        where: { id },
      });
    } else {
      console.log(`Training photo ${id} was not found in DB or was already deleted.`);
    }

    try {
      revalidatePath("/");
      revalidatePath("/admin");
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting training photo:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete training photo" },
      { status: 500 }
    );
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

    const existing = await prisma.trainingPhoto.findUnique({
      where: { id },
    });

    let updated;
    if (existing) {
      updated = await prisma.trainingPhoto.update({
        where: { id },
        data: {
          ...(data.titlePl !== undefined && { titlePl: data.titlePl }),
          ...(data.titleUa !== undefined && { titleUa: data.titleUa }),
          ...(data.category !== undefined && { category: data.category }),
          ...(data.objectPosition !== undefined && { objectPosition: data.objectPosition }),
          ...(data.featured !== undefined && { featured: Boolean(data.featured) }),
          ...(data.sortOrder !== undefined && { sortOrder: Number(data.sortOrder) }),
        },
      });
    } else {
      const def = defaultTrainingPhotos.find((p) => p.id === id);
      if (def) {
        updated = await prisma.trainingPhoto.create({
          data: {
            id: def.id,
            imageUrl: def.imageUrl,
            titlePl: data.titlePl ?? def.titlePl ?? "",
            titleUa: data.titleUa ?? def.titleUa ?? "",
            category: data.category ?? def.category ?? "process",
            objectPosition: data.objectPosition ?? def.objectPosition ?? "center",
            featured: data.featured !== undefined ? Boolean(data.featured) : def.featured,
            sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : def.sortOrder,
          },
        });
      } else {
        return NextResponse.json({ error: "Photo not found" }, { status: 404 });
      }
    }

    try {
      revalidatePath("/");
      revalidatePath("/admin");
    } catch {}

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating training photo:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update training photo" },
      { status: 500 }
    );
  }
}
