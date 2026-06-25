import { Request, Response } from 'express';
import { insertPaymentController, getPaymentsController } from '../../src/controllers/payment.controller';
import * as PaymentsService from '../../src/services/payment.service';

jest.mock('../../src/services/payment.service');

const mockInsertPayment = PaymentsService.insertPayment as jest.MockedFunction<typeof PaymentsService.insertPayment>;
const mockGetPayments = PaymentsService.getPayments as jest.MockedFunction<typeof PaymentsService.getPayments>;

const mockRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('PaymentController', () => {
  afterEach(() => jest.clearAllMocks());

  describe('insertPaymentController', () => {
    it('calls insertPayment with the request body and responds with 201', () => {
      const body = { userId: 'u1', amount: 100, currency: 'USD' };
      const req = { body } as Request;
      const res = mockRes();

      mockInsertPayment.mockReturnValue({
        paymentId: 'uuid-1',
        userId: 'u1',
        amount: 100,
        currency: 'USD',
        status: 'pending',
        createdAt: '2024-01-01T00:00:00.000Z',
      } as any);

      insertPaymentController(req, res);

      expect(mockInsertPayment).toHaveBeenCalledWith(body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });

    it('passes the full body to the service', () => {
      const body = { userId: 'u2', amount: 500, currency: 'ARS' };
      const req = { body } as Request;
      const res = mockRes();
      mockInsertPayment.mockReturnValue({} as any);

      insertPaymentController(req, res);

      expect(mockInsertPayment).toHaveBeenCalledWith(body);
    });
  });

  describe('getPaymentsController', () => {
    it('calls getPayments and responds with 200', () => {
      const payments = [{ paymentId: 'p1', userId: 'u1', amount: 100, currency: 'USD', status: 'pending', createdAt: '' }];
      const req = {} as Request;
      const res = mockRes();

      mockGetPayments.mockReturnValue(payments);

      getPaymentsController(req, res);

      expect(mockGetPayments).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
    });

    it('responds with the array returned by the service', () => {
      const req = {} as Request;
      const res = mockRes();
      const payments = [{ paymentId: 'p1', userId: 'u3', amount: 0, currency: 'EUR', status: 'pending', createdAt: '' }];

      mockGetPayments.mockReturnValue(payments);

      getPaymentsController(req, res);

      expect(res.json).toHaveBeenCalled();
    });
  });
});
