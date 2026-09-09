/**
 * Helper to attach authorization headers to client-side admin requests.
 * Ensures authentication succeeds even if cookies are dropped by reverse proxies or HTTP.
 */
export function getAdminHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...customHeaders };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("uli_admin_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      headers["x-admin-token"] = token;
    }
  }
  return headers;
}
