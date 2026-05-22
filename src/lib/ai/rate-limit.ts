import { env } from "@/lib/env";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export async function checkRateLimit(
  key: string,
  limit = 20,
  windowMs = 60_000,
) {
  const redisUrl = env.UPSTASH_REDIS_REST_URL;
  const redisToken = env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken) {
    try {
      const response = await fetch(redisUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${redisToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          "EVAL",
          "local c = redis.call('INCR', KEYS[1]); if c == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end; return {c, redis.call('PTTL', KEYS[1])}",
          "1",
          key,
          windowMs.toString(),
        ]),
        // Rapid 3-second timeout for fail-fast fallback
        signal: AbortSignal.timeout(3000),
      });

      if (response.ok) {
        const data = (await response.json()) as { result?: [number, number] };
        if (data && Array.isArray(data.result)) {
          const [count, pttl] = data.result;
          const now = Date.now();
          const resetAt = now + (pttl > 0 ? pttl : windowMs);

          if (count > limit) {
            return { allowed: false, remaining: 0, resetAt };
          }
          return {
            allowed: true,
            remaining: Math.max(limit - count, 0),
            resetAt,
          };
        }
      }
    } catch (e) {
      console.warn(
        "Upstash Redis rate-limiter failed, falling back to in-memory:",
        e,
      );
    }
  }

  // Local Memory Fallback
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return {
    allowed: true,
    remaining: Math.max(limit - bucket.count, 0),
    resetAt: bucket.resetAt,
  };
}

