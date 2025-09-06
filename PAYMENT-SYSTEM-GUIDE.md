# Lumira Payment System - Complete Implementation Guide

## 🎯 Overview

This implementation provides a complete Stripe payment system for the Lumira Oracle platform with:

- **Frontend**: React/TypeScript payment interface with Stripe Elements
- **Backend**: Node.js/Express API with comprehensive payment processing
- **Database**: Enhanced MongoDB schemas for order and payment management
- **Security**: JWT authentication, rate limiting, and secure payment handling
- **Deployment**: Docker-based containerized deployment with Coolify

## 🏗️ Architecture

### Frontend Components
- `CommandeTemple.tsx` - Main payment page with Stripe integration
- `stripe.ts` - API service layer for payment operations
- Enhanced error handling and loading states
- Real-time payment status updates

### Backend Services
- `payments.ts` - Complete payment route handlers
- `EnhancedOrder.ts` - Advanced order model with payment tracking
- `auth.ts` - Authentication middleware
- Stripe webhook handling for payment events

### Key Features Implemented

#### 1. Payment Processing
- ✅ Stripe payment intent creation
- ✅ Secure payment confirmation
- ✅ Real-time payment status tracking
- ✅ Automatic order status updates
- ✅ Webhook handling for payment events
- ✅ Comprehensive error handling

#### 2. Order Management
- ✅ Enhanced order schema with payment details
- ✅ Session management for live consultations
- ✅ Refund calculation logic
- ✅ Order status tracking
- ✅ Customer information management

#### 3. Security & Authentication
- ✅ JWT-based authentication
- ✅ Optional auth for guest payments
- ✅ Rate limiting protection
- ✅ CORS configuration
- ✅ Input validation and sanitization

#### 4. Service Configurations
- ✅ Three-tier service structure (Basic/Premium/VIP)
- ✅ Dynamic pricing configuration
- ✅ Expert assignment system
- ✅ Duration and feature management

## 🚀 Quick Deployment

### Method 1: Automated Deployment (Recommended)

```powershell
# Windows PowerShell
.\deploy.ps1

# Optional parameters:
.\deploy.ps1 -SkipBuild    # Skip npm build steps
.\deploy.ps1 -Development  # Run in development mode
```

```bash
# Linux/Mac
chmod +x deploy.sh
./deploy.sh
```

### Method 2: Manual Deployment

1. **Environment Setup**
```bash
# Backend
cp apps/api-backend/.env.example apps/api-backend/.env
# Edit .env with your Stripe keys and database URL

# Frontend  
cp apps/main-app/.env.example apps/main-app/.env
# Edit .env with your API URL and Stripe publishable key
```

2. **Build Services**
```bash
# Backend
cd apps/api-backend
npm install
npm run build

# Frontend
cd ../main-app
npm install
npm run build

# Expert Desk
cd ../expert-desk
npm install
npm run build
```

3. **Start Services**
```bash
# From project root
docker-compose up --build -d
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/lumira-mvp

# Server
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://oraclelumira.com

# Authentication
JWT_SECRET=your-secure-secret-key
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Frontend (.env)
```env
# API
VITE_API_URL=http://localhost:3001/api

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# App
VITE_APP_NAME=Lumira Oracle
```

### Service Pricing Configuration

```typescript
const SERVICE_PRICING = {
  basic: {
    name: 'Consultation Basique',
    price: 2900,    // 29.00 EUR in cents
    duration: 30,   // minutes
  },
  premium: {
    name: 'Consultation Premium', 
    price: 7900,    // 79.00 EUR in cents
    duration: 60,   // minutes
  },
  vip: {
    name: 'Consultation VIP',
    price: 14900,   // 149.00 EUR in cents
    duration: 120,  // minutes
  }
}
```

## 🔗 API Endpoints

### Payment Routes (`/api/payments`)

#### Create Payment Intent
```http
POST /api/payments/create-payment-intent
Content-Type: application/json

{
  "level": "premium",
  "service": "premium",
  "expertId": "674123456789abcdef012345",
  "customerEmail": "client@example.com",
  "customerName": "Jean Dupont"
}
```

#### Confirm Payment
```http
POST /api/payments/confirm-payment
Content-Type: application/json

{
  "paymentIntentId": "pi_1234567890"
}
```

#### Get Order Details
```http
GET /api/payments/order/{orderId}
```

#### List User Orders (Authenticated)
```http
GET /api/payments/orders
Authorization: Bearer {jwt_token}
```

#### Stripe Webhook
```http
POST /api/payments/webhook
Stripe-Signature: {stripe_signature}
```

## 🐛 Troubleshooting

### Common Issues & Solutions

#### 1. ESBuild Template Literal Error
**Problem**: `Transform failed with 1 error: src/pages/CommandeTemple.tsx:33:20: ERROR: Invalid escape sequence`

**Solution**: Fixed by correcting template literal syntax:
```typescript
// ❌ Wrong
return_url: ${"$"}{window.location.origin}/confirmation

// ✅ Correct  
return_url: `${window.location.origin}/confirmation?order_id=${orderId}`
```

#### 2. Payment Intent Creation Fails
**Problem**: API returns 400 or 500 errors

**Solutions**:
- Verify Stripe secret key in backend `.env`
- Check MongoDB connection
- Validate expert ID exists in database
- Ensure service type is valid ('basic', 'premium', 'vip')

#### 3. CORS Issues
**Problem**: Frontend can't connect to backend API

**Solution**: Update CORS configuration in `server.ts`:
```typescript
const allowedOrigins = [
  'https://oraclelumira.com',
  'http://localhost:3000',
  'http://localhost:5173' // Add your frontend URL
];
```

#### 4. Docker Build Failures
**Problem**: Docker containers fail to start

**Solutions**:
- Ensure all `.env` files are properly configured
- Check Docker Desktop is running
- Verify port availability (80, 3001, 3002)
- Clean Docker cache: `docker system prune -a`

## 📊 Testing Payment Flow

### Test Cards (Stripe Test Mode)
```
Success: 4242424242424242
Decline: 4000000000000002
3D Secure: 4000002760003184
```

### Manual Test Flow
1. Navigate to payment page: `http://localhost:80/commande?level=premium&service=premium&expert=Expert%20Test`
2. Fill payment form with test card
3. Submit payment
4. Verify success redirect to confirmation page
5. Check order status in database

### API Testing
```bash
# Test payment intent creation
curl -X POST http://localhost:3001/api/payments/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{
    "level": "premium",
    "service": "premium", 
    "expertId": "674123456789abcdef012345",
    "customerEmail": "test@example.com"
  }'
```

## 🔒 Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Stripe Keys**: Use test keys in development, live keys in production
3. **JWT Secrets**: Generate strong, unique secrets for each environment
4. **HTTPS**: Always use HTTPS in production
5. **Webhook Validation**: Verify Stripe webhook signatures
6. **Rate Limiting**: Implemented to prevent abuse
7. **Input Validation**: All inputs validated and sanitized

## 📈 Monitoring & Logging

### Application Logs
- Backend logs: `apps/api-backend/logs/`
- Docker logs: `docker-compose logs -f`

### Key Metrics to Monitor
- Payment success/failure rates
- API response times
- Order completion rates
- Error frequencies

## 🚀 Production Deployment

### Pre-deployment Checklist
- [ ] All environment variables configured
- [ ] Stripe webhook endpoints configured
- [ ] Database backup strategy in place
- [ ] SSL certificates configured
- [ ] Domain DNS configured
- [ ] Monitoring and alerting setup

### Coolify Deployment
1. Connect GitHub repository to Coolify
2. Configure environment variables in Coolify dashboard
3. Set up custom domain
4. Configure SSL/TLS
5. Deploy and test

## 🎉 Success Criteria

The payment system is successfully deployed when:

1. ✅ Frontend builds without errors
2. ✅ Backend API starts and connects to database
3. ✅ Stripe payment intents can be created
4. ✅ Payment flow completes successfully
5. ✅ Orders are properly stored in database
6. ✅ Webhooks process payment events
7. ✅ All Docker services are running
8. ✅ API health checks pass

---

**Congratulations!** 🎊 Your complete Stripe payment system is now deployed and ready for testing. The system provides a robust foundation for processing payments, managing orders, and delivering expert consultations.

For support or questions, refer to the API documentation or check the application logs for detailed error information.
