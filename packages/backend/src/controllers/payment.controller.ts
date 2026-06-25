import { Request, Response } from 'express';
import { insert, update } from '../services/payment.service';

export const insertPayment = (req: Request, res: Response): void => {
  const { userId, amount, currency } = req.body as {
    userId: string;
    amount: number;
    currency: string;
  };
  const result = insert({ userId, amount, currency });
  res.status(201).json(result);
};

export const updatePayment = (req: Request, res: Response): void => {
  const { userId, paymentId, status } = req.body as {
    userId: string;
    paymentId: string;
    status: string;
  };
  const result = update({ userId, paymentId, status });
  res.status(200).json(result);
};
