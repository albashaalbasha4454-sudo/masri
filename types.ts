export type SectionId =
  | 'sandwiches'
  | 'meals'
  | 'falafel'
  | 'eastern'
  | 'grills'
  | 'western'
  | 'pots'
  | 'bakery'
  | 'extras'
  | 'needs_section';

export type ProductReviewStatus = 'ok' | 'needs_price' | 'needs_section';

export interface Product {
  id: string;
  name: string;
  type: 'product' | 'service';
  description?: string;
  category?: string;
  sectionId?: SectionId;
  price: number;
  salePrice?: number;
  discountPercent?: number;
  image?: string;
  availableModifiers?: {name: string, price: number}[];
  isAvailable?: boolean;
  reviewStatus?: ProductReviewStatus;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  category?: string;
  sectionId?: SectionId;
  price: number;
  quantity: number;
  discount?: number;
  manualAddition?: number;
  notes?: string;
  modifiers?: {name: string, price: number}[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  email?: string;
  notes?: string;
}

export interface User {
  id:string;
  username: string;
  passwordHash: string;
  salt: string;
  role: 'admin' | 'cashier';
}

export type SessionUser = Pick<User, 'id' | 'username' | 'role'>;

export type OrderType = 'sale' | 'return' | 'delivery' | 'reservation' | 'dine_in' | 'takeaway';
export type OrderStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'delivered';
export type PaymentStatus = 'paid' | 'unpaid' | 'partial';

export interface Invoice {
  id: string;
  date: string;
  paidDate?: string;
  items: InvoiceItem[];
  total: number;
  type: OrderType;
  customerInfo?: {
    id?: string | null;
    name: string;
    phone: string;
    address?: string;
  };
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: 'cash' | 'card';
  source?: 'in-store' | 'facebook' | 'instagram' | 'whatsapp' | 'other';
  deliveryFee?: number;
  processedBy?: string;
  notes?: string;
}

export type ExpenseStatus = 'draft' | 'needs_review' | 'completed' | 'cancelled';
export type ReviewFlag = 'check' | 'question' | null;

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount?: number;
  category?: string;
  sectionId?: SectionId;
  accountId?: string;
  notes?: string;
  processedBy?: string;
  status?: ExpenseStatus;
  reviewFlag?: ReviewFlag;
  linkedTransactionId?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface ReturnRequest {
  id: string;
  requestDate: string;
  originalInvoiceId: string;
  requestedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  items: InvoiceItem[];
  processedBy?: string;
  processedDate?: string;
}

export interface FinancialAccount {
    id: string;
    name:string;
    type: 'cash' | 'bank' | 'other';
    userId?: string;
}

export type FinancialTransactionType =
    'sale_income'
    | 'expense'
    | 'capital_deposit'
    | 'return_refund'
    | 'transfer'
    | 'expense_reversal';

export interface FinancialTransaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    type: FinancialTransactionType;
    fromAccountId?: string;
    toAccountId?: string;
    relatedInvoiceId?: string;
    relatedExpenseId?: string;
    category?: string;
}

export interface Budget {
    id: string;
    name: string;
    targetAmount: number;
}

export interface TillCloseout {
  id: string;
  date: string;
  closedByUserId: string;
  closedByUsername: string;
  forDate: string;
  totalSales: number;
  totalReturns: number;
  totalCashSales?: number;
  totalCardSales?: number;
  totalExpenses?: number;
  netCashExpected: number;
  countedCash: number;
  difference: number;
  notes?: string;
  invoiceIds: string[];
}

export interface ActivityLog {
  id: string;
  userId: string;
  username: string;
  operation: string;
  description: string;
  date: string;
}
