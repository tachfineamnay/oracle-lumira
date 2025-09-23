#!/usr/bin/env node

/**
 * Script de test du workflow complet Oracle Lumira
 * 1. Création d'une commande via API main-app
 * 2. Vérification réception Expert Desk
 * 3. Test traitement expert → n8n
 */

const axios = require('axios');

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3001/api';
const EXPERT_EMAIL = 'expert@oraclelumira.com';
const EXPERT_PASSWORD = 'Lumira2025L';

async function testWorkflow() {
  console.log('🚀 Test workflow Oracle Lumira - Commande → Expert Desk');
  console.log('📡 API Base:', API_BASE);
  
  try {
    // 1. Créer une commande test
    console.log('\n📝 1. Création commande test...');
    const orderData = {
      level: 2,
      amount: 3700, // 37€ pour niveau Intuitif
      formData: {
        firstName: 'Test',
        lastName: 'Workflow',
        email: 'test.workflow@example.com',
        phone: '+33123456789',
        dateOfBirth: '1990-05-15',
        specificQuestion: 'Test de réception commande dans Expert Desk avec design stellaire'
      },
      metadata: {
        source: 'test-workflow',
        timestamp: new Date().toISOString()
      }
    };

    const orderResponse = await axios.post(`${API_BASE}/products/create-order`, orderData);
    const orderId = orderResponse.data.orderId;
    console.log('✅ Commande créée:', orderId);

    // 2. Simuler paiement réussi (mettre à jour le statut)
    console.log('\n💳 2. Simulation paiement réussi...');
    await axios.post(`${API_BASE}/products/simulate-payment`, {
      orderId: orderId,
      status: 'paid'
    });
    console.log('✅ Paiement simulé');

    // 3. Tester login Expert
    console.log('\n🔐 3. Test login Expert...');
    const loginResponse = await axios.post(`${API_BASE}/expert/login`, {
      email: EXPERT_EMAIL,
      password: EXPERT_PASSWORD
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Login expert échoué');
    }
    
    const expertToken = loginResponse.data.token;
    console.log('✅ Expert connecté:', loginResponse.data.expert.name);

    // 4. Récupérer commandes pendantes
    console.log('\n📋 4. Récupération commandes pendantes...');
    const ordersResponse = await axios.get(`${API_BASE}/expert/orders/pending`, {
      headers: { Authorization: `Bearer ${expertToken}` }
    });
    
    const orders = ordersResponse.data.orders;
    console.log(`✅ ${orders.length} commandes trouvées`);
    
    // Vérifier que notre commande test est présente
    const testOrder = orders.find(o => o._id === orderId);
    if (!testOrder) {
      throw new Error('Commande test non trouvée dans la queue Expert');
    }
    
    console.log('✅ Commande test trouvée dans Expert Desk');
    console.log('   - ID:', testOrder._id);
    console.log('   - Client:', testOrder.formData.firstName, testOrder.formData.lastName);
    console.log('   - Question:', testOrder.formData.specificQuestion);

    // 5. Tester traitement par Expert
    console.log('\n🧙‍♀️ 5. Test traitement Expert...');
    const promptData = {
      orderId: orderId,
      expertPrompt: `Test prompt Expert pour ${testOrder.formData.firstName} ${testOrder.formData.lastName}. 
      
      Lecture vibratoire pour la question: "${testOrder.formData.specificQuestion}"
      
      Niveau ${testOrder.level} - ${testOrder.levelName}
      
      Cette lecture est générée par le workflow de test automatique.`,
      expertInstructions: 'Test workflow - génération automatique pour validation système'
    };

    const processResponse = await axios.post(`${API_BASE}/expert/process-order`, promptData, {
      headers: { Authorization: `Bearer ${expertToken}` }
    });

    console.log('✅ Commande traitée et envoyée à n8n');
    console.log('   - Status n8n:', processResponse.data.n8nStatus);
    console.log('   - Order Number:', processResponse.data.orderNumber);

    console.log('\n🎉 WORKFLOW TEST RÉUSSI !');
    console.log('✅ Commande créée → Expert Desk → n8n');
    console.log('✅ Design stellaire prêt pour production');
    
    return {
      success: true,
      orderId,
      orderNumber: processResponse.data.orderNumber
    };

  } catch (error) {
    console.error('\n❌ ERREUR WORKFLOW:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    return { success: false, error: error.message };
  }
}

// Exécution du test
if (require.main === module) {
  testWorkflow()
    .then(result => {
      if (result.success) {
        console.log('\n🚀 Test terminé avec succès');
        process.exit(0);
      } else {
        console.log('\n💥 Test échoué');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { testWorkflow };