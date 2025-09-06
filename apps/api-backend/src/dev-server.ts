// Serveur de développement simple pour l'expert desk
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import expertTestRoutes from './routes/expert-test';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/expert', expertTestRoutes);

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Expert Desk API Test Server',
    timestamp: new Date().toISOString()
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Expert Desk Test Server running on port ${PORT}`);
  console.log(`📡 API disponible sur http://localhost:${PORT}`);
  console.log(`🔐 Route de connexion: POST http://localhost:${PORT}/api/expert/login`);
  console.log(`📋 Route des commandes: GET http://localhost:${PORT}/api/expert/orders/pending`);
});

export default app;
