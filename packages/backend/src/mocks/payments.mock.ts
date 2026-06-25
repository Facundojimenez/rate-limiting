import { PaymentDto } from "../dtos/payment.dto";

const mockPayments: PaymentDto[] = [
  {
    paymentId: '550e8400-e29b-41d4-a716-446655440000',
    userId: 'user-001',
    amount: 100.50,
    currency: 'USD',
    status: 'completed',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    paymentId: '550e8400-e29b-41d4-a716-446655440001',
    userId: 'user-002',
    amount: 250.75,
    currency: 'EUR',
    status: 'pending',
    createdAt: '2024-01-20T14:45:30Z',
  },
  {
    paymentId: '550e8400-e29b-41d4-a716-446655440002',
    userId: 'user-003',
    amount: 75.99,
    currency: 'ARS',
    status: 'failed',
    createdAt: '2024-01-22T09:15:45Z',
  },
];

export {
    mockPayments
}