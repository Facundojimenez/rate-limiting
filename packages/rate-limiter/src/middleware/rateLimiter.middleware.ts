import { Request, Response, NextFunction, RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import rateLimitRules from '../config/rules';
import { checkRateLimit } from '../services/rateLimiter.service';
import logger from '../utils/logger';

const rateLimiter = (resourceKey: string): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const middlewareStartTime = Date.now();
    const rule = rateLimitRules[resourceKey];

    // Si no hay una regla de limitación de velocidad para el recurso, simplemente se permite la solicitud.
    if (!rule) {
      next();
      return;
    }

    // El UserId se obtiene de los query params para simplificar este ejemplo, pero en un caso real deberia obtenerse de un token JWT o de la sesión del usuario.
    const userId: string = req.query.userId as string;
    
    if (!userId) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: 'userId is required in the query params' });
      return;
    }

    logger.info(`[MIDDLEWARE] START - userId: ${userId}, resource: ${rule.resource}, method: ${rule.httpMethod}`);

    // Se verifica en Redis si el usuario ha excedido el límite de solicitudes para el recurso y método HTTP especificado.
    const { allowed, remaining } = await checkRateLimit({
      userId,
      resource: rule.resource,
      httpMethod: rule.httpMethod,
      maxRequests: rule.maxRequests,
      windowSizeInSeconds: rule.windowSizeInSeconds,
    });
    
    const checkRateLimitDuration = Date.now() - middlewareStartTime;
    logger.info(`[MIDDLEWARE] COMPLETED - userId: ${userId}, allowed: ${allowed}, remaining: ${remaining}, duration: ${checkRateLimitDuration}ms`);

    res.setHeader('X-RateLimit-Limit', rule.maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Window', `${rule.windowSizeInSeconds}s`);

    if (!allowed) {
      logger.warning(`[MIDDLEWARE] userId: ${userId}, method: ${rule.httpMethod}, resource: ${rule.resource} - Rate limit exceeded`);

      res.status(StatusCodes.TOO_MANY_REQUESTS).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded for resource "${rule.resource}". Try again later.`,
      });
      return;
    }

    next();
  };
};

export default rateLimiter;
