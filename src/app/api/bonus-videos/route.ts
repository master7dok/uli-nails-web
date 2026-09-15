import { NextResponse } from "next/server";
import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { defaultBonusVideos } from "@/lib/defaultData";

export async function GET() {
  try {
    if (await isDatabaseAvailable()) {
      const items = await prisma.bonusVideo.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      });
      return NextResponse.json(items);
    }
    return NextResponse.json(defaultBonusVideos);
  } catch (error) {
    console.warn("Could not query bonus videos from database, using fallback:", error);
    return NextResponse.json(defaultBonusVideos);
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isDatabaseAvailable())) {
      return NextResponse.json(
        { error: "База даних тимчасово недоступна. Будь ласка, перевірте PostgreSQL." },
        { status: 503 }
      );
    }

    const data = await request.json();

    if (!data.titleUa || !data.titlePl) {
      return NextResponse.json({ error: "Назва відео обов'язкова для обох мов (UA та PL)" }, { status: 400 });
    }

    if (!data.videoUrlUa && !data.videoUrlPl) {
      return NextResponse.json({ error: "Вкажіть посилання або завантажте відео хоча б для однієї мови" }, { status: 400 });
    }

    const count = await prisma.bonusVideo.count();

    const item = await prisma.bonusVideo.create({
      data: {
        videoUrlUa: data.videoUrlUa?.trim() || null,
        videoUrlPl: data.videoUrlPl?.trim() || null,
        titleUa: data.titleUa.trim(),
        titlePl: data.titlePl.trim(),
        descriptionUa: data.descriptionUa?.trim() || "",
        descriptionPl: data.descriptionPl?.trim() || "",
        badgeUa: data.badgeUa?.trim() || "Безкоштовний відеоурок",
        badgePl: data.badgePl?.trim() || "Darmowa lekcja wideo",
        buttonTextUa: data.buttonTextUa?.trim() || "Дивитися відео",
        buttonTextPl: data.buttonTextPl?.trim() || "Oglądaj wideo",
        coverUrl: data.coverUrl?.trim() || null,
        duration: data.duration?.trim() || null,
        viewsCount: 0,
        sortOrder: typeof data.sortOrder === "number" ? data.sortOrder : count + 1,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    console.error("Error creating bonus video:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create bonus video" },
      { status: 500 }
    );
  }
}
