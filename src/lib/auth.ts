import { cookies } from "next/headers";
import crypto from "crypto";

const ADMIN_COOKIE_NAME = "uli_admin_token";

export function getExpectedPassword(): string {
  let pass = process.env.ADMIN_PASSWORD;
  if (!pass) return "";
  pass = pass.trim();
  // Strip surrounding quotes if set like ADMIN_PASSWORD="secret" in Coolify/Docker
  if (
    (pass.startsWith('"') && pass.endsWith('"')) ||
    (pass.startsWith("'") && pass.endsWith("'"))
  ) {
    pass = pass.slice(1, -1).trim();
  }
  return pass;
}

function getAuthSecret(): string {
  const customSecret = process.env.AUTH_SECRET || process.env.JWT_SECRET;
  if (customSecret && customSecret.trim().length >= 16) {
    return customSecret.trim();
  }
  // Derive a stable 256-bit key from the admin password + application-specific salt
  const expectedPassword = getExpectedPassword();
  return crypto
    .createHash("sha256")
    .update(`uliana_nails_auth_salt_2026_${expectedPassword}`)
    .digest("hex");
}

export function verifyPassword(inputPassword: string): boolean {
  const expected = getExpectedPassword();
  if (!expected || !inputPassword) return false;

  const cleanInput = inputPassword.trim();
  // Use timing-safe hash comparison to prevent timing attacks
  const inputHash = crypto.createHash("sha256").update(cleanInput).digest();
  const expectedHash = crypto.createHash("sha256").update(expected).digest();

  return crypto.timingSafeEqual(inputHash, expectedHash);
}

export function createSessionToken(): string {
  const payload = {
    role: "admin",
    nonce: crypto.randomBytes(16).toString("hex"),
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days TTL
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getAuthSecret())
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

// Alias for backwards compatibility
export const createAuthToken = (_password?: string): string => {
  return createSessionToken();
};

export function isValidToken(token: string): boolean {
  if (!token || typeof token !== "string") return false;

  const parts = token.trim().split(".");
  if (parts.length !== 2) return false;

  const [payloadB64, signature] = parts;
  if (!payloadB64 || !signature) return false;

  try {
    const expectedSig = crypto
      .createHmac("sha256", getAuthSecret())
      .update(payloadB64)
      .digest("base64url");

    const sigBuffer = Buffer.from(signature);
    const expectedSigBuffer = Buffer.from(expectedSig);

    if (sigBuffer.length !== expectedSigBuffer.length) return false;
    if (!crypto.timingSafeEqual(sigBuffer, expectedSigBuffer)) return false;

    const payloadJson = Buffer.from(payloadB64, "base64url").toString("utf-8");
    const payload = JSON.parse(payloadJson);

    if (payload.role !== "admin") return false;
    const nowSec = Math.floor(Date.now() / 1000);
    if (!payload.exp || typeof payload.exp !== "number" || payload.exp < nowSec) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function verifyCsrf(request: Request): boolean {
  // Only enforce CSRF on state-changing HTTP methods
  const method = request.method.toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(method)) {
    return true;
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  // If both origin and referer are missing (e.g. native scripts or curl),
  // Bearer token will still protect the endpoint.
  if (!origin && !referer) {
    return true;
  }

  const targetHost =
    request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (!targetHost) {
    return true;
  }

  // Normalize host (strip port if matching default)
  const normalizedTarget = targetHost.toLowerCase().split(":")[0];

  if (origin) {
    try {
      const originHost = new URL(origin).host.toLowerCase().split(":")[0];
      return originHost === normalizedTarget || originHost === "localhost" || originHost === "127.0.0.1";
    } catch {
      return false;
    }
  }

  if (referer) {
    try {
      const refererHost = new URL(referer).host.toLowerCase().split(":")[0];
      return refererHost === normalizedTarget || refererHost === "localhost" || refererHost === "127.0.0.1";
    } catch {
      return false;
    }
  }

  return true;
}

export async function isAuthenticated(request?: Request): Promise<boolean> {
  // CSRF validation on mutating requests
  if (request && !verifyCsrf(request)) {
    return false;
  }

  let token: string | undefined;

  // 1. Check Authorization header: Bearer <token>
  if (request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7).trim();
      } else {
        token = authHeader.trim();
      }
    }

    // 2. Check custom header x-admin-token
    if (!token) {
      const customHeader = request.headers.get("x-admin-token");
      if (customHeader) {
        token = customHeader.trim();
      }
    }

    // 3. Check Cookie header directly from raw request headers
    if (!token) {
      const rawCookie = request.headers.get("cookie");
      if (rawCookie) {
        const match = rawCookie.match(
          new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE_NAME}=([^;]*)`)
        );
        if (match) {
          token = decodeURIComponent(match[1].trim());
        }
      }
    }
  }

  // 4. Fallback to next/headers cookies() store
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    } catch {
      // Ignore errors when cookies() is unavailable
    }
  }

  return isValidToken(token || "");
}

export { ADMIN_COOKIE_NAME };

