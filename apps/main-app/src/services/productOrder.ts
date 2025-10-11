// Oracle Lumira - API service for product ordering (Production Ready)
import { CreatePaymentIntentResponse, OrderStatus, Product } from '../types/products';
import { apiRequest } from '../utils/api';

export class ProductOrderService {
  /**
   * Create a payment intent for a product
   */
  static async createPaymentIntent(
    productId: string,
    customerEmail?: string,
    customerName?: string,      // 🆕 Customer full name
    customerPhone?: string       // 🆕 Customer phone
  ): Promise<CreatePaymentIntentResponse> {
    try {
      const DEBUG = import.meta.env.DEV || import.meta.env.VITE_DEBUG === 'true';
      if (DEBUG) console.log('Creating payment intent for product:', productId);
      
      const response = await apiRequest<CreatePaymentIntentResponse>('/products/create-payment-intent', {
        method: 'POST',
        body: JSON.stringify({
          productId,
          customerEmail,
          customerName,      // 🆕 Pass to backend
          customerPhone,     // 🆕 Pass to backend
          metadata: {
            source: 'spa-checkout',
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (DEBUG) console.log('Payment intent created:', response.orderId);
      return response;
    } catch (error) {
      console.error('Failed to create payment intent:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to create payment intent'
      );
    }
  }

  /**
   * Get order status by order ID
   */
  static async getOrderStatus(orderId: string): Promise<OrderStatus> {
    try {
      const DEBUG = import.meta.env.DEV || import.meta.env.VITE_DEBUG === 'true';
      if (DEBUG) console.log('Fetching order status:', orderId);
      
      const response = await apiRequest<OrderStatus>(`/products/orders/${orderId}`, {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Failed to get order status:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to get order status'
      );
    }
  }

  /**
   * Fetch product catalog from backend
   */
  static async getCatalog(): Promise<Product[]> {
    const res = await apiRequest<{ products: Product[] }>(`/products`, { method: 'GET' });
    return res.products;
  }

  /**
   * Format price for display
   */
  static formatPrice(amountCents: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amountCents / 100);
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Get API health status
   */
  static async getHealthStatus(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await apiRequest<{ status: string; timestamp: string }>('/healthz', {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('API health check failed:', error);
      throw error;
    }
  }
}

// Export par défaut pour compatibilité avec les imports existants
export default ProductOrderService;
