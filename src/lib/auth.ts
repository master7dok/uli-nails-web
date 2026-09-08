import { cookies } from "next/headers";

const ADMIN_COOKIE_NAME = "uli_admin_token";
const DEFAULT_SECRET = "uliana_admin_secret";

export function getExpectedPassword(): string {
  return process.env.ADMIN_PASSWORD || DEFAULT_SECRET;
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return false;

  const expectedToken = Buffer.from(getExpectedPassword()).toString("base64");
  return token === expectedToken;
}

export function createAuthToken(password: string): string {
  return Buffer.from(password).toString("base64");
}

export { ADMIN_COOKIE_NAME };
