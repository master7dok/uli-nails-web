import { NextResponse } from "next/server";
import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import { getAuthenticatedStudent } from "@/lib/studentAuth";

export async function GET(request: Request) {
  try {
    if (!(await isDatabaseAvailable())) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const authStudent = await getAuthenticatedStudent(request);
    if (!authStudent) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const student = await prisma.student.findUnique({
      where: { id: authStudent.studentId },
      include: {
        courses: {
          include: {
            course: {
              include: {
                materials: {
                  orderBy: { sortOrder: "asc" },
                },
              },
            },
          },
        },
      },
    });

    if (!student || !student.isActive) {
      return NextResponse.json({ authenticated: false, error: "Account inactive" }, { status: 401 });
    }

    const courses = student.courses
      .map((sc) => sc.course)
      .filter((c) => c && c.isActive);

    return NextResponse.json({
      authenticated: true,
      student: {
        id: student.id,
        username: student.username,
        name: student.name,
        email: student.email,
      },
      courses,
    });
  } catch (error: any) {
    console.error("Error fetching student session:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
