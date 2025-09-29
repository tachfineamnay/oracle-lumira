const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Mock data
let orders = [];
let orderCounter = 1;

// Health check
app.get('/api/healthz', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Create test order
app.post('/api/products/create-order', (req, res) => {
  const { level, amount, formData } = req.body;
  
  const order = {
    _id: `order_${orderCounter++}`,
    userId: `user_${Date.now()}`,
    userEmail: formData.email,
    level: level,
    levelName: ['', 'Simple', 'Intuitive', 'Alchimique', 'Intégrale'][level],
    amount: amount,
    currency: 'eur',
    status: 'pending',
    paymentIntentId: `pi_test_${Date.now()}`,
    orderNumber: `ORD-${Date.now()}`,
    formData: formData,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  orders.push(order);
  console.log('✅ Order created:', order._id);
  
  res.json({
    success: true,
    orderId: order._id,
    orderNumber: order.orderNumber
  });
});

// Simulate payment
app.post('/api/products/simulate-payment', (req, res) => {
  const { orderId, status } = req.body;
  
  const order = orders.find(o => o._id === orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  order.status = status;
  if (status === 'paid') {
    order.paidAt = new Date();
  }
  
  console.log('✅ Payment simulated:', orderId, status);
  
  res.json({
    success: true,
    orderId: order._id,
    status: order.status
  });
});

// Expert login
app.post('/api/expert/login', (req, res) => {
  const { email, password } = req.body;
  
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

// Get pending orders
app.get('/api/expert/orders/pending', (req, res) => {
  const pendingOrders = orders.filter(order => 
    (order.status === 'paid' || order.status === 'pending') && 
    !order.assignedExpert
  );
  
  console.log(`📋 Found ${pendingOrders.length} pending orders`);
  console.log('📋 All orders:', orders.map(o => `${o._id}: ${o.status}`));
  
  res.json({ orders: pendingOrders });
});

app.listen(PORT, () => {
  console.log(`✅ Test server running on port ${PORT}`);
  console.log(`🌐 Test: http://localhost:${PORT}/api/healthz`);
});