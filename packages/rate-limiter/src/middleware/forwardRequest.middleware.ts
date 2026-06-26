import { Request, Response, RequestHandler } from 'express';
import axios, { AxiosError } from 'axios';
import { StatusCodes } from 'http-status-codes';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3000';

const BACKEND_UNAVAILABLE_RESPONSE = {
  error: 'Bad Gateway',
  message: 'Backend service is unavailable',
};

const forwardRequest = (path: string): RequestHandler => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const targetUrl = `${BACKEND_URL}${req.originalUrl}`;

      const response = await axios({
        method: req.method,
        url: targetUrl,
        data: req.body,
        headers: { 'Content-Type': 'application/json' },
      });

      res.status(response.status).json(response.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status ?? StatusCodes.BAD_GATEWAY;
      const data = axiosError.response?.data ?? BACKEND_UNAVAILABLE_RESPONSE;
      res.status(status).json(data);
    }
  };
};

export default forwardRequest;
