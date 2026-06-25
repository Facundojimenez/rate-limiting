import { InsertPaymentDto } from "./insertPayment.dto";

export interface PaymentDto extends InsertPaymentDto {
  paymentId: string;
  status: string;
  createdAt: string;
}
