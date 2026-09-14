import { NextResponse } from "next/server";
import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { fallbackLeads } from "@/lib/defaultData";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (await isDatabaseAvailable()) {
      await prisma.checklistLead.delete({
        where: { id },
      });
      return NextResponse.json({ success: true });
    }

    const index = fallbackLeads.findIndex((l) => l.id === id);
    if (index !== -1) {
      fallbackLeads.splice(index, 1);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting checklist lead:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete lead" },
      { status: 500 }
    );
  }
}
