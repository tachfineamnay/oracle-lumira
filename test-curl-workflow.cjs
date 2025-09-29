#!/usr/bin/env node
/**
 * Test simple du workflow Expert Desk avec curl
 * Sans dépendances externes
 */

const { exec } = require('child_process');

const API_BASE = 'http://localhost:3001/api';
const EXPERT_EMAIL = 'expert@oraclelumira.com';
const EXPERT_PASSWORD = 'Lumira2025L';

const testData = {
  level: 3,
  amount: 15000,
  formData: {
    firstName: 'Marie',
    lastName: 'TestExpert',
    email: 'marie.testexpert@example.com',
    phone: '+33123456789',
    dateOfBirth: '1985-06-15',
    specificQuestion: 'Je souhaite comprendre mon chemin de vie professionnel'
  },
  metadata: {
    level: 'profond',
    productName: 'Lecture Alchimique',
    source: 'test_workflow'
  }
};

function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, { timeout: 10000 }, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stderr });
      } else {
        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (parseError) {
          resolve({ raw: stdout });
        }
      }
    });
  });
}

async function testWorkflow() {
  console.log('🚀 Test workflow Expert Desk avec curl');
  console.log('=' .repeat(50));

  try {
    // 1. Vérifier que le serveur répond
    console.log('\n🔍 1. Test santé serveur...');
    const healthCmd = `curl -s "${API_BASE}/healthz"`;
    const health = await runCommand(healthCmd);
    console.log('✅ Serveur accessible:', health);

    // 2. Créer commande test
    console.log('\n📝 2. Création commande test...');
    const createOrderCmd = `curl -s -X POST "${API_BASE}/products/create-order" -H "Content-Type: application/json" -d '${JSON.stringify(testData)}'`;
    const orderResult = await runCommand(createOrderCmd);
    
    if (!orderResult.success) {
      throw new Error('Échec création commande: ' + JSON.stringify(orderResult));
    }
    
    const orderId = orderResult.orderId;
    console.log('✅ Commande créée:', orderId);

    // 3. Simuler paiement
    console.log('\n💳 3. Simulation paiement...');
    const paymentData = { orderId, status: 'paid' };
    const paymentCmd = `curl -s -X POST "${API_BASE}/products/simulate-payment" -H "Content-Type: application/json" -d '${JSON.stringify(paymentData)}'`;
    const paymentResult = await runCommand(paymentCmd);
    console.log('✅ Paiement simulé:', paymentResult);

    // 4. Login expert
    console.log('\n🔐 4. Login expert...');
    const loginData = { email: EXPERT_EMAIL, password: EXPERT_PASSWORD };
    const loginCmd = `curl -s -X POST "${API_BASE}/expert/login" -H "Content-Type: application/json" -d '${JSON.stringify(loginData)}'`;
    const loginResult = await runCommand(loginCmd);
    
    if (!loginResult.success) {
      throw new Error('Login expert échoué: ' + JSON.stringify(loginResult));
    }
    
    const token = loginResult.token;
    console.log('✅ Expert connecté:', loginResult.expert.name);

    // 5. Récupérer commandes pendantes
    console.log('\n📋 5. Récupération commandes pendantes...');
    const ordersCmd = `curl -s "${API_BASE}/expert/orders/pending" -H "Authorization: Bearer ${token}"`;
    const ordersResult = await runCommand(ordersCmd);
    
    const orders = ordersResult.orders || [];
    console.log(`📊 ${orders.length} commandes trouvées`);
    
    if (orders.length === 0) {
      console.log('❌ PROBLÈME: Aucune commande dans la queue Expert!');
      return false;
    }

    // 6. Vérifier notre commande
    const testOrder = orders.find(o => o._id === orderId);
    if (!testOrder) {
      console.log('❌ PROBLÈME: Notre commande test non trouvée!');
      console.log('📋 Commandes disponibles:');
      orders.forEach(order => {
        console.log(`  - ${order._id}: ${order.userEmail} (${order.status})`);
      });
      return false;
    }

    console.log('✅ Commande test trouvée dans la queue Expert!');
    console.log('📄 Détails:', {
      id: testOrder._id,
      level: testOrder.level,
      status: testOrder.status,
      email: testOrder.userEmail
    });

    console.log('\n🎉 SUCCÈS: Le workflow Expert Desk fonctionne!');
    return true;

  } catch (error) {
    console.error('\n❌ ÉCHEC:', error.message || error);
    if (error.stderr) {
      console.error('🔍 Erreur système:', error.stderr);
    }
    return false;
  }
}

// Exécuter le test
testWorkflow()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });