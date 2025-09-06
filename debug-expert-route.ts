/**
 * Route de diagnostic temporaire - à ajouter dans expert.ts
 * Pour tester l'authentification directement
 */

import { Router, Request, Response } from 'express';
import { Expert } from '../models/Expert';
import bcrypt from 'bcrypt';

const router = Router();

// Route de diagnostic temporaire
router.post('/debug-login', async (req: Request, res: Response) => {
  try {
    console.log('🔍 DEBUG LOGIN - Début diagnostic');
    console.log('Body reçu:', req.body);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('❌ Email ou mot de passe manquant');
      return res.status(400).json({ 
        error: 'Email et mot de passe requis',
        debug: { email: !!email, password: !!password }
      });
    }
    
    // Recherche de l'expert
    console.log('🔍 Recherche expert avec email:', email);
    const expert = await Expert.findOne({ email: email.toLowerCase() });
    
    if (!expert) {
      console.log('❌ Expert non trouvé');
      return res.status(401).json({ 
        error: 'Expert non trouvé',
        debug: { emailSearched: email.toLowerCase() }
      });
    }
    
    console.log('✅ Expert trouvé:', {
      id: expert._id,
      email: expert.email,
      name: expert.name,
      role: expert.role,
      isActive: expert.isActive,
      createdAt: expert.createdAt
    });
    
    // Test du mot de passe avec bcrypt direct
    console.log('🔐 Test mot de passe...');
    console.log('Mot de passe fourni:', password);
    console.log('Hash stocké:', expert.password);
    
    const isValidMethod = await expert.comparePassword(password);
    const isValidDirect = await bcrypt.compare(password, expert.password);
    
    console.log('Résultat méthode comparePassword:', isValidMethod);
    console.log('Résultat bcrypt.compare direct:', isValidDirect);
    
    if (!isValidMethod && !isValidDirect) {
      console.log('❌ Mot de passe incorrect');
      
      // Test avec différentes variantes
      const variants = [
        password,
        password.trim(),
        'Lumira2025L',
        'lumira2025l'
      ];
      
      console.log('🔍 Test de variantes:');
      for (const variant of variants) {
        const testResult = await bcrypt.compare(variant, expert.password);
        console.log(`"${variant}":`, testResult);
      }
      
      return res.status(401).json({
        error: 'Mot de passe incorrect',
        debug: {
          methodResult: isValidMethod,
          directResult: isValidDirect,
          expertFound: true,
          isActive: expert.isActive
        }
      });
    }
    
    if (!expert.isActive) {
      console.log('❌ Compte expert désactivé');
      return res.status(401).json({
        error: 'Compte désactivé',
        debug: { isActive: expert.isActive }
      });
    }
    
    console.log('✅ Authentification réussie!');
    
    return res.json({
      success: true,
      expert: {
        id: expert._id,
        email: expert.email,
        name: expert.name,
        role: expert.role
      },
      debug: {
        methodResult: isValidMethod,
        directResult: isValidDirect,
        isActive: expert.isActive,
        message: 'Authentification complètement réussie!'
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur dans debug-login:', error);
    return res.status(500).json({
      error: 'Erreur serveur',
      debug: {
        message: error.message,
        stack: error.stack
      }
    });
  }
});

export { router as debugExpertRoutes };
