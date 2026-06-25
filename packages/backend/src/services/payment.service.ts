import { randomUUID } from 'crypto';

interface InsertPaymentInput {
  userId: string;
  amount: number;
  currency: string;
}

interface UpdatePaymentInput {
  userId: string;
  paymentId: string;
  status: string;
}

export const insert = ({ userId, amount, currency }: InsertPaymentInput) => {
  return {
    paymentId: randomUUID(),
    userId,
    amount,
    currency,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
};

export const update = ({ userId, paymentId, status }: UpdatePaymentInput) => {
  return {
    paymentId,
    userId,
    status,
    updatedAt: new Date().toISOString(),
  };
};
