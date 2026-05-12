const _cache = new Map<string, { json: unknown; exp: number }>();

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

export async function adminFetchCached(
  url: string,
  ttl = 30_000
): Promise<Response> {
  const now = Date.now();
  const hit = _cache.get(url);
  if (hit && hit.exp > now) {
    return new Response(JSON.stringify(hit.json), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  const res = await adminFetch(url);
  if (res.ok) {
    const json = await res.json() as unknown;
    _cache.set(url, { json, exp: now + ttl });
    return new Response(JSON.stringify(json), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  }
  return res;
}

export function invalidateAdminCache(prefix?: string) {
  if (!prefix) { _cache.clear(); return; }
  for (const k of _cache.keys()) {
    if (k.startsWith(prefix)) _cache.delete(k);
  }
}
