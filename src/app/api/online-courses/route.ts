import { NextResponse } from "next/server";
import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    if (!(await isDatabaseAvailable())) {
      return NextResponse.json([]);
    }

    const isAdmin = await isAuthenticated(request);

    // If not admin, check if section is visible
    if (!isAdmin) {
      const visibilitySetting = await prisma.setting.findUnique({
        where: { key: "show_online_courses" },
      });
      if (visibilitySetting?.value !== "true") {
        return NextResponse.json({ courses: [], visible: false });
      }
    }

    const courses = await prisma.onlineCourse.findMany({
      where: isAdmin ? {} : { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        materials: {
          orderBy: { sortOrder: "asc" },
        },
        _count: {
          select: { students: true, materials: true },
        },
      },
    });

    const visibilitySetting = await prisma.setting.findUnique({
      where: { key: "show_online_courses" },
    });

    return NextResponse.json({
      courses,
      visible: visibilitySetting?.value === "true",
    });
  } catch (error: any) {
    console.error("Error fetching online courses:", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isDatabaseAvailable())) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const data = await request.json();

    const titleBase = data.titleUa || data.titlePl || "online-course";
    const slug =
      data.slug?.trim() ||
      titleBase
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") + `-${Date.now()}`;

    const course = await prisma.onlineCourse.create({
      data: {
        slug,
        titleUa: data.titleUa || "Новий онлайн-курс",
        titlePl: data.titlePl || "Nowy kurs online",
        subtitleUa: data.subtitleUa || null,
        subtitlePl: data.subtitlePl || null,
        descriptionUa: data.descriptionUa || "",
        descriptionPl: data.descriptionPl || "",
        pricePln: Number(data.pricePln) || 0,
        priceMaxPln: data.priceMaxPln ? Number(data.priceMaxPln) : null,
        coverUrl: data.coverUrl || null,
        badgeUa: data.badgeUa || null,
        badgePl: data.badgePl || null,
        durationUa: data.durationUa || null,
        durationPl: data.durationPl || null,
        sortOrder: Number(data.sortOrder) || 0,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      },
      include: {
        materials: true,
        _count: {
          select: { students: true, materials: true },
        },
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error: any) {
    console.error("Error creating online course:", error);
    return NextResponse.json({ error: error?.message || "Failed to create course" }, { status: 500 });
  }
}
