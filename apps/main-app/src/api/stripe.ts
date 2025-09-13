import { getApiBaseUrl } from '../utils/api';
const API_BASE_URL = getApiBaseUrl();

export interface CreatePaymentIntentRequest {
  level: string;
  service: 'basic' | 'premium' | 'vip';
  expertId: string;
  userId?: string;
  customerEmail?: string;
  customerName?: string;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  orderId: string;
  amount: number;
  serviceName: string;
}

export interface ConfirmPaymentRequest {
  paymentIntentId: string;
}

export interface ConfirmPaymentResponse {
  success: boolean;
  order: {
    id: string;
    status: string;
    paymentStatus: string;
    amount: number;
    service: string;
  };
}

export interface OrderResponse {
  order: {
    id: string;
    status: string;
    paymentStatus: string;
    amount: number;
    service: string;
    level: string;
    duration: number;
    expert?: {
      name: string;
      specialties: string[];
      rating: number;
    };
    customerEmail?: string;
    customerName?: string;
    createdAt: string;
    paidAt?: string;
  };
}

class StripeAPI {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('authToken');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async createPaymentIntent(data: CreatePaymentIntentRequest): Promise<CreatePaymentIntentResponse> {
    return this.request<CreatePaymentIntentResponse>('/payments/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async confirmPayment(data: ConfirmPaymentRequest): Promise<ConfirmPaymentResponse> {
    return this.request<ConfirmPaymentResponse>('/payments/confirm-payment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOrder(orderId: string): Promise<OrderResponse> {
    return this.request<OrderResponse>(`/payments/order/${orderId}`);
  }

  async getUserOrders(): Promise<{ orders: OrderResponse['order'][] }> {
    return this.request<{ orders: OrderResponse['order'][] }>('/payments/orders');
  }

  // Utility method to get service configuration
  getServiceConfig() {
    return {
      basic: {
        name: 'Consultation Basique',
        price: 29,
        duration: 30,
        features: [
          'Analyse personnalisée de votre situation',
          'Conseils pratiques adaptés',
          'Support par chat pendant 7 jours'
        ]
      },
      premium: {
        name: 'Consultation Premium',
        price: 79,
        duration: 60,
        features: [
          'Analyse approfondie et rapport détaillé',
          'Session vidéo personnalisée',
          'Plan d\'action sur mesure',
          'Support prioritaire pendant 30 jours',
          'Ressources exclusives'
        ]
      },
      vip: {
        name: 'Consultation VIP',
        price: 149,
        duration: 120,
        features: [
          'Analyse complète multi-dimensionnelle',
          'Sessions vidéo illimitées pendant 1 mois',
          'Coaching personnalisé',
          'Accès aux experts spécialisés',
          'Support 24/7 pendant 90 jours',
          'Garantie satisfaction'
        ]
      }
    };
  }

  // Helper method to validate service type
  isValidService(service: string): service is 'basic' | 'premium' | 'vip' {
    return ['basic', 'premium', 'vip'].includes(service);
  }

  // Helper method to format price
  formatPrice(amount: number, currency = 'EUR'): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  // Helper method to get level display name
  getLevelDisplayName(level: string): string {
    const levelNames: Record<string, string> = {
      '1': 'Simple',
      '2': 'Intuitive',
      '3': 'Alchimique',
      '4': 'Intégrale',
      simple: 'Simple',
      intuitive: 'Intuitive',
      alchimique: 'Alchimique',
      integrale: 'Intégrale',
    };
    return levelNames[level.toLowerCase()] || level;
  }
}

export const stripeAPI = new StripeAPI();
export default stripeAPI;
