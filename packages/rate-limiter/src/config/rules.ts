export interface RateLimitRule {
  resource: string;
  maxRequests: number;
  windowSizeInSeconds: number;
}

const rateLimitRules: Record<string, RateLimitRule> = {
  'payments/insert': {
    resource: 'payments/insert',
    maxRequests: parseInt(process.env.INSERT_MAX_REQUESTS ?? '5', 10),
    windowSizeInSeconds: parseInt(process.env.INSERT_WINDOW_SECONDS ?? '60', 10),
  },
  'payments/update': {
    resource: 'payments/update',
    maxRequests: parseInt(process.env.UPDATE_MAX_REQUESTS ?? '10', 10),
    windowSizeInSeconds: parseInt(process.env.UPDATE_WINDOW_SECONDS ?? '60', 10),
  },
};

export default rateLimitRules;
