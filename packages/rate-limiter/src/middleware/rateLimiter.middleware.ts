import { Request, Response, NextFunction, RequestHandler } from 'express';
import rateLimitRules from '../config/rules';
import { checkRateLimit } from '../services/rateLimiter.service';

const rateLimiter = (resourceKey: string): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const rule = rateLimitRules[resourceKey];

    if (!rule) {
      next();
      return;
    }

    const { userId } = req.body as { userId?: string };

    if (!userId) {
      res.status(400).json({ error: 'userId is required in the request body' });
      return;
    }

    const { allowed, remaining } = await checkRateLimit({
      userId,
      resource: rule.resource,
      maxRequests: rule.maxRequests,
      windowSizeInSeconds: rule.windowSizeInSeconds,
    });

    res.setHeader('X-RateLimit-Limit', rule.maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Window', `${rule.windowSizeInSeconds}s`);

    if (!allowed) {
      res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded for resource "${rule.resource}". Try again later.`,
      });
      return;
    }

    next();
  };
};

export default rateLimiter;
