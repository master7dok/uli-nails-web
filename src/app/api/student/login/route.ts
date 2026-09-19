import { NextResponse } from "next/server";
import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import {
  verifyStudentPassword,
  createStudentToken,
  STUDENT_COOKIE_NAME,
} from "@/lib/studentAuth";

export async function POST(request: Request) {
  try {
    if (!(await isDatabaseAvailable())) {
      return NextResponse.json(
        { error: "База даних тимчасово недоступна / Baza danych jest niedostępna" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const username = (body.username || "").trim().toLowerCase();
    const password = (body.password || "").trim();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Будь ласка, введіть логін та пароль / Wprowadź login i hasło" },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { username },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Невірний логін або пароль / Nieprawidłowy login lub hasło" },
        { status: 401 }
      );
    }

    if (!student.isActive) {
      return NextResponse.json(
        { error: "Акаунт деактивовано. Будь ласка, зверніться до Уляни / Konto zostało dezaktywowane" },
        { status: 403 }
      );
    }

    const isValid = verifyStudentPassword(password, student.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Невірний логін або пароль / Nieprawidłowy login lub hasło" },
        { status: 401 }
      );
    }

    // Update last login timestamp asynchronously
    prisma.student
      .update({
        where: { id: student.id },
        data: { lastLoginAt: new Date() },
      })
      .catch((err) => console.error("Error updating lastLoginAt:", err));

    const token = createStudentToken(student.id, student.username);
    const response = NextResponse.json({
      success: true,
      student: {
        id: student.id,
        username: student.username,
        name: student.name,
      },
    });

    const isHttps =
      request.headers.get("x-forwarded-proto") === "https" ||
      request.url.startsWith("https");

    response.cookies.set({
      name: STUDENT_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Student login error:", error);
    return NextResponse.json(
      { error: "Помилка сервера при вході / Błąd serwera" },
      { status: 500 }
    );
  }
}
