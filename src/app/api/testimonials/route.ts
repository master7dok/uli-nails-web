import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

import { defaultTestimonials } from "@/lib/defaultData";

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    if (testimonials.length > 0) {
      return NextResponse.json(testimonials);
    }
    return NextResponse.json(defaultTestimonials);
  } catch (error) {
    console.warn("Database unavailable for testimonials, returning defaults:", error);
    return NextResponse.json(defaultTestimonials);
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const testimonial = await prisma.testimonial.create({
      data: {
        name: data.name || "Анонімний майстер",
        rolePl: data.rolePl || "Absolwentka kursu",
        roleUa: data.roleUa || "Випускниця курсу",
        textPl: data.textPl || "",
        textUa: data.textUa || "",
        rating: Number(data.rating) || 5,
        sortOrder: Number(data.sortOrder) || 0,
      },
    });

    return NextResponse.json(testimonial, { status: 201 });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json(
      { error: "Failed to create testimonial" },
      { status: 500 }
    );
  }
}
