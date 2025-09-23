#!/usr/bin/env node

/**
 * Script de test du workflow complet de validation Oracle Lumira
 * 1. Création d'une commande via API main-app
 * 2. Traitement expert → n8n → callback avec awaiting_validation
 * 3. Test routes de validation Expert Desk
 * 4. Test approbation/rejet du contenu
 */

const axios = require('axios');

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3001/api';
const EXPERT_EMAIL = 'expert@oraclelumira.com';
const EXPERT_PASSWORD = 'Lumira2025L';

async function testValidationWorkflow() {
  console.log('🚀 Test workflow de validation Oracle Lumira');
  console.log('📡 API Base:', API_BASE);
  
  try {
    // 1. Créer une commande test
    console.log('\n📝 1. Création commande test...');
    const orderData = {
      level: 3, // Niveau Alchimique pour test complet
      amount: 8900, // 89€ pour niveau Alchimique
      formData: {
        firstName: 'Test',
        lastName: 'Validation',
        email: 'test.validation@example.com',
        phone: '+33123456789',
        dateOfBirth: '1985-03-20',
        specificQuestion: 'Test complet du système de validation Expert Desk avec aperçu stellaire'
      },
      metadata: {
        source: 'test-validation-workflow',
        timestamp: new Date().toISOString()
      }
    };

    const orderResponse = await axios.post(`${API_BASE}/products/create-order`, orderData);
    const orderId = orderResponse.data.orderId;
    console.log('✅ Commande créée:', orderId);

    // 2. Simuler paiement réussi
    console.log('\n💳 2. Simulation paiement réussi...');
    await axios.post(`${API_BASE}/products/simulate-payment`, {
      orderId: orderId,
      status: 'paid'
    });
    console.log('✅ Paiement simulé');

    // 3. Login Expert
    console.log('\n🔐 3. Login Expert...');
    const loginResponse = await axios.post(`${API_BASE}/expert/login`, {
      email: EXPERT_EMAIL,
      password: EXPERT_PASSWORD
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Login expert échoué');
    }
    
    const expertToken = loginResponse.data.token;
    console.log('✅ Expert connecté:', loginResponse.data.expert.name);

    // 4. Traitement par Expert → n8n
    console.log('\n🧙‍♀️ 4. Traitement Expert → n8n...');
    const promptData = {
      orderId: orderId,
      expertPrompt: `Test validation Expert Desk pour ${orderData.formData.firstName} ${orderData.formData.lastName}. 
      
      Lecture vibratoire niveau ${orderData.level} (Alchimique) pour: "${orderData.formData.specificQuestion}"
      
      Cette lecture testera le système de validation avec aperçu complet.`,
      expertInstructions: 'Test workflow validation - générer contenu pour validation Expert'
    };

    const processResponse = await axios.post(`${API_BASE}/expert/process-order`, promptData, {
      headers: { Authorization: `Bearer ${expertToken}` }
    });

    console.log('✅ Commande envoyée à n8n:', processResponse.data.orderNumber);

    // 5. Simuler callback n8n avec contenu généré
    console.log('\n🤖 5. Simulation callback n8n avec contenu...');
    const callbackData = {
      orderId: orderId,
      success: true,
      generatedContent: {
        archetype: 'L\'Alchimiste Stellaire',
        reading: `Cher(ère) ${orderData.formData.firstName},

Votre chemin spirituel révèle une âme d'Alchimiste Stellaire, guidée par les énergies cosmiques de transformation.

VOTRE ARCHÉTYPE SPIRITUEL
L'Alchimiste Stellaire est un être rare qui transforme les énergies dense en lumière pure. Vous portez en vous la capacité unique de transmuter les défis en sagesse, les obstacles en opportunités d'évolution.

LECTURE VIBRATOIRE PERSONNALISÉE
Les étoiles murmurent votre nom avec respect, car vous êtes l'un de ces êtres précieux qui éclairent le chemin pour les autres. Votre question "${orderData.formData.specificQuestion}" révèle une quête profonde de sens et d'authenticité.

GUIDANCE STELLAIRE
Le cosmos vous invite à embrasser pleinement votre nature transformatrice. Chaque expérience, même difficile, nourrit votre pouvoir alchimique. Vous êtes appelé(e) à rayonner votre lumière unique dans ce monde.

RITUAL DE CONNEXION
Chaque soir, avant le coucher, regardez les étoiles pendant 5 minutes en respirant profondément. Visualisez votre lumière intérieure se connectant à la voûte céleste. Dites: "Je suis un pont entre Terre et Ciel, je transforme avec amour."

Que les étoiles vous bénissent sur votre chemin sacré.

Avec toute ma gratitude cosmique,
Oracle Lumira ✨`,
        audioUrl: 'https://example.com/audio/test-validation.mp3',
        pdfUrl: 'https://example.com/pdf/test-validation.pdf',
        mandalaSvg: '<svg width="200" height="200"><circle cx="100" cy="100" r="80" fill="none" stroke="#fbbf24" stroke-width="2"/><text x="100" y="105" text-anchor="middle" fill="#fbbf24" font-size="12">Mandala Test</text></svg>',
        ritual: 'Rituel quotidien de connexion stellaire décrit ci-dessus.',
        blockagesAnalysis: 'Blocages identifiés: peur du jugement, doute de soi',
        soulProfile: 'Âme ancienne, guide naturel, catalyseur de transformation'
      },
      files: [
        { type: 'audio', url: 'https://example.com/audio/test-validation.mp3' },
        { type: 'pdf', url: 'https://example.com/pdf/test-validation.pdf' }
      ]
    };

    const callbackResponse = await axios.post(`${API_BASE}/expert/n8n-callback`, callbackData);
    console.log('✅ Callback traité:', callbackResponse.data.status);

    if (callbackResponse.data.status !== 'awaiting_validation') {
      throw new Error(`Statut attendu 'awaiting_validation', reçu: ${callbackResponse.data.status}`);
    }

    // 6. Test récupération queue de validation
    console.log('\n📋 6. Test queue de validation...');
    const validationQueueResponse = await axios.get(`${API_BASE}/expert/orders/validation-queue`, {
      headers: { Authorization: `Bearer ${expertToken}` }
    });

    const validationOrders = validationQueueResponse.data.orders;
    console.log(`✅ ${validationOrders.length} commandes en attente de validation`);

    const testOrder = validationOrders.find(o => o._id === orderId);
    if (!testOrder) {
      throw new Error('Commande test non trouvée dans la queue de validation');
    }

    console.log('✅ Commande trouvée dans queue validation:');
    console.log('   - ID:', testOrder._id);
    console.log('   - Statut:', testOrder.status);
    console.log('   - Validation Status:', testOrder.expertValidation?.validationStatus);
    console.log('   - Contenu:', testOrder.generatedContent ? 'Présent' : 'Absent');

    // 7. Test rejet du contenu pour régénération
    console.log('\n❌ 7. Test rejet du contenu...');
    const rejectData = {
      orderId: orderId,
      action: 'reject',
      validationNotes: 'Test de rejet - le contenu doit être amélioré avec plus de détails spirituels',
      rejectionReason: 'Manque de profondeur dans l\'analyse vibratoire, besoin de plus de guidance pratique'
    };

    const rejectResponse = await axios.post(`${API_BASE}/expert/validate-content`, rejectData, {
      headers: { Authorization: `Bearer ${expertToken}` }
    });

    console.log('✅ Contenu rejeté:', rejectResponse.data.message);
    console.log('   - Révision Count:', rejectResponse.data.revisionCount);

    // 8. Simuler nouveau callback après régénération
    console.log('\n🔄 8. Simulation régénération après rejet...');
    const revisionCallbackData = {
      ...callbackData,
      isRevision: true,
      generatedContent: {
        ...callbackData.generatedContent,
        reading: callbackData.generatedContent.reading + `

GUIDANCE APPROFONDIE (Révision)
Suite à votre demande de clarification, les énergies stellaires m'ont guidée pour vous offrir cette guidance supplémentaire:

Votre chemin d'Alchimiste Stellaire se déploie en trois phases:
1. PHASE TERRE: Ancrage de vos dons (en cours)
2. PHASE ÉTHER: Expansion de votre influence spirituelle 
3. PHASE COSMOS: Maîtrise complète de la transformation alchimique

Des exercices pratiques vous seront transmis pour accélérer cette évolution sacrée.`
      }
    };

    const revisionCallbackResponse = await axios.post(`${API_BASE}/expert/n8n-callback`, revisionCallbackData);
    console.log('✅ Révision callback traité:', revisionCallbackResponse.data.status);

    // 9. Test approbation finale
    console.log('\n✅ 9. Test approbation finale...');
    const approveData = {
      orderId: orderId,
      action: 'approve',
      validationNotes: 'Contenu révisé excellent - prêt pour livraison au sanctuaire du client'
    };

    const approveResponse = await axios.post(`${API_BASE}/expert/validate-content`, approveData, {
      headers: { Authorization: `Bearer ${expertToken}` }
    });

    console.log('✅ Contenu approuvé:', approveResponse.data.message);

    // 10. Vérification statut final
    console.log('\n🔍 10. Vérification statut final...');
    const finalOrderResponse = await axios.get(`${API_BASE}/expert/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${expertToken}` }
    });

    const finalOrder = finalOrderResponse.data;
    console.log('✅ Statut final:', finalOrder.status);
    console.log('✅ Validation Status:', finalOrder.expertValidation?.validationStatus);
    console.log('✅ Livré le:', finalOrder.deliveredAt ? new Date(finalOrder.deliveredAt).toLocaleString('fr-FR') : 'Non livré');

    if (finalOrder.status !== 'completed') {
      throw new Error(`Statut final attendu 'completed', reçu: ${finalOrder.status}`);
    }

    console.log('\n🎉 WORKFLOW DE VALIDATION COMPLET RÉUSSI !');
    console.log('✅ Commande créée → Expert traitement → n8n génération → awaiting_validation');
    console.log('✅ Queue validation → Rejet → Régénération → Approbation → Livraison');
    console.log('✅ Design stellaire et workflow Expert Desk prêts pour production');
    
    return {
      success: true,
      orderId,
      orderNumber: processResponse.data.orderNumber,
      finalStatus: finalOrder.status,
      revisionCount: finalOrder.revisionCount || 0
    };

  } catch (error) {
    console.error('\n❌ ERREUR WORKFLOW VALIDATION:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    return { success: false, error: error.message };
  }
}

// Exécution du test
if (require.main === module) {
  testValidationWorkflow()
    .then(result => {
      if (result.success) {
        console.log('\n🚀 Test workflow validation terminé avec succès');
        console.log('📊 Résultats:', result);
        process.exit(0);
      } else {
        console.log('\n💥 Test workflow validation échoué');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { testValidationWorkflow };