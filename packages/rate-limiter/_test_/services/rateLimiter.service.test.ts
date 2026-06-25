import { checkRateLimit } from '../../src/services/rateLimiter.service';
import redisClient from '../../src/redis/client';
import logger from '../../src/utils/logger';

jest.mock('../../src/redis/client', () => ({
  incr: jest.fn(),
  expire: jest.fn(),
}));

jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  warning: jest.fn(),
  error: jest.fn(),
}));

const mockRedis = redisClient as jest.Mocked<typeof redisClient>;

const baseParams = {
  userId: 'user-1',
  resource: 'payments',
  httpMethod: 'POST',
  maxRequests: 5,
  windowSizeInSeconds: 60,
};

describe('checkRateLimit', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns allowed=true and correct remaining when under limit', async () => {
    mockRedis.incr.mockResolvedValue(3);

    const result = await checkRateLimit(baseParams);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
    expect(result.currentCount).toBe(3);
  });

  it('returns allowed=false when count equals maxRequests + 1 (exceeded)', async () => {
    mockRedis.incr.mockResolvedValue(6);

    const result = await checkRateLimit(baseParams);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('returns allowed=true when count exactly equals maxRequests', async () => {
    mockRedis.incr.mockResolvedValue(5);

    const result = await checkRateLimit(baseParams);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it('sets expiry on the key when count is 1 (first request)', async () => {
    mockRedis.incr.mockResolvedValue(1);
    mockRedis.expire.mockResolvedValue(1);

    await checkRateLimit(baseParams);

    expect(mockRedis.expire).toHaveBeenCalledWith(
      'rate_limit:POST:payments:user-1',
      60
    );
  });

  it('does not set expiry when count is greater than 1', async () => {
    mockRedis.incr.mockResolvedValue(2);

    await checkRateLimit(baseParams);

    expect(mockRedis.expire).not.toHaveBeenCalled();
  });

  it('builds the Redis key using httpMethod, resource, and userId', async () => {
    mockRedis.incr.mockResolvedValue(1);
    mockRedis.expire.mockResolvedValue(1);

    await checkRateLimit({ ...baseParams, httpMethod: 'GET', resource: 'orders', userId: 'u42' });

    expect(mockRedis.incr).toHaveBeenCalledWith('rate_limit:GET:orders:u42');
  });

  it('logs the start and result of the rate limit check', async () => {
    mockRedis.incr.mockResolvedValue(2);
    const mockLogger = logger as jest.Mocked<typeof logger>;

    await checkRateLimit(baseParams);

    expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('[RATE_LIMIT] START'));
    expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('[RATE_LIMIT] RESULT'));
  });
});
