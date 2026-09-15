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
    const {
      leadMagnetId,
      videoId,
      checklistTitle,
      videoTitle,
      instagram,
      email,
      experience,
      language,
      type: rawType,
    } = data;

    if (!instagram || !email || !experience) {
      return NextResponse.json(
        { error: "Будь ласка, заповніть усі обов'язкові поля" },
        { status: 400 }
      );
    }

    const isVideo = rawType === "video" || Boolean(videoId);
    const leadType = isVideo ? "video" : "checklist";

    const cleanInstagram = instagram.trim().startsWith("@")
      ? instagram.trim()
      : `@${instagram.trim()}`;

    const cleanEmail = email.trim().toLowerCase();
    const cleanLang = language === "pl" ? "pl" : "ua";
    const title =
      videoTitle ||
      checklistTitle ||
      (isVideo ? (cleanLang === "pl" ? "Lekcja wideo" : "Відеоурок") : "Чек-лист для nail-майстрів");

    let downloadUrl = "/uploads/checklist-nail-expert.pdf";
    let fileName = cleanLang === "pl" ? "Checklist_Nail_Expert_PL.pdf" : "Checklist_Nail_Expert_UA.pdf";
    let videoUrl = "";

    if (await isDatabaseAvailable()) {
      try {
        if (isVideo) {
          let video = null;
          if (videoId) {
            video = await prisma.bonusVideo.findUnique({
              where: { id: videoId },
            });
          }

          if (video) {
            videoUrl =
              cleanLang === "pl"
                ? video.videoUrlPl || video.videoUrlUa || ""
                : video.videoUrlUa || video.videoUrlPl || "";

            await prisma.bonusVideo.update({
              where: { id: video.id },
              data: { viewsCount: { increment: 1 } },
            });
          }

          const newLead = await prisma.checklistLead.create({
            data: {
              leadMagnetId: null,
              checklistTitle: video ? (cleanLang === "pl" ? video.titlePl : video.titleUa) : title,
              instagram: cleanInstagram,
              email: cleanEmail,
              experience: experience.trim(),
              language: cleanLang,
              type: "video",
            },
          });

          return NextResponse.json({
            success: true,
            type: "video",
            videoUrl,
            leadId: newLead.id,
          });
        }

        // PDF Checklist handling
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
            type: "checklist",
          },
        });

        return NextResponse.json({
          success: true,
          type: "checklist",
          downloadUrl,
          fileName,
          leadId: newLead.id,
        });
      } catch (dbErr) {
        console.warn("Error saving lead to database, using memory fallback:", dbErr);
      }
    }

    // Fallback in-memory behavior
    if (isVideo) {
      const memoryLead = {
        id: `lead-${Date.now()}`,
        leadMagnetId: null,
        checklistTitle: title,
        instagram: cleanInstagram,
        email: cleanEmail,
        experience: experience.trim(),
        language: cleanLang,
        type: "video",
        createdAt: new Date().toISOString(),
      };
      fallbackLeads.unshift(memoryLead);

      return NextResponse.json({
        success: true,
        type: "video",
        videoUrl: "/uploads/sample-video.mp4",
        leadId: memoryLead.id,
      });
    }

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
      type: "checklist",
      createdAt: new Date().toISOString(),
    };
    fallbackLeads.unshift(memoryLead);

    return NextResponse.json({
      success: true,
      type: "checklist",
      downloadUrl,
      fileName,
      leadId: memoryLead.id,
    });
  } catch (error: any) {
    console.error("Error creating checklist lead:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to submit form" },
      { status: 500 }
    );
  }
}
