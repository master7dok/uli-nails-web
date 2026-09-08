import { NextResponse } from "next/server";
import { createAuthToken, getExpectedPassword, ADMIN_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const expected = getExpectedPassword();

    if (!password || password !== expected) {
      return NextResponse.json(
        { error: "Невірний пароль / Nieprawidłowe hasło" },
        { status: 401 }
      );
    }

    const token = createAuthToken(password);
    const response = NextResponse.json({ success: true });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
