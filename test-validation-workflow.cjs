#!/usr/bin/env node

/**
 * Script de test du workflow complet de validation Oracle Lumira
 * 1. Création d'une commande via API main-app
 * 2. Traitement expert → n8n → callback avec awaiting_validation
 * 3. Test routes de validation Expert Desk
 * 4. Test approbation/rejet du contenu
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:3001/api';
const EXPERT_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

let expertToken = null;
let testOrderId = null;

async function loginExpert() {
  try {
    console.log('🔐 Connexion expert...');
    const response = await axios.post(`${API_BASE_URL}/expert/login`, EXPERT_CREDENTIALS);
    expertToken = response.data.token;
    console.log('✅ Expert connecté avec succès');
    return true;
  } catch (error) {
    console.error('❌ Erreur connexion expert:', error.response?.data || error.message);
    return false;
  }
}

async function getValidationQueue() {
  try {
    console.log('📋 Récupération queue de validation...');
    const response = await axios.get(`${API_BASE_URL}/expert/orders/validation-queue`, {
      headers: { Authorization: `Bearer ${expertToken}` }
    });
    
    console.log(`✅ ${response.data.orders.length} commandes en attente de validation`);
    
    if (response.data.orders.length > 0) {
      testOrderId = response.data.orders[0]._id;
      console.log(`🎯 Commande test sélectionnée: ${testOrderId}`);
      
      // Afficher détails de la première commande
      const order = response.data.orders[0];
      console.log(`   - Client: ${order.formData.firstName} ${order.formData.lastName}`);
      console.log(`   - Niveau: ${order.level} - ${order.levelName}`);
      console.log(`   - Statut: ${order.status}`);
      console.log(`   - Contenu généré: ${order.generatedContent ? 'Oui' : 'Non'}`);
    }
    
    return response.data.orders;
  } catch (error) {
    console.error('❌ Erreur récupération queue:', error.response?.data || error.message);
    return [];
  }
}

async function testValidation(action = 'approve') {
  if (!testOrderId) {
    console.log('⚠️ Aucune commande test disponible');
    return false;
  }

  try {
    console.log(`🔍 Test de validation (${action})...`);
    
    const payload = {
      orderId: testOrderId,
      action: action,
      validationNotes: action === 'approve' 
        ? 'Contenu validé par test automatique - Qualité conforme'
        : 'Test de rejet automatique - Contenu à régénérer',
      ...(action === 'reject' && { 
        rejectionReason: 'Test automatique: contenu nécessite amélioration' 
      })
    };

    const response = await axios.post(`${API_BASE_URL}/expert/validate-content`, payload, {
      headers: { Authorization: `Bearer ${expertToken}` }
    });

    console.log(`✅ Validation ${action} réussie:`, response.data.message);
    return true;
  } catch (error) {
    console.error(`❌ Erreur validation ${action}:`, error.response?.data || error.message);
    return false;
  }
}

async function getStats() {
  try {
    console.log('📊 Récupération statistiques...');
    const response = await axios.get(`${API_BASE_URL}/expert/stats`, {
      headers: { Authorization: `Bearer ${expertToken}` }
    });
    
    const stats = response.data;
    console.log('✅ Statistiques Expert Desk:');
    console.log(`   - Commandes en attente: ${stats.pending}`);
    console.log(`   - En traitement: ${stats.processing}`);
    console.log(`   - En attente de validation: ${stats.awaitingValidation}`);
    console.log(`   - Traitées aujourd'hui: ${stats.treatedToday}`);
    console.log(`   - Total traitées: ${stats.totalTreated}`);
    
    return stats;
  } catch (error) {
    console.error('❌ Erreur statistiques:', error.response?.data || error.message);
    return null;
  }
}

async function runFullTest() {
  console.log('🚀 === TEST WORKFLOW VALIDATION EXPERT DESK ===\n');
  
  // 1. Connexion expert
  const loginSuccess = await loginExpert();
  if (!loginSuccess) {
    console.log('❌ Test arrêté - Échec connexion');
    return;
  }
  
  console.log('');
  
  // 2. Statistiques initiales
  await getStats();
  console.log('');
  
  // 3. Queue de validation
  const validationOrders = await getValidationQueue();
  console.log('');
  
  // 4. Test validation si commandes disponibles
  if (validationOrders.length > 0) {
    console.log('🧪 Tests de validation...');
    
    // Test approbation (commentez si vous voulez tester le rejet)
    await testValidation('approve');
    
    // Test rejet (décommentez si nécessaire)
    // await testValidation('reject');
    
    console.log('');
    
    // 5. Statistiques finales
    console.log('📊 Statistiques après validation:');
    await getStats();
  } else {
    console.log('ℹ️ Aucune commande en attente de validation pour les tests');
  }
  
  console.log('\n✅ === TEST TERMINÉ ===');
}

// Lancement du test
runFullTest().catch(error => {
  console.error('💥 Erreur fatale du test:', error);
  process.exit(1);
});
