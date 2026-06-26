import { Router } from 'express';
import rateLimiter from '../middleware/rateLimiter.middleware';
import forwardRequest from '../middleware/forwardRequest.middleware';

const router = Router();

router.post('/', rateLimiter('payments/insert'), forwardRequest('/payments'));
router.get('/', rateLimiter('payments/get'), forwardRequest('/payments'));

export default router;
