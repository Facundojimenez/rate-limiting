import redisClient from '../redis/client';
import logger from '../utils/logger';

interface CheckRateLimitParams {
  userId: string;
  resource: string;
  httpMethod: string;
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
  httpMethod,
  maxRequests,
  windowSizeInSeconds,
}: CheckRateLimitParams): Promise<RateLimitResult> => {
  const key = `rate_limit:${httpMethod}:${resource}:${userId}`;

  logger.info(`[RATE_LIMIT] START - userId: ${userId}, resource: ${resource}, maxRequests: ${maxRequests}, windowSize: ${windowSizeInSeconds}s`);

  //Se inserta el elemento en Redis si no existe la key, y luego se incrementa el contador.
  const currentCount = await redisClient.incr(key);

  //Si es la primera vez que se inserta el elemento, se establece el tiempo de expiración.
  if (currentCount === 1) {
    await redisClient.expire(key, windowSizeInSeconds);
  }
  
  const allowed: boolean = currentCount <= maxRequests;
  const remaining: number = Math.max(0, maxRequests - currentCount);
  
  logger.info(`[RATE_LIMIT] RESULT - allowed: ${allowed}, remaining: ${remaining}, count: ${currentCount}`);
  
  return { allowed, remaining, currentCount };
};
