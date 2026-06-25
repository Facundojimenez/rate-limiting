import { randomUUID } from 'crypto';
import redisClient from '../redis/client';

interface CheckRateLimitParams {
  userId: string;
  resource: string;
  maxRequests: number;
  windowSizeInSeconds: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  currentCount: number;
}

export const checkRateLimit = async ({
  userId,
  resource,
  maxRequests,
  windowSizeInSeconds,
}: CheckRateLimitParams): Promise<RateLimitResult> => {
  const key = `rate_limit:${resource}:${userId}`;
  const now = Date.now();
  const windowStart = now - windowSizeInSeconds * 1000;
  const member = `${now}-${randomUUID()}`;

  const pipeline = redisClient.pipeline();
  pipeline.zremrangebyscore(key, '-inf', windowStart);
  pipeline.zadd(key, now, member);
  pipeline.zcard(key);
  pipeline.expire(key, windowSizeInSeconds);

  const results = await pipeline.exec();

  const currentCount = (results?.[2]?.[1] as number) ?? 0;
  const remaining = Math.max(0, maxRequests - currentCount);
  const allowed = currentCount <= maxRequests;

  return { allowed, remaining, currentCount };
};
