const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

// Données de test
const testExperts = [
  {
    _id: '674b7e123456789012345001',
    name: 'Oracle Maya',
    email: 'maya@lumira-oracle.com',
    specialties: ['Niveau 1', 'Niveau 2', 'Niveau 3'],
    expertise: ['Tarot', 'Numérologie', 'Astrologie'],
    isActive: true,
    statistics: {
      totalOrders: 15,
      completedOrders: 12,
      averageRating: 4.8,
      totalEarnings: 450.0
    }
  },
  {
    _id: '674b7e123456789012345002',
    name: 'Oracle Sophia',
    email: 'sophia@lumira-oracle.com',
    specialties: ['Niveau 2', 'Niveau 3', 'Niveau 4'],
    expertise: ['Médiumnité', 'Pendule', 'Cristaux'],
    isActive: true,
    statistics: {
      totalOrders: 23,
      completedOrders: 20,
      averageRating: 4.9,
      totalEarnings: 780.0
    }
  }
];

let testOrders = [
  {
    _id: '674b7e123456789012345101',
    orderNumber: 'LUM-2024-001',
    level: 1,
    levelName: 'Niveau 1 - Guidance Spirituelle',
    customerEmail: 'client1@email.com',
    customerName: 'Marie Dupont',
    status: 'paid',
    amount: 29.99,
    currency: 'EUR',
    createdAt: new Date('2024-12-01T10:30:00Z'),
    updatedAt: new Date('2024-12-01T10:30:00Z'),
    details: {
      birthDate: '1985-03-15',
      birthTime: '14:30',
      birthPlace: 'Paris, France',
      question: 'Je traverse une période difficile dans ma vie professionnelle et j\'aimerais des conseils spirituels.',
      specificRequest: 'Guidance générale pour mon avenir professionnel'
    },
    payment: {
      stripeSessionId: 'cs_test_123',
      stripePaymentIntentId: 'pi_test_123',
      paidAt: new Date('2024-12-01T10:30:00Z')
    }
  },
  {
    _id: '674b7e123456789012345102',
    orderNumber: 'LUM-2024-002',
    level: 2,
    levelName: 'Niveau 2 - Lecture Avancée',
    customerEmail: 'client2@email.com',
    customerName: 'Sophie Martin',
    status: 'paid',
    amount: 49.99,
    currency: 'EUR',
    createdAt: new Date('2024-12-01T11:15:00Z'),
    updatedAt: new Date('2024-12-01T11:15:00Z'),
    details: {
      birthDate: '1990-07-22',
      birthTime: '09:15',
      birthPlace: 'Lyon, France',
      question: 'Questions sur ma relation amoureuse et mes choix de vie.',
      specificRequest: 'Lecture tarot approfondie sur l\'amour et les relations'
    },
    payment: {
      stripeSessionId: 'cs_test_456',
      stripePaymentIntentId: 'pi_test_456',
      paidAt: new Date('2024-12-01T11:15:00Z')
    }
  },
  {
    _id: '674b7e123456789012345103',
    orderNumber: 'LUM-2024-003',
    level: 3,
    levelName: 'Niveau 3 - Consultation Complète',
    customerEmail: 'client3@email.com',
    customerName: 'Jean Moreau',
    status: 'paid',
    amount: 79.99,
    currency: 'EUR',
    createdAt: new Date('2024-12-01T14:20:00Z'),
    updatedAt: new Date('2024-12-01T14:20:00Z'),
    details: {
      birthDate: '1978-11-03',
      birthTime: '16:45',
      birthPlace: 'Marseille, France',
      question: 'Questionnement global sur ma voie de vie et mes objectifs spirituels.',
      specificRequest: 'Consultation complète avec thème astral et guidance spirituelle'
    },
    payment: {
      stripeSessionId: 'cs_test_789',
      stripePaymentIntentId: 'pi_test_789',
      paidAt: new Date('2024-12-01T14:20:00Z')
    }
  },
  {
    _id: '674b7e123456789012345104',
    orderNumber: 'LUM-2024-004',
    level: 1,
    levelName: 'Niveau 1 - Guidance Spirituelle',
    customerEmail: 'client4@email.com',
    customerName: 'Anna Leroy',
    status: 'paid',
    amount: 29.99,
    currency: 'EUR',
    createdAt: new Date('2024-12-02T08:45:00Z'),
    updatedAt: new Date('2024-12-02T08:45:00Z'),
    details: {
      birthDate: '1992-09-12',
      birthTime: '11:20',
      birthPlace: 'Toulouse, France',
      question: 'Je me sens perdue et j\'ai besoin de clarté sur ma direction spirituelle.',
      specificRequest: 'Guidance pour retrouver mon chemin spirituel'
    },
    payment: {
      stripeSessionId: 'cs_test_101',
      stripePaymentIntentId: 'pi_test_101',
      paidAt: new Date('2024-12-02T08:45:00Z')
    }
  }
];

const testStats = {
  pending: 4,
  paid: 4,
  processing: 0,
  completed: 0,
  treatedToday: 0,
  totalTreated: 12
};

const app = express();
const PORT = 3001;
const JWT_SECRET = 'lumira-expert-secret-key-2024';

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware d'authentification
const authenticateExpert = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token d\'accès requis' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.expert = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token invalide' });
  }
};

// Routes

// POST /api/expert/login - Connexion expert
app.post('/api/expert/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    console.log('🔐 Tentative de connexion:', { email, password });

    const expert = testExperts.find(e => e.email === email);

    if (!expert) {
      console.log('❌ Expert non trouvé:', email);
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    const validPasswords = ['maya123', 'sophia123'];
    if (!validPasswords.includes(password)) {
      console.log('❌ Mot de passe incorrect:', password);
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    console.log('✅ Connexion réussie pour:', expert.name);

    const token = jwt.sign(
      { 
        id: expert._id, 
        email: expert.email, 
        name: expert.name 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Connexion réussie',
      expert: {
        _id: expert._id,
        name: expert.name,
        email: expert.email,
        specialties: expert.specialties,
        expertise: expert.expertise,
        statistics: expert.statistics
      },
      token
    });
  } catch (error) {
    console.error('❌ Erreur lors de la connexion:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// GET /api/expert/orders/pending - Récupérer les commandes en attente
app.get('/api/expert/orders/pending', authenticateExpert, async (req, res) => {
  try {
    console.log('📋 Récupération des commandes en attente pour:', req.expert.name);
    
    const pendingOrders = testOrders.filter(order => order.status === 'paid' && !order.assignedExpert);
    
    console.log(`✅ ${pendingOrders.length} commandes en attente trouvées`);
    
    res.json({
      orders: pendingOrders,
      total: pendingOrders.length
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des commandes:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des commandes' });
  }
});

// GET /api/expert/orders/assigned - Récupérer les commandes assignées
app.get('/api/expert/orders/assigned', authenticateExpert, async (req, res) => {
  try {
    console.log('📋 Récupération des commandes assignées pour:', req.expert.name);
    
    const assignedOrders = testOrders.filter(order => order.assignedExpert === req.expert.id);
    
    console.log(`✅ ${assignedOrders.length} commandes assignées trouvées`);
    
    res.json({
      orders: assignedOrders,
      total: assignedOrders.length
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des commandes assignées:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des commandes assignées' });
  }
});

// POST /api/expert/orders/:id/assign - Prendre en charge une commande
app.post('/api/expert/orders/:id/assign', authenticateExpert, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🎯 Assignation de la commande:', id, 'à l\'expert:', req.expert.name);
    
    const orderIndex = testOrders.findIndex(order => order._id === id);
    
    if (orderIndex === -1) {
      console.log('❌ Commande non trouvée:', id);
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    const order = testOrders[orderIndex];

    if (order.status !== 'paid') {
      console.log('❌ Commande non payée:', order.status);
      return res.status(400).json({ error: 'Cette commande ne peut pas être prise en charge' });
    }

    if (order.assignedExpert) {
      console.log('❌ Commande déjà assignée:', order.assignedExpert);
      return res.status(400).json({ error: 'Cette commande est déjà assignée' });
    }

    testOrders[orderIndex] = {
      ...order,
      status: 'processing',
      assignedExpert: req.expert.id,
      assignedAt: new Date(),
      updatedAt: new Date()
    };

    console.log('✅ Commande assignée avec succès à:', req.expert.name);

    res.json({
      message: 'Commande prise en charge avec succès',
      order: testOrders[orderIndex]
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'assignation de la commande:', error);
    res.status(500).json({ error: 'Erreur lors de l\'assignation de la commande' });
  }
});

// GET /api/expert/profile - Récupérer le profil
app.get('/api/expert/profile', authenticateExpert, async (req, res) => {
  try {
    console.log('👤 Récupération du profil pour:', req.expert.name);
    
    const expert = testExperts.find(e => e._id === req.expert.id);
    
    if (!expert) {
      console.log('❌ Expert non trouvé:', req.expert.id);
      return res.status(404).json({ error: 'Expert non trouvé' });
    }

    console.log('✅ Profil récupéré pour:', expert.name);

    res.json({
      expert: {
        _id: expert._id,
        name: expert.name,
        email: expert.email,
        specialties: expert.specialties,
        expertise: expert.expertise,
        statistics: expert.statistics
      }
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du profil:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
  }
});

// GET /api/expert/stats - Récupérer les statistiques
app.get('/api/expert/stats', authenticateExpert, async (req, res) => {
  try {
    console.log('📊 Récupération des statistiques pour:', req.expert.name);
    res.json(testStats);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

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
  console.log('');
  console.log('🧪 Comptes de test:');
  console.log('  📧 maya@lumira-oracle.com / 🔑 maya123');
  console.log('  📧 sophia@lumira-oracle.com / 🔑 sophia123');
});
