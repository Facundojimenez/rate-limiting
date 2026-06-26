import { Request, Response, NextFunction } from 'express';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import loggingMiddleware from '../../src/middleware/logging.middleware';
import logger from '../../src/utils/logger';

jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  warning: jest.fn(),
  error: jest.fn(),
}));

const mockLogger = logger as jest.Mocked<typeof logger>;

const buildReq = (overrides: Partial<Request> = {}): Request =>
  ({ method: 'GET', path: '/test', body: {}, query: {}, ...overrides } as unknown as Request);

const buildRes = (): Response => {
  const res = {
    statusCode: 200,
    end: jest.fn(),
    setHeader: jest.fn(),
  } as unknown as Response;
  return res;
};

describe('loggingMiddleware', () => {
  beforeEach(async () => jest.clearAllMocks());

  it('returns a function (RequestHandler)', () => {
    expect(typeof loggingMiddleware()).toBe('function');
  });

  it('calls next()', () => {
    const req = buildReq();
    const res = buildRes();
    const next: NextFunction = jest.fn();

    loggingMiddleware()(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('logs the request START for a GET request without query (uses empty fallback)', () => {
    const req = buildReq({ method: 'GET', path: '/health', query: undefined as any });
    const res = buildRes();
    const next: NextFunction = jest.fn();

    loggingMiddleware()(req, res, next);

    expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('[REQUEST] START'));
  });

  it('logs the request START for a GET request with query params', () => {
    const req = buildReq({ method: 'GET', path: '/payments/get', query: { page: '1' } as any });
    const res = buildRes();
    const next: NextFunction = jest.fn();

    loggingMiddleware()(req, res, next);

    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('[REQUEST] START')
    );
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('GET')
    );
  });

  it('logs the request START for a POST request with body params', () => {
    const req = buildReq({ method: 'POST', path: '/payments/insert', body: { userId: 'u1', amount: 100 } });
    const res = buildRes();
    const next: NextFunction = jest.fn();

    loggingMiddleware()(req, res, next);

    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('POST')
    );
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('userId')
    );
  });

  it('logs COMPLETED with status code and duration when res.end is called', () => {
    const req = buildReq({ method: 'GET', path: '/health' });
    const res = buildRes();
    const next: NextFunction = jest.fn();

    loggingMiddleware()(req, res, next);

    res.end();

    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('[REQUEST] COMPLETED')
    );
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('200')
    );
  });

  it('overrides res.end and calls the original implementation', () => {
    const req = buildReq();
    const res = buildRes();
    const originalEnd = res.end as jest.Mock;
    const next: NextFunction = jest.fn();

    loggingMiddleware()(req, res, next);

    res.end('data');

    expect(originalEnd).toHaveBeenCalledWith('data', undefined);
  });
});
