import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import rateLimiter from '../../src/middleware/rateLimiter.middleware';
import * as rateLimiterService from '../../src/services/rateLimiter.service';
import logger from '../../src/utils/logger';

jest.mock('../../src/services/rateLimiter.service', () => ({
  checkRateLimit: jest.fn(),
}));
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  warning: jest.fn(),
  error: jest.fn(),
}));

const mockCheckRateLimit = rateLimiterService.checkRateLimit as jest.MockedFunction<
  typeof rateLimiterService.checkRateLimit
>;

const buildReq = (body: object = {}): Request => ({ body } as Request);

const buildRes = (): Response => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn();
  return res;
};

describe('rateLimiter middleware', () => {
  afterEach(() => jest.clearAllMocks());

  it('calls next() when no rule is found for the resource key', async () => {
    const req = buildReq({ userId: 'u1' });
    const res = buildRes();
    const next: NextFunction = jest.fn();

    await rateLimiter('unknown/key')(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 400 when userId is missing from the body', async () => {
    const req = buildReq({});
    const res = buildRes();
    const next: NextFunction = jest.fn();

    await rateLimiter('payments/insert')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({ error: 'userId is required in the request body' });
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next() and sets rate limit headers when request is allowed', async () => {
    mockCheckRateLimit.mockResolvedValue({ allowed: true, remaining: 4, currentCount: 1 });
    const req = buildReq({ userId: 'u1', amount: 100, currency: 'USD' });
    const res = buildRes();
    const next: NextFunction = jest.fn();

    await rateLimiter('payments/insert')(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 4);
  });

  it('returns 429 and does not call next() when rate limit is exceeded', async () => {
    mockCheckRateLimit.mockResolvedValue({ allowed: false, remaining: 0, currentCount: 6 });
    const req = buildReq({ userId: 'u1', amount: 100, currency: 'USD' });
    const res = buildRes();
    const next: NextFunction = jest.fn();

    await rateLimiter('payments/insert')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.TOO_MANY_REQUESTS);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Too Many Requests' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('sets all three rate limit headers on an allowed request', async () => {
    mockCheckRateLimit.mockResolvedValue({ allowed: true, remaining: 9, currentCount: 1 });
    const req = buildReq({ userId: 'u2' });
    const res = buildRes();
    const next: NextFunction = jest.fn();

    await rateLimiter('payments/get')(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', expect.any(Number));
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 9);
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Window', expect.stringContaining('s'));
  });

  it('calls checkRateLimit with the correct parameters', async () => {
    mockCheckRateLimit.mockResolvedValue({ allowed: true, remaining: 4, currentCount: 1 });
    const req = buildReq({ userId: 'u3', amount: 50, currency: 'ARS' });
    const res = buildRes();
    const next: NextFunction = jest.fn();

    await rateLimiter('payments/insert')(req, res, next);

    expect(mockCheckRateLimit).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'u3',
        resource: 'payments',
        httpMethod: 'POST',
      })
    );
  });

  it('logs a warning when the rate limit is exceeded', async () => {
    mockCheckRateLimit.mockResolvedValue({ allowed: false, remaining: 0, currentCount: 6 });
    const mockLogger = logger as jest.Mocked<typeof logger>;
    const req = buildReq({ userId: 'u1' });
    const res = buildRes();
    const next: NextFunction = jest.fn();

    await rateLimiter('payments/insert')(req, res, next);

    expect(mockLogger.warning).toHaveBeenCalledWith(expect.stringContaining('Rate limit exceeded'));
  });
});
