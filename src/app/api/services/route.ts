import { NextResponse } from "next/server";
import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

import { defaultServices } from "@/lib/defaultData";

export async function GET() {
  try {
    if (await isDatabaseAvailable()) {
      const services = await prisma.service.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      });
      if (services.length > 0) {
        return NextResponse.json(services);
      }
    }
    return NextResponse.json(defaultServices);
  } catch (error) {
    return NextResponse.json(defaultServices);
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isDatabaseAvailable())) {
      return NextResponse.json(
        { error: "База даних тимчасово недоступна. Будь ласка, перевірте PostgreSQL / Baza danych jest niedostępna." },
        { status: 503 }
      );
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
