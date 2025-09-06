import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { testExperts, testOrders, testStats } from '../data/testData';

const router = express.Router();

// Extension de la Request pour inclure les données expert
interface AuthenticatedRequest extends Request {
  expert?: {
    id: string;
    email: string;
    name: string;
  };
}

// Middleware d'authentification pour les experts
const authenticateExpert = (req: AuthenticatedRequest, res: Response, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token d\'accès requis' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    req.expert = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token invalide' });
  }
};

// POST /api/expert/login - Connexion expert
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    console.log('🔐 Tentative de connexion:', { email, password });

    // Recherche de l'expert dans les données de test
    const expert = testExperts.find(e => e.email === email);

    if (!expert) {
      console.log('❌ Expert non trouvé:', email);
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    // Vérification du mot de passe (pour le test, on accepte maya123 et sophia123)
    const validPasswords = ['maya123', 'sophia123'];
    if (!validPasswords.includes(password)) {
      console.log('❌ Mot de passe incorrect:', password);
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    console.log('✅ Connexion réussie pour:', expert.name);

    // Génération du token JWT
    const token = jwt.sign(
      { 
        id: expert._id, 
        email: expert.email, 
        name: expert.name 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    const { password: _, ...expertWithoutPassword } = expert;

    res.json({
      message: 'Connexion réussie',
      expert: expertWithoutPassword,
      token
    });
  } catch (error) {
    console.error('❌ Erreur lors de la connexion:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// GET /api/expert/orders/pending - Récupérer les commandes en attente
router.get('/orders/pending', authenticateExpert, async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('📋 Récupération des commandes en attente pour:', req.expert?.name);
    
    // Dans le mode test, on retourne toutes les commandes payées comme en attente
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

// GET /api/expert/orders/assigned - Récupérer les commandes assignées à l'expert
router.get('/orders/assigned', authenticateExpert, async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('📋 Récupération des commandes assignées pour:', req.expert?.name);
    
    // Dans le mode test, on retourne des commandes assignées à l'expert
    const assignedOrders = testOrders.filter(order => order.assignedExpert === req.expert?.id);
    
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
router.post('/orders/:id/assign', authenticateExpert, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    console.log('🎯 Assignation de la commande:', id, 'à l\'expert:', req.expert?.name);
    
    // Trouver la commande dans les données de test
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

    // Simuler l'assignation
    testOrders[orderIndex] = {
      ...order,
      status: 'processing',
      assignedExpert: req.expert?.id,
      assignedAt: new Date(),
      updatedAt: new Date()
    };

    console.log('✅ Commande assignée avec succès à:', req.expert?.name);

    res.json({
      message: 'Commande prise en charge avec succès',
      order: testOrders[orderIndex]
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'assignation de la commande:', error);
    res.status(500).json({ error: 'Erreur lors de l\'assignation de la commande' });
  }
});

// GET /api/expert/profile - Récupérer le profil de l'expert connecté
router.get('/profile', authenticateExpert, async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('👤 Récupération du profil pour:', req.expert?.name);
    
    // Trouver l'expert dans les données de test
    const expert = testExperts.find(e => e._id === req.expert?.id);
    
    if (!expert) {
      console.log('❌ Expert non trouvé:', req.expert?.id);
      return res.status(404).json({ error: 'Expert non trouvé' });
    }

    const { password: _, ...expertWithoutPassword } = expert;

    console.log('✅ Profil récupéré pour:', expert.name);

    res.json({
      expert: expertWithoutPassword
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du profil:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
  }
});

// GET /api/expert/stats - Récupérer les statistiques de l'expert
router.get('/stats', authenticateExpert, async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('📊 Récupération des statistiques pour:', req.expert?.name);
    
    res.json(testStats);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

export default router;
