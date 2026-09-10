import { NextResponse } from "next/server";
import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

import { defaultCourses } from "@/lib/defaultData";

export async function GET() {
  try {
    if (await isDatabaseAvailable()) {
      const courses = await prisma.course.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      });
      if (courses.length > 0) {
        return NextResponse.json(courses);
      }
    }
    return NextResponse.json(defaultCourses);
  } catch (error) {
    return NextResponse.json(defaultCourses);
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

    const data = await request.json();
    const slug =
      data.slug ||
      (data.titlePl || data.titleUa || "course")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") + `-${Date.now()}`;

    const course = await prisma.course.create({
      data: {
        slug,
        titlePl: data.titlePl,
        titleUa: data.titleUa,
        subtitlePl: data.subtitlePl || "",
        subtitleUa: data.subtitleUa || "",
        descriptionPl: data.descriptionPl,
        descriptionUa: data.descriptionUa,
        durationPl: data.durationPl || "2 dni",
        durationUa: data.durationUa || "2 дні",
        levelPl: data.levelPl || "Dla każdego",
        levelUa: data.levelUa || "Для всіх",
        pricePln: Number(data.pricePln) || 0,
        badgePl: data.badgePl || null,
        badgeUa: data.badgeUa || null,
        bonusPl: data.bonusPl || null,
        bonusUa: data.bonusUa || null,
        featuresPl: typeof data.featuresPl === "string" ? data.featuresPl : JSON.stringify(data.featuresPl || []),
        featuresUa: typeof data.featuresUa === "string" ? data.featuresUa : JSON.stringify(data.featuresUa || []),
        syllabusPl: typeof data.syllabusPl === "string" ? data.syllabusPl : JSON.stringify(data.syllabusPl || []),
        syllabusUa: typeof data.syllabusUa === "string" ? data.syllabusUa : JSON.stringify(data.syllabusUa || []),
        formUrl: data.formUrl || null,
        sortOrder: Number(data.sortOrder) || 0,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}
