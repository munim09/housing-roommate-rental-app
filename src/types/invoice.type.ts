/** `Invoice.type` — rent installments and utility bills. */
export type InvoiceKind = "RENT" | "UTILITY";

/** `Invoice.status` (Prisma `BillStatus`). */
export type BillStatus = "PENDING" | "PAID" | "CANCELLED";

/** `Payment.status` (Prisma `PaymentStatus`). */
export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

/** Amounts arrive as Decimal strings ("25000", "150.5"). */
export type MoneyValue = string | number;

export interface InvoiceParty {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
}

/** Payment rows embedded in an invoice by `/tenant/invoices/by-stay`. */
export interface InvoicePayment {
  id: string;
  amount: MoneyValue;
  status: PaymentStatus;
  transactionReference: string;
  paidAt?: string | null;
}

export interface Invoice {
  id: string;
  stayId: string;
  payerId: string;
  receiverId: string;
  type: InvoiceKind;
  amount: MoneyValue;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  dueDate: string;
  status: BillStatus;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
  receiver?: InvoiceParty;
  payments?: InvoicePayment[];
}

/** Body of `POST /payments/create/:invoiceId`. */
export interface PaymentInitiation {
  gatewayUrl: string;
  tranId: string;
}

/** `data` of `GET /payments/check/:transactionReference`. */
export interface PaymentRecord {
  id: string;
  stayId: string;
  invoiceId?: string | null;
  payerId?: string;
  receiverId?: string;
  type: InvoiceKind;
  amount: MoneyValue;
  status: PaymentStatus;
  transactionReference: string;
  gatewayResponse?: unknown;
  paidAt?: string | null;
  failureReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
