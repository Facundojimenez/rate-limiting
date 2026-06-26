import { Router } from 'express';
import { insertPaymentController, getPaymentsController } from '../controllers/payment.controller';

const router = Router();

router.post('/', insertPaymentController);
router.get('/', getPaymentsController);

export default router;
