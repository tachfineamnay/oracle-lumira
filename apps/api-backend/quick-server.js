const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3001;

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'https://oraclelumira.com'],
  credentials: true
}));

app.use(express.json());

// In-memory storage for testing (replace with MongoDB in production)
const orders = [];
const users = [];

// Test health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Quick Test Server', timestamp: new Date().toLocaleString() });
});

// Create payment intent
app.post('/api/stripe/create-payment-intent', async (req, res) => {
  try {
    const { level, formData } = req.body;
    
    console.log('Creating payment intent for:', { level, formData });
    
    // Level configuration
    const LEVELS = {
      1: { name: 'Simple', price: 0, description: '1 carte + PDF 2p' },
      2: { name: 'Intuitive', price: 1400, description: 'Profil âme + PDF 4p + audio 5min' },
      3: { name: 'Alchimique', price: 2900, description: 'Blocages + rituel + PDF 6-8p + audio 12min' },
      4: { name: 'Intégrale', price: 4900, description: 'Cartographie + mandala + PDF 15p + audio 25min' }
    };
    
    const levelConfig = LEVELS[level];
    if (!levelConfig) {
      return res.status(400).json({ error: 'Invalid level' });
    }
    
    // Find or create user (in-memory)
    let user = users.find(u => u.email === formData.email);
    if (!user) {
      user = {
        id: 'user_' + Date.now(),
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        createdAt: new Date()
      };
      users.push(user);
    }
    
    // Create order (in-memory)
    const orderNumber = 'ORD-' + Date.now();
    const order = {
      id: 'order_' + Date.now(),
      orderNumber,
      userEmail: formData.email,
      level: parseInt(level),
      formData,
      price: levelConfig.price,
      paymentIntentId: 'pi_test_' + Date.now() + '_' + level,
      status: 'pending',
      createdAt: new Date(),
      assignedTo: null
    };
    orders.push(order);
    
    console.log('Order created:', orderNumber);
    console.log('Total orders in system:', orders.length);
    
    // For level 1 (free), no payment needed
    if (levelConfig.price === 0) {
      return res.json({
        orderId: order.id,
        orderNumber: order.orderNumber,
        requiresPayment: false,
        message: 'Order created successfully - processing will begin shortly'
      });
    }
    
    // Mock response for Stripe testing
    const mockClientSecret = 'pi_test_1234567890_secret_test123456789';
    
    res.json({
      clientSecret: mockClientSecret,
      orderId: order.id,
      orderNumber: order.orderNumber,
      requiresPayment: true
    });
    
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get orders for expert (for testing desk integration)
app.get('/api/expert/orders/pending', async (req, res) => {
  try {
    const pendingOrders = orders.filter(order => order.status === 'pending');
    console.log('Fetching pending orders:', pendingOrders.length);
    res.json(pendingOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Expert login (mock)
app.post('/api/expert/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('Expert login attempt:', { email });
  
  if (email === 'expert@oraclelumira.com' && password === 'Lumira2025L') {
    res.json({
      success: true,
      token: 'mock_jwt_token_' + Date.now(),
      expert: {
        id: 'expert_1',
        email: 'expert@oraclelumira.com',
        name: 'Expert Oracle'
      }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Get expert stats
app.get('/api/expert/stats', (req, res) => {
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const completedCount = orders.filter(o => o.status === 'completed').length;
  const totalOrders = orders.length;
  
  res.json({
    totalOrders,
    pendingOrders: pendingCount,
    completedOrders: completedCount,
    revenue: orders.reduce((sum, order) => sum + (order.price || 0), 0) / 100 // Convert from cents
  });
});

app.listen(PORT, () => {
  console.log(`✅ Quick test server running on port ${PORT}`);
  console.log(`🌐 Test the payment flow at: http://localhost:5173/commande?level=3`);
  console.log(`🏢 Test the expert desk at: https://desk.oraclelumira.com`);
});
