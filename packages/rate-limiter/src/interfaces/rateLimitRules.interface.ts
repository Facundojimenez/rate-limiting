export interface RateLimitRule {
  resource: string;
  httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  maxRequests: number;
  windowSizeInSeconds: number;
}