// Oracle Lumira - API service for product ordering
import { CreatePaymentIntentResponse, OrderStatus } from '../types/products';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export class ProductOrderService {
  /**
   * Create a payment intent for a product
   */
  static async createPaymentIntent(
    productId: string,
    customerEmail?: string
  ): Promise<CreatePaymentIntentResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/products/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          customerEmail,
          metadata: {
            source: 'spa-checkout',
            timestamp: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
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
      const response = await fetch(`${API_BASE_URL}/products/order/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get order status:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to get order status'
      );
    }
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
      const response = await fetch(`${API_BASE_URL}/health`);
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API health check failed:', error);
      throw error;
    }
  }
}

export default ProductOrderService;
