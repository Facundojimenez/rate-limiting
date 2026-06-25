import { RateLimitRule } from "../interfaces/rateLimitRules.interface";

const rateLimitRules: Record<string, RateLimitRule> = {
  'payments/insert': {
    resource: 'payments',
    httpMethod: 'POST',
    maxRequests: parseInt(process.env.INSERT_MAX_REQUESTS ?? '5'),
    windowSizeInSeconds: parseInt(process.env.INSERT_WINDOW_SECONDS ?? '60'),
  },
  'payments/get': { //nombre del endpoint en mi API Gateway con Rate Limiter
    resource: 'payments', //nombre del endpoint en mi backend
    httpMethod: 'GET',
    maxRequests: parseInt(process.env.GET_MAX_REQUESTS ?? '10'),
    windowSizeInSeconds: parseInt(process.env.GET_WINDOW_SECONDS ?? '60'),
  },
};

export default rateLimitRules;
