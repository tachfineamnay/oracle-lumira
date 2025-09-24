const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:3001/api';
const TEST_USER_EMAIL = 'test@lumira.com';
const EXPERT_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

let expertToken = null;
let sanctuaireToken = null;
let testOrderId = null;

async function testExpertWorkflow() {
  console.log('🚀 === TEST WORKFLOW COMPLET DESK → SANCTUAIRE ===\n');
  
  // 1. Connexion expert
  console.log('🔐 1. Connexion Expert Desk...');
  try {
    const response = await axios.post(`${API_BASE_URL}/expert/login`, EXPERT_CREDENTIALS);
    expertToken = response.data.token;
    console.log('✅ Expert connecté avec succès');
  } catch (error) {
    console.error('❌ Erreur connexion expert:', error.response?.data || error.message);
    return;
  }
  
  console.log('');
  
  // 2. Récupérer les commandes en attente de validation
  console.log('📋 2. Récupération queue de validation...');
  try {
    const response = await axios.get(`${API_BASE_URL}/expert/orders/validation-queue`, {
      headers: { Authorization: `Bearer ${expertToken}` }
    });
    
    console.log(`✅ ${response.data.orders.length} commandes en attente de validation`);
    
    if (response.data.orders.length > 0) {
      testOrderId = response.data.orders[0]._id;
      const order = response.data.orders[0];
      console.log(`🎯 Commande test: ${order.orderNumber}`);
      console.log(`   - Client: ${order.formData.firstName} ${order.formData.lastName}`);
      console.log(`   - Email: ${order.formData.email || TEST_USER_EMAIL}`);
      console.log(`   - Niveau: ${order.level} - ${order.levelName}`);
    }
  } catch (error) {
    console.error('❌ Erreur récupération queue:', error.response?.data || error.message);
    return;
  }
  
  console.log('');
  
  // 3. Valider une commande (approbation)
  if (testOrderId) {
    console.log('✅ 3. Test validation commande...');
    try {
      const payload = {
        orderId: testOrderId,
        action: 'approve',
        validationNotes: 'Test automatique - Contenu validé pour livraison sanctuaire'
      };

      const response = await axios.post(`${API_BASE_URL}/expert/validate-content`, payload, {
        headers: { Authorization: `Bearer ${expertToken}` }
      });

      console.log(`✅ Validation réussie: ${response.data.message}`);
      console.log(`   - Statut: ${response.data.status}`);
      console.log(`   - Action: ${response.data.action}`);
    } catch (error) {
      console.error('❌ Erreur validation:', error.response?.data || error.message);
      return;
    }
  } else {
    console.log('⚠️ Aucune commande disponible pour le test de validation');
  }
  
  console.log('');
  
  // 4. Test authentification sanctuaire
  console.log('🏰 4. Test authentification Sanctuaire...');
  try {
    const response = await axios.post(`${API_BASE_URL}/users/auth/sanctuaire`, {
      email: TEST_USER_EMAIL
    });
    
    if (response.data.success) {
      sanctuaireToken = response.data.token;
      console.log('✅ Authentification sanctuaire réussie');
      console.log(`   - Utilisateur: ${response.data.user.firstName} ${response.data.user.lastName}`);
      console.log(`   - Niveau: ${response.data.user.level}`);
      console.log(`   - Token: ${sanctuaireToken.substring(0, 20)}...`);
    }
  } catch (error) {
    console.error('❌ Erreur auth sanctuaire:', error.response?.data || error.message);
    console.log('ℹ️ Cela peut être normal si aucune commande complétée n\\'existe pour cet email');
  }
  
  console.log('');
  
  // 5. Test récupération commandes complétées
  if (sanctuaireToken) {
    console.log('📚 5. Test récupération commandes complétées...');
    try {
      const response = await axios.get(`${API_BASE_URL}/users/orders/completed`, {
        headers: { Authorization: `Bearer ${sanctuaireToken}` }
      });
      
      console.log(`✅ ${response.data.total} commandes complétées trouvées`);
      
      response.data.orders.forEach((order, index) => {
        console.log(`   📖 ${index + 1}. ${order.orderNumber} - ${order.levelName}`);
        console.log(`      - Validé le: ${new Date(order.deliveredAt || order.createdAt).toLocaleDateString('fr-FR')}`);
        console.log(`      - Contenu: ${Object.values(order.generatedContent || {}).filter(Boolean).length} éléments`);
      });
      
      // Test récupération contenu détaillé
      if (response.data.orders.length > 0) {
        const firstOrder = response.data.orders[0];
        console.log(`🔍 Test contenu détaillé pour ${firstOrder.orderNumber}...`);
        
        try {
          const contentResponse = await axios.get(`${API_BASE_URL}/orders/${firstOrder.id}/content`, {
            headers: { Authorization: `Bearer ${sanctuaireToken}` }
          });
          
          console.log('✅ Contenu détaillé récupéré:');
          console.log(`   - Formats disponibles: ${Object.entries(contentResponse.data.availableFormats).filter(([k, v]) => v).map(([k]) => k).join(', ')}`);
          console.log(`   - Validé par: ${contentResponse.data.expertValidation?.validatorName || 'Expert'}`);
        } catch (error) {
          console.error('❌ Erreur contenu détaillé:', error.response?.data || error.message);
        }
      }
      
    } catch (error) {
      console.error('❌ Erreur récupération commandes:', error.response?.data || error.message);
    }
  }
  
  console.log('');
  
  // 6. Test statistiques sanctuaire
  if (sanctuaireToken) {
    console.log('📊 6. Test statistiques sanctuaire...');
    try {
      const response = await axios.get(`${API_BASE_URL}/users/sanctuaire/stats`, {
        headers: { Authorization: `Bearer ${sanctuaireToken}` }
      });
      
      const stats = response.data;
      console.log('✅ Statistiques récupérées:');
      console.log(`   - Total commandes: ${stats.totalOrders}`);
      console.log(`   - Commandes complétées: ${stats.completedOrders}`);
      console.log(`   - Progression niveau: ${stats.levelProgress}%`);
      console.log(`   - Montant total dépensé: ${(stats.totalSpent / 100).toFixed(2)}€`);
      console.log(`   - Contenu disponible:`);
      console.log(`     • Lectures: ${stats.availableContent.readings}`);
      console.log(`     • PDFs: ${stats.availableContent.pdfs}`);
      console.log(`     • Audios: ${stats.availableContent.audios}`);
      console.log(`     • Mandalas: ${stats.availableContent.mandalas}`);
      
    } catch (error) {
      console.error('❌ Erreur statistiques:', error.response?.data || error.message);
    }
  }
  
  console.log('');
  console.log('🎉 === TEST WORKFLOW TERMINÉ ===');
  console.log('');
  console.log('📋 Résumé:');
  console.log(`✅ Expert Desk: ${expertToken ? 'Opérationnel' : 'Échec'}`);
  console.log(`✅ Validation: ${testOrderId ? 'Testée' : 'Pas de commande'}`);
  console.log(`✅ Auth Sanctuaire: ${sanctuaireToken ? 'Opérationnel' : 'Échec'}`);
  console.log(`✅ Workflow complet: ${expertToken && sanctuaireToken ? 'RÉUSSI' : 'PARTIEL'}`);
}

// Lancement du test
testExpertWorkflow().catch(error => {
  console.error('💥 Erreur fatale du test:', error);
  process.exit(1);
});