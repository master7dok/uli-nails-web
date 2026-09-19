import { NextResponse } from "next/server";
import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { hashStudentPassword } from "@/lib/studentAuth";

export async function GET(request: Request) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isDatabaseAvailable())) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const students = await prisma.student.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        courses: {
          include: {
            course: {
              select: { id: true, titleUa: true, titlePl: true, slug: true },
            },
          },
        },
      },
    });

    const safeStudents = students.map((s) => ({
      id: s.id,
      username: s.username,
      name: s.name,
      email: s.email,
      notes: s.notes,
      isActive: s.isActive,
      lastLoginAt: s.lastLoginAt,
      createdAt: s.createdAt,
      courses: s.courses.map((c) => ({
        courseId: c.courseId,
        grantedAt: c.grantedAt,
        courseTitleUa: c.course.titleUa,
        courseTitlePl: c.course.titlePl,
      })),
    }));

    return NextResponse.json(safeStudents);
  } catch (error: any) {
    console.error("Error fetching students:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isDatabaseAvailable())) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const data = await request.json();
    const username = (data.username || "").trim().toLowerCase();
    const password = (data.password || "").trim();

    if (!username || username.length < 3) {
      return NextResponse.json(
        { error: "Логін має містити щонайменше 3 символи / Login musi mieć min. 3 znaki" },
        { status: 400 }
      );
    }

    if (!password || password.length < 4) {
      return NextResponse.json(
        { error: "Пароль має містити щонайменше 4 символи / Hasło musi mieć min. 4 znaki" },
        { status: 400 }
      );
    }

    const existing = await prisma.student.findUnique({
      where: { username },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Користувач із таким логіном вже існує / Użytkownik o takim loginie już istnieje" },
        { status: 409 }
      );
    }

    const passwordHash = hashStudentPassword(password);
    const courseIds: string[] = Array.isArray(data.courseIds) ? data.courseIds : [];

    const student = await prisma.student.create({
      data: {
        username,
        passwordHash,
        name: data.name?.trim() || null,
        email: data.email?.trim() || null,
        notes: data.notes?.trim() || null,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
        courses: {
          create: courseIds.map((courseId) => ({ courseId })),
        },
      },
      include: {
        courses: {
          include: {
            course: {
              select: { id: true, titleUa: true, titlePl: true, slug: true },
            },
          },
        },
      },
    });

    return NextResponse.json({
      id: student.id,
      username: student.username,
      name: student.name,
      email: student.email,
      notes: student.notes,
      isActive: student.isActive,
      courses: student.courses.map((c) => ({
        courseId: c.courseId,
        courseTitleUa: c.course.titleUa,
        courseTitlePl: c.course.titlePl,
      })),
      createdAt: student.createdAt,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating student:", error);
    return NextResponse.json({ error: error?.message || "Failed to create student" }, { status: 500 });
  }
}
