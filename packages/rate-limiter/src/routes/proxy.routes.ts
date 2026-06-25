import { Router, Request, Response } from 'express';
import axios, { AxiosError } from 'axios';
import rateLimiter from '../middleware/rateLimiter.middleware';

const router = Router();

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3000';

const forwardRequest = (path: string) => async (req: Request, res: Response): Promise<void> => {
  try {
    const response = await axios({
      method: req.method,
      url: `${BACKEND_URL}${path}`,
      data: req.body,
      headers: { 'Content-Type': 'application/json' },
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status ?? 502;
    const data = axiosError.response?.data ?? {
      error: 'Bad Gateway',
      message: 'Backend service is unavailable',
    };
    res.status(status).json(data);
  }
};

router.post('/payments/insert', rateLimiter('payments/insert'), forwardRequest('/payments/insert'));
router.post('/payments/update', rateLimiter('payments/update'), forwardRequest('/payments/update'));

export default router;
