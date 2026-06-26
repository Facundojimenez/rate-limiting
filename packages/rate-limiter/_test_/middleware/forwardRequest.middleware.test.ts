import { Request, Response, NextFunction } from 'express';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { StatusCodes } from 'http-status-codes';
import axios, { AxiosError } from 'axios';
import forwardRequest from '../../src/middleware/forwardRequest.middleware';

jest.mock('axios');

const mockAxios = axios as jest.MockedFunction<typeof axios>;
const noopNext: NextFunction = jest.fn();

const buildReq = (overrides: Partial<Request> = {}): Request =>
  ({ method: 'POST', body: { userId: 'u1' }, ...overrides } as unknown as Request);

const buildRes = (): Response => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res) as unknown as any;
  res.json = jest.fn().mockReturnValue(res) as unknown as any;
  return res;
};

describe('forwardRequest middleware', () => {
  afterEach(async () => jest.clearAllMocks());

  it('forwards the request and responds with the backend status and data', async () => {
    const backendData = [{ paymentId: 'p1' }];
    mockAxios.mockResolvedValue({ status: 200, data: backendData });

    const req = buildReq({ method: 'GET' });
    const res = buildRes();

    await forwardRequest('/payments/get')(req, res, noopNext);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(backendData);
  });

  it('calls axios with the correct method, url, body, and headers', async () => {
    mockAxios.mockResolvedValue({ status: 201, data: {} });
    const body = { userId: 'u1', amount: 100, currency: 'USD' };
    const req = buildReq({ method: 'POST', body });
    const res = buildRes();

    await forwardRequest('/payments/insert')(req, res, noopNext);

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        data: body,
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });

  it('returns 502 Bad Gateway when axios throws without a response', async () => {
    const error = new Error('Network Error') as AxiosError;
    (error as any).isAxiosError = true;
    mockAxios.mockRejectedValue(error);

    const req = buildReq();
    const res = buildRes();

    await forwardRequest('/payments/insert')(req, res, noopNext);

    expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_GATEWAY);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Bad Gateway' })
    );
  });

  it('returns the backend error status and data when axios throws with a response', async () => {
    const error = new Error('Conflict') as AxiosError;
    (error as any).response = { status: 409, data: { error: 'Conflict', message: 'Duplicate' } };
    mockAxios.mockRejectedValue(error);

    const req = buildReq();
    const res = buildRes();

    await forwardRequest('/payments/insert')(req, res, noopNext);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: 'Conflict', message: 'Duplicate' });
  });

  it('constructs the URL from the default backend host and the provided path', async () => {
    mockAxios.mockResolvedValue({ status: 200, data: {} });

    const req = buildReq({ method: 'GET' });
    const res = buildRes();

    await forwardRequest('/payments/get')(req, res, noopNext);

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({ url: expect.stringContaining('/payments/get') })
    );
  });
});
