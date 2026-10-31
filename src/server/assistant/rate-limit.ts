const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;
const hits = new Map<string, { count: number; resetAt: number }>();

/** Small in-memory fixed-window limiter. Use a shared store (Redis, KV) behind multiple instances. */
export function allowRequest(key: string, now = Date.now()): boolean {
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
  }
  const entry = hits.get(key);
  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  entry.count += 1;
  return entry.count <= MAX_REQUESTS;
}
