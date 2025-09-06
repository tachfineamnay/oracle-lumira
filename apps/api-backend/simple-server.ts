import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend running', timestamp: new Date().toISOString() });
});

// Create payment intent
app.post('/api/stripe/create-payment-intent', (req, res) => {
  const { level, formData } = req.body;
  
  console.log('Payment intent for level:', level, 'user:', formData?.email);
  
  // Level configuration
  const LEVELS: Record<string, { name: string; price: number; description: string }> = {
    '1': { name: 'Simple', price: 0, description: '1 carte + PDF 2p' },
    '2': { name: 'Intuitive', price: 1400, description: 'Profil âme + PDF 4p + audio 5min' },
    '3': { name: 'Alchimique', price: 2900, description: 'Blocages + rituel + PDF 6-8p + audio 12min' },
    '4': { name: 'Intégrale', price: 4900, description: 'Cartographie + mandala + PDF 15p + audio 25min' }
  };
  
  const levelConfig = LEVELS[level];
  if (!levelConfig) {
    return res.status(400).json({ error: 'Invalid level' });
  }
  
  const orderNumber = 'ORD-' + Date.now();
  console.log('Created order:', orderNumber);
  
  // For free level
  if (levelConfig.price === 0) {
    return res.json({
      orderId: 'order_' + Date.now(),
      orderNumber,
      requiresPayment: false,
      message: 'Order created successfully'
    });
  }
  
  // For paid levels
  res.json({
    clientSecret: 'pi_test_mock_' + Date.now() + '_secret_mock',
    orderId: 'order_' + Date.now(),
    orderNumber,
    requiresPayment: true
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log(`📱 Test at: http://localhost:5173/commande?level=3`);
});
