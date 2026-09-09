import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    return NextResponse.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const service = await prisma.service.create({
      data: {
        category: data.category || "manicure",
        titlePl: data.titlePl,
        titleUa: data.titleUa,
        descriptionPl: data.descriptionPl || "",
        descriptionUa: data.descriptionUa || "",
        pricePln: Number(data.pricePln) || 0,
        durationMin: Number(data.durationMin) || 90,
        isPopular: Boolean(data.isPopular),
        sortOrder: Number(data.sortOrder) || 0,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}
