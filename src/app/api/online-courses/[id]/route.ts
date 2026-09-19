import { NextResponse } from "next/server";
import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isDatabaseAvailable())) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const { id } = await params;
    const course = await prisma.onlineCourse.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        materials: { orderBy: { sortOrder: "asc" } },
        _count: { select: { students: true, materials: true } },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error: any) {
    console.error("Error fetching online course:", error);
    return NextResponse.json({ error: "Failed to fetch course" }, { status: 500 });
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
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const { id } = await params;
    const data = await request.json();

    const updated = await prisma.onlineCourse.update({
      where: { id },
      data: {
        ...(data.titleUa !== undefined && { titleUa: data.titleUa }),
        ...(data.titlePl !== undefined && { titlePl: data.titlePl }),
        ...(data.subtitleUa !== undefined && { subtitleUa: data.subtitleUa || null }),
        ...(data.subtitlePl !== undefined && { subtitlePl: data.subtitlePl || null }),
        ...(data.descriptionUa !== undefined && { descriptionUa: data.descriptionUa }),
        ...(data.descriptionPl !== undefined && { descriptionPl: data.descriptionPl }),
        ...(data.pricePln !== undefined && { pricePln: Number(data.pricePln) || 0 }),
        ...(data.priceMaxPln !== undefined && {
          priceMaxPln: data.priceMaxPln ? Number(data.priceMaxPln) : null,
        }),
        ...(data.coverUrl !== undefined && { coverUrl: data.coverUrl || null }),
        ...(data.badgeUa !== undefined && { badgeUa: data.badgeUa || null }),
        ...(data.badgePl !== undefined && { badgePl: data.badgePl || null }),
        ...(data.durationUa !== undefined && { durationUa: data.durationUa || null }),
        ...(data.durationPl !== undefined && { durationPl: data.durationPl || null }),
        ...(data.sortOrder !== undefined && { sortOrder: Number(data.sortOrder) || 0 }),
        ...(data.isActive !== undefined && { isActive: Boolean(data.isActive) }),
      },
      include: {
        materials: { orderBy: { sortOrder: "asc" } },
        _count: { select: { students: true, materials: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating online course:", error);
    return NextResponse.json({ error: error?.message || "Failed to update course" }, { status: 500 });
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

    if (!(await isDatabaseAvailable())) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const { id } = await params;
    await prisma.onlineCourse.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting online course:", error);
    return NextResponse.json({ error: error?.message || "Failed to delete course" }, { status: 500 });
  }
}
