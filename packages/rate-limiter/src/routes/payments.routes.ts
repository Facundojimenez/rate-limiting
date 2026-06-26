import { Router } from 'express';
import rateLimiter from '../middleware/rateLimiter.middleware';
import forwardRequest from '../middleware/forwardRequest.middleware';

const router = Router();

router.post('/', rateLimiter('rate-limited-payments/insert'), forwardRequest('/payments'));
router.get('/', rateLimiter('rate-limited-payments/get'), forwardRequest('/payments'));

export default router;
