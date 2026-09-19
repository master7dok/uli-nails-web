import crypto from "crypto";
import { cookies } from "next/headers";

export const STUDENT_COOKIE_NAME = "uli_student_token";

function getStudentAuthSecret(): string {
  const customSecret = process.env.AUTH_SECRET || process.env.JWT_SECRET || process.env.ADMIN_PASSWORD;
  return crypto
    .createHash("sha256")
    .update(`uliana_nails_student_auth_salt_2026_${customSecret || "default_student_secret_uli"}`)
    .digest("hex");
}

/**
 * Hash a plain text password using PBKDF2 with a random salt
 */
export function hashStudentPassword(password: string): string {
  const clean = password.trim();
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(clean, salt, 10000, 32, "sha256").toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify a plain text password against stored salt:hash
 */
export function verifyStudentPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash) return false;
  const parts = storedHash.split(":");
  if (parts.length !== 2) return false;

  const [salt, originalHash] = parts;
  const clean = password.trim();
  const checkHash = crypto.pbkdf2Sync(clean, salt, 10000, 32, "sha256").toString("hex");

  const originalBuf = Buffer.from(originalHash, "hex");
  const checkBuf = Buffer.from(checkHash, "hex");

  if (originalBuf.length !== checkBuf.length) return false;
  return crypto.timingSafeEqual(originalBuf, checkBuf);
}

/**
 * Create a signed session token for an authenticated student
 */
export function createStudentToken(studentId: string, username: string): string {
  const payload = {
    sub: studentId,
    username: username.toLowerCase().trim(),
    role: "student",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days session
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getStudentAuthSecret())
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * Verify a student token and return the student payload or null
 */
export function verifyStudentToken(token: string): { studentId: string; username: string } | null {
  if (!token || typeof token !== "string") return null;

  const parts = token.trim().split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;
  if (!payloadB64 || !signature) return null;

  try {
    const expectedSig = crypto
      .createHmac("sha256", getStudentAuthSecret())
      .update(payloadB64)
      .digest("base64url");

    const sigBuf = Buffer.from(signature);
    const expectedSigBuf = Buffer.from(expectedSig);

    if (sigBuf.length !== expectedSigBuf.length) return null;
    if (!crypto.timingSafeEqual(sigBuf, expectedSigBuf)) return null;

    const payloadJson = Buffer.from(payloadB64, "base64url").toString("utf-8");
    const payload = JSON.parse(payloadJson);

    if (payload.role !== "student") return null;
    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < now) return null;

    return {
      studentId: payload.sub,
      username: payload.username,
    };
  } catch {
    return null;
  }
}

/**
 * Extract authenticated student from request (cookie or Authorization header)
 */
export async function getAuthenticatedStudent(
  request?: Request
): Promise<{ studentId: string; username: string } | null> {
  // 1. Try Authorization header or x-student-token
  if (request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const student = verifyStudentToken(token);
      if (student) return student;
    }

    const xStudentToken = request.headers.get("x-student-token");
    if (xStudentToken) {
      const student = verifyStudentToken(xStudentToken);
      if (student) return student;
    }

    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${STUDENT_COOKIE_NAME}=([^;]+)`));
      if (match && match[1]) {
        const student = verifyStudentToken(decodeURIComponent(match[1]));
        if (student) return student;
      }
    }
  }

  // 2. Try next/headers cookies
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(STUDENT_COOKIE_NAME)?.value;
    if (token) {
      return verifyStudentToken(token);
    }
  } catch {}

  return null;
}
