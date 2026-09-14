import { NextResponse } from "next/server";
import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { defaultLeadMagnets, fallbackLeads } from "@/lib/defaultData";

export async function GET(request: Request) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (await isDatabaseAvailable()) {
      const leads = await prisma.checklistLead.findMany({
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ leads });
    }

    return NextResponse.json({ leads: fallbackLeads });
  } catch (error: any) {
    console.warn("Failed to fetch checklist leads:", error);
    return NextResponse.json({ leads: fallbackLeads });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { leadMagnetId, checklistTitle, instagram, email, experience, language } = data;

    if (!instagram || !email || !experience) {
      return NextResponse.json(
        { error: "Будь ласка, заповніть усі обов'язкові поля" },
        { status: 400 }
      );
    }

    const cleanInstagram = instagram.trim().startsWith("@")
      ? instagram.trim()
      : `@${instagram.trim()}`;

    const cleanEmail = email.trim().toLowerCase();
    const cleanLang = language === "pl" ? "pl" : "ua";
    const title = checklistTitle || "Чек-лист для nail-майстрів";

    let downloadUrl = "/uploads/checklist-nail-expert.pdf";
    let fileName = cleanLang === "pl" ? "Checklist_Nail_Expert_PL.pdf" : "Checklist_Nail_Expert_UA.pdf";

    // Find lead magnet info to get the correct language-specific PDF
    if (await isDatabaseAvailable()) {
      try {
        let magnet = null;
        if (leadMagnetId) {
          magnet = await prisma.leadMagnet.findUnique({
            where: { id: leadMagnetId },
          });
        }

        if (magnet) {
          if (cleanLang === "pl") {
            downloadUrl = magnet.fileUrlPl || magnet.fileUrl || magnet.fileUrlUa || downloadUrl;
            fileName = magnet.fileNamePl || magnet.fileName || fileName;
          } else {
            downloadUrl = magnet.fileUrlUa || magnet.fileUrl || magnet.fileUrlPl || downloadUrl;
            fileName = magnet.fileNameUa || magnet.fileName || fileName;
          }

          // Increment download counter
          await prisma.leadMagnet.update({
            where: { id: magnet.id },
            data: { downloadCount: { increment: 1 } },
          });
        }

        const newLead = await prisma.checklistLead.create({
          data: {
            leadMagnetId: magnet?.id || leadMagnetId || null,
            checklistTitle: title,
            instagram: cleanInstagram,
            email: cleanEmail,
            experience: experience.trim(),
            language: cleanLang,
          },
        });

        return NextResponse.json({
          success: true,
          downloadUrl,
          fileName,
          leadId: newLead.id,
        });
      } catch (dbErr) {
        console.warn("Error saving lead to database, using memory fallback:", dbErr);
      }
    }

    // Fallback in-memory behavior
    const fallbackItem = defaultLeadMagnets.find((m) => m.id === leadMagnetId) || defaultLeadMagnets[0];
    if (fallbackItem) {
      if (cleanLang === "pl") {
        downloadUrl = fallbackItem.fileUrlPl || fallbackItem.fileUrl || fallbackItem.fileUrlUa || downloadUrl;
        fileName = fallbackItem.fileNamePl || fallbackItem.fileName || fileName;
      } else {
        downloadUrl = fallbackItem.fileUrlUa || fallbackItem.fileUrl || fallbackItem.fileUrlPl || downloadUrl;
        fileName = fallbackItem.fileNameUa || fallbackItem.fileName || fileName;
      }
      if (fallbackItem.downloadCount !== undefined) {
        fallbackItem.downloadCount += 1;
      }
    }

    const memoryLead = {
      id: `lead-${Date.now()}`,
      leadMagnetId: leadMagnetId || null,
      checklistTitle: title,
      instagram: cleanInstagram,
      email: cleanEmail,
      experience: experience.trim(),
      language: cleanLang,
      createdAt: new Date().toISOString(),
    };
    fallbackLeads.unshift(memoryLead);

    return NextResponse.json({
      success: true,
      downloadUrl,
      fileName,
      leadId: memoryLead.id,
    });
  } catch (error: any) {
    console.error("Error creating checklist lead:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
