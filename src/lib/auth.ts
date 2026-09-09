import { cookies } from "next/headers";

const ADMIN_COOKIE_NAME = "uli_admin_token";
const DEFAULT_SECRET = "uliana_admin_secret";

export function getExpectedPassword(): string {
  let pass = process.env.ADMIN_PASSWORD;
  if (!pass) return DEFAULT_SECRET;
  pass = pass.trim();
  // Strip surrounding quotes if set like ADMIN_PASSWORD="secret" in Coolify/Docker
  if (
    (pass.startsWith('"') && pass.endsWith('"')) ||
    (pass.startsWith("'") && pass.endsWith("'"))
  ) {
    pass = pass.slice(1, -1).trim();
  }
  return pass || DEFAULT_SECRET;
}

export function createAuthToken(password: string): string {
  return Buffer.from(password).toString("base64");
}

export function isValidToken(token: string): boolean {
  if (!token) return false;
  const expectedPassword = getExpectedPassword();
  const expectedBase64 = createAuthToken(expectedPassword);
  return token === expectedBase64 || token === expectedPassword;
}

export async function isAuthenticated(request?: Request): Promise<boolean> {
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
        const match = rawCookie.match(new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE_NAME}=([^;]*)`));
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

