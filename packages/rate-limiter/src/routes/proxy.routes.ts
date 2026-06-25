import { Router } from 'express';
import rateLimiter from '../middleware/rateLimiter.middleware';
import forwardRequest from '../middleware/forwardRequest.middleware';

const router = Router();

router.post('/payments/insert', rateLimiter('payments/insert'), forwardRequest('/payments/insert'));
router.get('/payments/get', rateLimiter('payments/get'), forwardRequest('/payments/get'));

export default router;
