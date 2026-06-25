import { Router } from 'express';
import { insertPaymentController, getPaymentsController } from '../controllers/payment.controller';

const router = Router();

router.post('/insert', insertPaymentController);
router.get('/get', getPaymentsController);

export default router;
