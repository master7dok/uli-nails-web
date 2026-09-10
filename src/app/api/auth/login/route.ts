import { NextResponse } from "next/server";
import {
  createSessionToken,
  verifyPassword,
  verifyCsrf,
  ADMIN_COOKIE_NAME,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    if (!verifyCsrf(request)) {
      return NextResponse.json(
        { error: "CSRF validation failed" },
        { status: 403 }
      );
    }

    const { password } = await request.json();
    const cleanPassword = typeof password === "string" ? password.trim() : "";

    if (!cleanPassword || !verifyPassword(cleanPassword)) {
      return NextResponse.json(
        { error: "Невірний пароль / Nieprawidłowe hasło" },
        { status: 401 }
      );
    }

    const token = createSessionToken();
    const response = NextResponse.json({ success: true, token });

    // Determine if connection is HTTPS (respects reverse proxies like Traefik in Coolify)
    const isHttps =
      request.headers.get("x-forwarded-proto") === "https" ||
      request.url.startsWith("https");

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
