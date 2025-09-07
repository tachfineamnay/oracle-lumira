// Container Internal Test - Environment Variables & Payment Intent
// Usage: node check-env.js

console.log('=== Environment Variable Check ===');
console.log('NODE_ENV:', process.env.NODE_ENV || 'UNSET');
console.log('PORT:', process.env.PORT || 'UNSET');
console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? `SET (${process.env.STRIPE_SECRET_KEY.length} chars)` : 'UNSET');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? `SET (${process.env.MONGODB_URI.length} chars)` : 'UNSET');

if (!process.env.STRIPE_SECRET_KEY) {
  console.log('❌ STRIPE_SECRET_KEY is missing - payment intent will fail');
  process.exit(1);
}

console.log('\n=== Testing Payment Intent Creation ===');

// Simulate Stripe PaymentIntent creation
const productConfig = {
  id: 'mystique',
  name: 'Niveau Mystique',
  amountCents: 9900,
  currency: 'eur'
};

const mockPaymentIntent = {
  id: 'pi_test_' + Math.random().toString(36).substring(7),
  client_secret: 'pi_test_secret_' + Math.random().toString(36).substring(7),
  amount: productConfig.amountCents,
  currency: productConfig.currency,
  status: 'requires_payment_method'
};

console.log('✅ Mock payment intent created:', {
  id: mockPaymentIntent.id,
  amount: mockPaymentIntent.amount,
  currency: mockPaymentIntent.currency,
  clientSecret: mockPaymentIntent.client_secret
});

console.log('\n=== Internal API Test ===');

const testPayload = {
  productId: 'mystique',
  customerEmail: 'test@example.com'
};

const testInternalAPI = async () => {
  try {
    const response = await fetch('http://127.0.0.1:3000/api/products/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    console.log('Internal API Status:', response.status);
    const data = await response.json();
    console.log('Internal API Response:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('✅ Internal API test successful');
    } else {
      console.log('❌ Internal API test failed');
    }
  } catch (error) {
    console.error('❌ Internal API test error:', error.message);
  }
};

// Only test API if it might be running
if (process.env.PORT) {
  testInternalAPI();
}
