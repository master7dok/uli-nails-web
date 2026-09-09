import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { defaultCourses } from "@/lib/defaultData";

export async function POST(request: Request) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const createdCourses = [];
    for (const c of defaultCourses) {
      // Upsert by slug so we don't duplicate if already existing
      const course = await prisma.course.upsert({
        where: { slug: c.slug },
        update: {
          titlePl: c.titlePl,
          titleUa: c.titleUa,
          subtitlePl: c.subtitlePl,
          subtitleUa: c.subtitleUa,
          descriptionPl: c.descriptionPl,
          descriptionUa: c.descriptionUa,
          durationPl: c.durationPl,
          durationUa: c.durationUa,
          levelPl: c.levelPl,
          levelUa: c.levelUa,
          pricePln: c.pricePln,
          badgePl: c.badgePl,
          badgeUa: c.badgeUa,
          bonusPl: c.bonusPl,
          bonusUa: c.bonusUa,
          featuresPl: c.featuresPl,
          featuresUa: c.featuresUa,
          syllabusPl: c.syllabusPl,
          syllabusUa: c.syllabusUa,
          sortOrder: c.sortOrder,
          isActive: c.isActive,
        },
        create: {
          slug: c.slug,
          titlePl: c.titlePl,
          titleUa: c.titleUa,
          subtitlePl: c.subtitlePl,
          subtitleUa: c.subtitleUa,
          descriptionPl: c.descriptionPl,
          descriptionUa: c.descriptionUa,
          durationPl: c.durationPl,
          durationUa: c.durationUa,
          levelPl: c.levelPl,
          levelUa: c.levelUa,
          pricePln: c.pricePln,
          badgePl: c.badgePl,
          badgeUa: c.badgeUa,
          bonusPl: c.bonusPl,
          bonusUa: c.bonusUa,
          featuresPl: c.featuresPl,
          featuresUa: c.featuresUa,
          syllabusPl: c.syllabusPl,
          syllabusUa: c.syllabusUa,
          sortOrder: c.sortOrder,
          isActive: c.isActive,
        },
      });
      createdCourses.push(course);
    }

    return NextResponse.json({ success: true, count: createdCourses.length });
  } catch (error) {
    console.error("Error seeding courses:", error);
    return NextResponse.json({ error: "Failed to seed courses" }, { status: 500 });
  }
}
