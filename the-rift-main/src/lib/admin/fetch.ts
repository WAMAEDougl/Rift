/**
 * Wrapper around fetch for admin API calls.
 * Always includes credentials (session cookies) and handles
 * common error patterns consistently.
 */
export async function adminFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body && typeof options.body === "string"
        ? { "Content-Type": "application/json" }
        : {}),
      ...options.headers,
    },
  });
}
