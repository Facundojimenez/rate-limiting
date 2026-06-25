import { Router } from 'express';
import { insertPayment, updatePayment } from '../controllers/payment.controller';

const router = Router();

router.post('/insert', insertPayment);
router.post('/update', updatePayment);

export default router;
