import { Request, Response, NextFunction, RequestHandler } from 'express';
import logger from '../utils/logger';

const loggingMiddleware = (): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();
    const { method, path } = req;
    
    const params = method === 'POST' ? JSON.stringify(req.body) : JSON.stringify(req.query || {});
    
    logger.info(`[REQUEST] START - method: ${method}, path: ${path}, params: ${params}`);

    // Se intercepta la respuesta y se añade el logging. Por ultimo se invoka al res.end original.
    const originalEnd = res.end;
    res.end = function(chunk?: any, encoding?: any): Response {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;
      
      logger.info(
        `[REQUEST] COMPLETED - method: ${method}, path: ${path}, statusCode: ${statusCode}, duration: ${duration}ms`
      );

      return originalEnd.call(this, chunk, encoding);
    };

    next();
  };
};

export default loggingMiddleware;
