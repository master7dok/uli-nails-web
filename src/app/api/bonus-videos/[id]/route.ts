import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (await isDatabaseAvailable()) {
      const item = await prisma.bonusVideo.findUnique({
        where: { id },
      });
      if (!item) {
        return NextResponse.json({ error: "Video not found" }, { status: 404 });
      }
      return NextResponse.json(item);
    }
    return NextResponse.json({ error: "Database offline" }, { status: 503 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch video" }, { status: 500 });
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
      return NextResponse.json(
        { error: "База даних тимчасово недоступна. Будь ласка, перевірте PostgreSQL." },
        { status: 503 }
      );
    }

    const { id } = await params;

    const existing = await prisma.bonusVideo.findUnique({
      where: { id },
    });

    if (existing) {
      // Clean up uploaded files if in /uploads/
      for (const url of [existing.videoUrlUa, existing.videoUrlPl, existing.coverUrl]) {
        if (url && url.startsWith("/uploads/")) {
          try {
            const filePath = path.join(process.cwd(), "public", url);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          } catch (fileErr) {
            console.warn("Could not remove video file from uploads:", fileErr);
          }
        }
      }

      await prisma.bonusVideo.delete({
        where: { id },
      });
    }

    try {
      revalidatePath("/");
      revalidatePath("/admin");
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting bonus video:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete bonus video" },
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
        { error: "База даних тимчасово недоступна. Будь ласка, перевірте PostgreSQL." },
        { status: 503 }
      );
    }

    const { id } = await params;
    const data = await request.json();

    const existing = await prisma.bonusVideo.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const updated = await prisma.bonusVideo.update({
      where: { id },
      data: {
        videoUrlUa: data.videoUrlUa !== undefined ? (data.videoUrlUa ? data.videoUrlUa.trim() : null) : existing.videoUrlUa,
        videoUrlPl: data.videoUrlPl !== undefined ? (data.videoUrlPl ? data.videoUrlPl.trim() : null) : existing.videoUrlPl,
        titleUa: data.titleUa !== undefined ? data.titleUa.trim() : existing.titleUa,
        titlePl: data.titlePl !== undefined ? data.titlePl.trim() : existing.titlePl,
        descriptionUa: data.descriptionUa !== undefined ? data.descriptionUa.trim() : existing.descriptionUa,
        descriptionPl: data.descriptionPl !== undefined ? data.descriptionPl.trim() : existing.descriptionPl,
        badgeUa: data.badgeUa !== undefined ? data.badgeUa.trim() : existing.badgeUa,
        badgePl: data.badgePl !== undefined ? data.badgePl.trim() : existing.badgePl,
        buttonTextUa: data.buttonTextUa !== undefined ? data.buttonTextUa.trim() : existing.buttonTextUa,
        buttonTextPl: data.buttonTextPl !== undefined ? data.buttonTextPl.trim() : existing.buttonTextPl,
        coverUrl: data.coverUrl !== undefined ? (data.coverUrl ? data.coverUrl.trim() : null) : existing.coverUrl,
        duration: data.duration !== undefined ? (data.duration ? data.duration.trim() : null) : existing.duration,
        viewsCount: data.viewsCount !== undefined ? Number(data.viewsCount) : existing.viewsCount,
        sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : existing.sortOrder,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : existing.isActive,
      },
    });

    try {
      revalidatePath("/");
      revalidatePath("/admin");
    } catch {}

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating bonus video:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update bonus video" },
      { status: 500 }
    );
  }
}
