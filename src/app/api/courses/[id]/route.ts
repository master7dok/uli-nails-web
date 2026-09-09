import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();

    const updated = await prisma.course.update({
      where: { id },
      data: {
        titlePl: data.titlePl,
        titleUa: data.titleUa,
        subtitlePl: data.subtitlePl,
        subtitleUa: data.subtitleUa,
        descriptionPl: data.descriptionPl,
        descriptionUa: data.descriptionUa,
        durationPl: data.durationPl,
        durationUa: data.durationUa,
        levelPl: data.levelPl,
        levelUa: data.levelUa,
        pricePln: Number(data.pricePln),
        badgePl: data.badgePl || null,
        badgeUa: data.badgeUa || null,
        bonusPl: data.bonusPl || null,
        bonusUa: data.bonusUa || null,
        featuresPl: typeof data.featuresPl === "string" ? data.featuresPl : JSON.stringify(data.featuresPl || []),
        featuresUa: typeof data.featuresUa === "string" ? data.featuresUa : JSON.stringify(data.featuresUa || []),
        syllabusPl: typeof data.syllabusPl === "string" ? data.syllabusPl : (data.syllabusPl ? JSON.stringify(data.syllabusPl) : null),
        syllabusUa: typeof data.syllabusUa === "string" ? data.syllabusUa : (data.syllabusUa ? JSON.stringify(data.syllabusUa) : null),
        formUrl: data.formUrl || null,
        sortOrder: Number(data.sortOrder) || 0,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.course.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 });
  }
}
