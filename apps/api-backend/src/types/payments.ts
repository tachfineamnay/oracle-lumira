// Oracle Lumira - Type definitions for orders and payments

export interface CreatePaymentIntentRequest {
  productId: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  orderId: string;
  amount: number;
  currency: string;
  productName: string;
}

export interface Order {
  id: string;
  productId: string;
  customerId?: string;
  customerEmail?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  paymentIntentId: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  metadata?: Record<string, any>;
}

export interface OrderStatusResponse {
  order: Order;
  product: {
    id: string;
    name: string;
    level: string;
  };
  accessGranted: boolean;
  sanctuaryUrl?: string;
}

export interface StripeWebhookPayload {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
}

export interface PaymentSuccessMetadata {
  productId: string;
  customerEmail?: string;
  orderId: string;
  level: string;
}
