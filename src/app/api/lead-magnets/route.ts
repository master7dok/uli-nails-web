import { NextResponse } from "next/server";
import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { defaultLeadMagnets } from "@/lib/defaultData";

export async function GET() {
  try {
    if (await isDatabaseAvailable()) {
      const isInit = await prisma.setting.findUnique({
        where: { key: "lead_magnets_initialized" },
      });

      if (!isInit) {
        for (const item of defaultLeadMagnets) {
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
        await prisma.setting.upsert({
          where: { key: "lead_magnets_initialized" },
          create: { key: "lead_magnets_initialized", value: "true" },
          update: { value: "true" },
        });
      }

      const items = await prisma.leadMagnet.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      });
      return NextResponse.json(items);
    }
    return NextResponse.json(defaultLeadMagnets);
  } catch (error) {
    console.warn("Could not query lead magnets from database, using fallback:", error);
    return NextResponse.json(defaultLeadMagnets);
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

    await prisma.setting.upsert({
      where: { key: "lead_magnets_initialized" },
      create: { key: "lead_magnets_initialized", value: "true" },
      update: { value: "true" },
    });

    const data = await request.json();
    const primaryFileUrl = data.fileUrl || data.fileUrlUa || data.fileUrlPl;
    if (!primaryFileUrl) {
      return NextResponse.json({ error: "File URL is required" }, { status: 400 });
    }
    if (!data.titleUa || !data.titlePl) {
      return NextResponse.json({ error: "Titles in UA and PL are required" }, { status: 400 });
    }

    const count = await prisma.leadMagnet.count();

    const item = await prisma.leadMagnet.create({
      data: {
        fileUrl: primaryFileUrl,
        fileName: data.fileName || data.fileNameUa || data.fileNamePl || "checklist.pdf",
        fileSize: data.fileSize || data.fileSizeUa || data.fileSizePl || "1.5 MB",
        fileUrlUa: data.fileUrlUa || data.fileUrl || null,
        fileNameUa: data.fileNameUa || data.fileName || null,
        fileSizeUa: data.fileSizeUa || data.fileSize || null,
        fileUrlPl: data.fileUrlPl || data.fileUrl || null,
        fileNamePl: data.fileNamePl || data.fileName || null,
        fileSizePl: data.fileSizePl || data.fileSize || null,
        titleUa: data.titleUa,
        titlePl: data.titlePl,
        descriptionUa: data.descriptionUa || "",
        descriptionPl: data.descriptionPl || "",
        badgeUa: data.badgeUa || "Безкоштовний PDF",
        badgePl: data.badgePl || "Darmowy PDF",
        buttonTextUa: data.buttonTextUa || "Отримати чек-лист",
        buttonTextPl: data.buttonTextPl || "Pobierz Checklist",
        coverUrl: data.coverUrl || null,
        downloadCount: Number(data.downloadCount) || 0,
        sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : count + 1,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    console.error("Error creating lead magnet:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create lead magnet" },
      { status: 500 }
    );
  }
}
