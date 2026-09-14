import { NextResponse } from "next/server";
import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { defaultLeadMagnets } from "@/lib/defaultData";
import fs from "fs";
import path from "path";

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

    const isInit = await prisma.setting.findUnique({
      where: { key: "lead_magnets_initialized" },
    });

    if (!isInit) {
      for (const item of defaultLeadMagnets) {
        if (item.id !== id) {
          await prisma.leadMagnet.upsert({
            where: { id: item.id || "" },
            create: {
              id: item.id,
              fileUrl: item.fileUrl,
              fileName: item.fileName,
              fileSize: item.fileSize,
              titlePl: item.titlePl || "",
              titleUa: item.titleUa || "",
              descriptionPl: item.descriptionPl || null,
              descriptionUa: item.descriptionUa || null,
              badgePl: item.badgePl || "Darmowy PDF",
              badgeUa: item.badgeUa || "Безкоштовний PDF",
              buttonTextPl: item.buttonTextPl || "Pobierz Checklist",
              buttonTextUa: item.buttonTextUa || "Отримати чек-лист",
              coverUrl: item.coverUrl || null,
              downloadCount: item.downloadCount || 0,
              sortOrder: item.sortOrder || 0,
              isActive: item.isActive !== undefined ? item.isActive : true,
            },
            update: {},
          });
        }
      }
      await prisma.setting.upsert({
        where: { key: "lead_magnets_initialized" },
        create: { key: "lead_magnets_initialized", value: "true" },
        update: { value: "true" },
      });
      return NextResponse.json({ success: true });
    }

    const existing = await prisma.leadMagnet.findUnique({
      where: { id },
    });

    if (existing) {
      // Try to clean up uploaded file if stored locally in /uploads
      if (existing.fileUrl && existing.fileUrl.startsWith("/uploads/")) {
        try {
          const filePath = path.join(process.cwd(), "public", existing.fileUrl);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (fileErr) {
          console.warn("Could not remove file from uploads:", fileErr);
        }
      }

      await prisma.leadMagnet.delete({
        where: { id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting lead magnet:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete lead magnet" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    // If this is a public download counter increment request
    if (data.action === "download") {
      if (await isDatabaseAvailable()) {
        try {
          const updated = await prisma.leadMagnet.update({
            where: { id },
            data: { downloadCount: { increment: 1 } },
          });
          return NextResponse.json({ success: true, downloadCount: updated.downloadCount });
        } catch {
          return NextResponse.json({ success: true });
        }
      }
      return NextResponse.json({ success: true });
    }

    // Admin updates require authentication
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isDatabaseAvailable())) {
      return NextResponse.json(
        { error: "База даних тимчасово недоступна. Будь ласка, перевірте PostgreSQL." },
        { status: 503 }
      );
    }

    const existing = await prisma.leadMagnet.findUnique({
      where: { id },
    });

    let updated;
    if (existing) {
      updated = await prisma.leadMagnet.update({
        where: { id },
        data: {
          ...(data.fileUrl !== undefined && { fileUrl: data.fileUrl }),
          ...(data.fileName !== undefined && { fileName: data.fileName }),
          ...(data.fileSize !== undefined && { fileSize: data.fileSize }),
          ...(data.titleUa !== undefined && { titleUa: data.titleUa }),
          ...(data.titlePl !== undefined && { titlePl: data.titlePl }),
          ...(data.descriptionUa !== undefined && { descriptionUa: data.descriptionUa }),
          ...(data.descriptionPl !== undefined && { descriptionPl: data.descriptionPl }),
          ...(data.badgeUa !== undefined && { badgeUa: data.badgeUa }),
          ...(data.badgePl !== undefined && { badgePl: data.badgePl }),
          ...(data.buttonTextUa !== undefined && { buttonTextUa: data.buttonTextUa }),
          ...(data.buttonTextPl !== undefined && { buttonTextPl: data.buttonTextPl }),
          ...(data.coverUrl !== undefined && { coverUrl: data.coverUrl }),
          ...(data.downloadCount !== undefined && { downloadCount: Number(data.downloadCount) }),
          ...(data.sortOrder !== undefined && { sortOrder: Number(data.sortOrder) }),
          ...(data.isActive !== undefined && { isActive: Boolean(data.isActive) }),
        },
      });
    } else {
      const def = defaultLeadMagnets.find((item) => item.id === id);
      if (def) {
        updated = await prisma.leadMagnet.create({
          data: {
            id: def.id,
            fileUrl: data.fileUrl ?? def.fileUrl,
            fileName: data.fileName ?? def.fileName,
            fileSize: data.fileSize ?? def.fileSize,
            titleUa: data.titleUa ?? def.titleUa,
            titlePl: data.titlePl ?? def.titlePl,
            descriptionUa: data.descriptionUa ?? def.descriptionUa ?? "",
            descriptionPl: data.descriptionPl ?? def.descriptionPl ?? "",
            badgeUa: data.badgeUa ?? def.badgeUa ?? "Безкоштовний PDF",
            badgePl: data.badgePl ?? def.badgePl ?? "Darmowy PDF",
            buttonTextUa: data.buttonTextUa ?? def.buttonTextUa ?? "Отримати чек-лист",
            buttonTextPl: data.buttonTextPl ?? def.buttonTextPl ?? "Pobierz Checklist",
            coverUrl: data.coverUrl ?? def.coverUrl,
            downloadCount: data.downloadCount !== undefined ? Number(data.downloadCount) : def.downloadCount || 0,
            sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : def.sortOrder || 0,
            isActive: data.isActive !== undefined ? Boolean(data.isActive) : def.isActive ?? true,
          },
        });
      } else {
        return NextResponse.json({ error: "Lead magnet not found" }, { status: 404 });
      }
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating lead magnet:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update lead magnet" },
      { status: 500 }
    );
  }
}
