const crypto = require('crypto');

const secret = 'a2c521e7dae2f31692766a8ea9e8d5d22b397e13d48e1ec51c95f2eafc8ffeac';
const orderId = '691de338af0c1573918e9fc1';
const orderNumber = 'LU251119392981';
const stringToSign = `${orderId}:${orderNumber}`;

const signature = crypto.createHmac('sha256', secret).update(stringToSign).digest('hex');

console.log('String to sign:', stringToSign);
console.log('Calculated Signature:', signature);
console.log('Expected Signature:  ', '17d1a4c44941f64a3ed808e804d53e518b7f44ceccaeac635f893bd168e8f');
console.log('Match:', signature === '17d1a4c44941f64a3ed808e804d53e518b7f44ceccaeac635f893bd168e8f');
