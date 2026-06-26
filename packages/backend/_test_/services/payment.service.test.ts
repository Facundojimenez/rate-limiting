import { insertPayment, getPayments } from '../../src/services/payment.service';
import { mockPayments } from '../../src/mocks/payments.mock';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'test-uuid-1234'),
}));

describe('PaymentService', () => {
  describe('insertPayment', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-15T10:00:00.000Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('returns a payment object with the provided fields', () => {
      const dto = { userId: 'user-1', amount: 100, currency: 'USD' };
      const result = insertPayment(dto);

      expect(result.userId).toBe('user-1');
      expect(result.amount).toBe(100);
      expect(result.currency).toBe('USD');
    });

    it('returns a payment with status "pending"', () => {
      const result = insertPayment({ userId: 'u1', amount: 50, currency: 'ARS' });
      expect(result.status).toBe('pending');
    });

    it('returns a payment with a paymentId from randomUUID', () => {
      const result = insertPayment({ userId: 'u1', amount: 50, currency: 'ARS' });
      expect(result.paymentId).toBe('test-uuid-1234');
    });

    it('returns a payment with createdAt as an ISO string', () => {
      const result = insertPayment({ userId: 'u1', amount: 50, currency: 'ARS' });
      expect(result.createdAt).toBe('2024-01-15T10:00:00.000Z');
    });

    it('returns the correct shape', () => {
      const result = insertPayment({ userId: 'u2', amount: 200, currency: 'EUR' });
      expect(result).toMatchObject({
        paymentId: expect.any(String),
        userId: 'u2',
        amount: 200,
        currency: 'EUR',
        status: 'pending',
        createdAt: expect.any(String),
      });
    });
  });

  describe('getPayments', () => {
    it('returns the mock payments array', () => {
      const result = getPayments();
      expect(result).toBe(mockPayments);
    });

    it('returns an array', () => {
      expect(Array.isArray(getPayments())).toBe(true);
    });
  });
});
