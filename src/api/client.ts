// HTTP client for the Food Connect API (food-connect-be), deployed separately from this app.
// Set VITE_API_URL to the API's public URL; it defaults to the local dev server.
//
// Sessions are a bearer token: after Google sign-in the API redirects back here with
// `#token=…`, which is moved into localStorage and sent as `Authorization: Bearer …`.

export const API_URL = (import.meta.env["VITE_API_URL"] || "http://localhost:4000").replace(
  /\/+$/,
  "",
);

const TOKEN_KEY = "fwc_session_token";

function readToken() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function clearSessionToken() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage blocked — nothing to clear.
  }
}

/** Picks up the token the API's sign-in callback put in the URL fragment, then removes it. */
function captureSessionToken() {
  if (typeof window === "undefined") return;
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const token = hash.get("token");
  if (!token) return;
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Storage blocked — the session can't persist, so the user stays signed out.
  }
  hash.delete("token");
  const rest = hash.toString();
  window.history.replaceState(
    window.history.state,
    "",
    `${window.location.pathname}${window.location.search}${rest ? `#${rest}` : ""}`,
  );
}

captureSessionToken();

/** Full URL for a browser navigation to the API (e.g. starting Google sign-in). */
export function apiUrl(path: string, params?: Record<string, string>) {
  const query = params ? `?${new URLSearchParams(params).toString()}` : "";
  return `${API_URL}${path}${query}`;
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/** Calls the API and returns its JSON (undefined for empty responses); non-2xx responses throw. */
export async function api<T = void>(method: Method, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {};
  const token = readToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? null : JSON.stringify(body),
  });

  const text = await response.text();
  const payload: unknown = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    // A stored token the API rejects is expired or revoked — drop it so the UI shows signed out.
    if (response.status === 401 && token) clearSessionToken();
    const message =
      payload &&
      typeof payload === "object" &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : `Request failed (${response.status}).`;
    throw new Error(message);
  }
  return payload as T;
}
