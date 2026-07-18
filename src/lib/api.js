/**
 * Shared API config for the back-office frontend.
 *
 * `API_URL` points at the Django REST API. Server components fetch through
 * `src/lib/server-data.js` (which adds the service token); this module just
 * holds the base URL and a small path joiner so both sides agree on the shape.
 */

/** Base URL for the Django REST API (no trailing slash). */
export const API_URL =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").replace(/\/$/, "");

/** Join the API base with a relative path, e.g. apiUrl("orders/"). */
export function apiUrl(path) {
  return `${API_URL}/${String(path).replace(/^\//, "")}`;
}
