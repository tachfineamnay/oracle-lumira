// Quick test script for the payment intent endpoint
const productId = process.argv[2] || 'mystique';
const customerEmail = process.argv[3] || undefined;

const testPayload = {
  productId,
  ...(customerEmail && { customerEmail })
};

console.log('Testing POST /api/products/create-payment-intent');
console.log('Payload:', JSON.stringify(testPayload, null, 2));

fetch('https://oraclelumira.com/api/products/create-payment-intent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testPayload)
})
.then(response => {
  console.log('Status:', response.status, response.statusText);
  return response.json();
})
.then(data => {
  console.log('Response:', JSON.stringify(data, null, 2));
})
.catch(error => {
  console.error('Error:', error);
});
