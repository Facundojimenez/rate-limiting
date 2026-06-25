import { Request, Response } from 'express';
import { InsertPaymentDto } from '../dtos/insertPayment.dto';
import * as PaymentsService from '../services/payment.service';

export const insertPaymentController = (req: Request, res: Response) => {
  const body = req.body as InsertPaymentDto;

  const result = PaymentsService.insertPayment(body);
  res.status(201).json(result);
};

export const getPaymentsController = (req: Request, res: Response) => {
  const result = PaymentsService.getPayments();
  res.status(200).json(result);
};
