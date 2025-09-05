// Mock Stripe API for MVP
// In production, this would connect to real Stripe API

interface PaymentData {
  level: number;
  upsells: {
    mandala: boolean;
    audio: boolean;
    rituel: boolean;
    pack: boolean;
  };
  userData: {
    firstName: string;
    email: string;
    birthDate: string;
    intention?: string;
    blockages?: string;
    familyHistory?: string;
  };
}

interface PaymentResponse {
  success: boolean;
  sessionId?: string;
  error?: string;
}

export const createPaymentSession = async (data: PaymentData): Promise<PaymentResponse> => {
  // Mock API call - replace with real Stripe integration
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Creating payment session for:', data);
      resolve({
        success: true,
        sessionId: `mock_session_${Date.now()}`
      });
    }, 1000);
  });
};

export const verifyPayment = async (sessionId: string): Promise<boolean> => {
  // Mock verification - replace with Stripe webhook verification
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Verifying payment for session:', sessionId);
      resolve(true);
    }, 500);
  });
};

// Types for Stripe integration
export interface StripeConfig {
  publishableKey: string;
  apiUrl: string;
}

export const stripeConfig: StripeConfig = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_mock',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000'
};
