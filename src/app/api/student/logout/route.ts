import { NextResponse } from "next/server";
import { STUDENT_COOKIE_NAME } from "@/lib/studentAuth";

export async function POST(request: Request) {
  const response = NextResponse.json({ success: true });

  const isHttps =
    request.headers.get("x-forwarded-proto") === "https" ||
    request.url.startsWith("https");

  response.cookies.set({
    name: STUDENT_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
