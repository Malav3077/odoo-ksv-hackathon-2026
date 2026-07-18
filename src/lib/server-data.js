/**
 * Server-only data access for the back-office screens.
 *
 * The back-office needs admin/vendor-scoped data, so this module logs in once
 * with a service account and caches the JWT access token in module scope. It is
 * imported only from Server Components — the credentials use non-`NEXT_PUBLIC`
 * env vars, so they never reach the browser bundle.
 *
 * On a 401 (expired/blacklisted token) it re-logs in once and retries.
 */
import { apiUrl } from "./api";

const SERVICE_EMAIL = process.env.DASHBOARD_API_EMAIL || "admin@demo.com";
const SERVICE_PASSWORD = process.env.DASHBOARD_API_PASSWORD || "Admin@123";

let cachedToken = null;

async function login() {
  const res = await fetch(apiUrl("auth/login/"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: SERVICE_EMAIL, password: SERVICE_PASSWORD }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Service login failed (${res.status})`);
  }
  const data = await res.json();
  return data.access;
}

async function getToken(force = false) {
  if (!cachedToken || force) {
    cachedToken = await login();
  }
  return cachedToken;
}

/**
 * Authenticated GET against the API, returning parsed JSON.
 * Retries once with a fresh token if the first attempt is unauthorized.
 */
export async function serverGet(path) {
  let token = await getToken();
  let res = await fetch(apiUrl(path), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (res.status === 401) {
    token = await getToken(true);
    res = await fetch(apiUrl(path), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  }
  if (!res.ok) {
    throw new Error(`GET ${path} failed (${res.status})`);
  }
  return res.json();
}
