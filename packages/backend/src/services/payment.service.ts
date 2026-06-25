import { randomUUID } from 'crypto';
import { InsertPaymentDto } from '../dtos/insertPayment.dto';
import { mockPayments } from '../mocks/payments.mock';

export const insertPayment = ({ userId, amount, currency }: InsertPaymentDto) => {
  return {
    paymentId: randomUUID(),
    userId,
    amount,
    currency,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
};

export const getPayments = () => {
  return mockPayments;
};
