import { NextResponse } from "next/server";
import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";
import { hashStudentPassword } from "@/lib/studentAuth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isDatabaseAvailable())) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const { id } = await params;
    const data = await request.json();

    const existingStudent = await prisma.student.findUnique({
      where: { id },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const updateData: any = {};

    if (data.username) {
      const cleanUsername = data.username.trim().toLowerCase();
      if (cleanUsername !== existingStudent.username) {
        const usernameCheck = await prisma.student.findUnique({
          where: { username: cleanUsername },
        });
        if (usernameCheck) {
          return NextResponse.json(
            { error: "Користувач із таким логіном вже існує / Użytkownik o takim loginie już istnieje" },
            { status: 409 }
          );
        }
        updateData.username = cleanUsername;
      }
    }

    if (data.password && typeof data.password === "string" && data.password.trim().length >= 4) {
      updateData.passwordHash = hashStudentPassword(data.password.trim());
    }

    if (data.name !== undefined) updateData.name = data.name ? data.name.trim() : null;
    if (data.email !== undefined) updateData.email = data.email ? data.email.trim() : null;
    if (data.notes !== undefined) updateData.notes = data.notes ? data.notes.trim() : null;
    if (data.isActive !== undefined) updateData.isActive = Boolean(data.isActive);

    // Update course access if courseIds array is provided
    if (Array.isArray(data.courseIds)) {
      const courseIds: string[] = data.courseIds;
      await prisma.$transaction([
        prisma.studentCourseAccess.deleteMany({
          where: { studentId: id },
        }),
        prisma.studentCourseAccess.createMany({
          data: courseIds.map((courseId) => ({
            studentId: id,
            courseId,
          })),
        }),
      ]);
    }

    const updated = await prisma.student.update({
      where: { id },
      data: updateData,
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
      id: updated.id,
      username: updated.username,
      name: updated.name,
      email: updated.email,
      notes: updated.notes,
      isActive: updated.isActive,
      courses: updated.courses.map((c) => ({
        courseId: c.courseId,
        courseTitleUa: c.course.titleUa,
        courseTitlePl: c.course.titlePl,
      })),
      updatedAt: updated.updatedAt,
    });
  } catch (error: any) {
    console.error("Error updating student:", error);
    return NextResponse.json({ error: error?.message || "Failed to update student" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAuthenticated(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isDatabaseAvailable())) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const { id } = await params;
    await prisma.student.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting student:", error);
    return NextResponse.json({ error: error?.message || "Failed to delete student" }, { status: 500 });
  }
}
