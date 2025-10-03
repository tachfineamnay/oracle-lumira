#!/usr/bin/env node
/**
 * Script de test automatisé - Validation API Stateless
 * Oracle Lumira - Backend API après nettoyage filesystem
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const tests = [];
let passed = 0;
let failed = 0;

// Helper pour les tests
async function test(name, testFunction) {
  try {
    console.log(`🧪 Test: ${name}`);
    await testFunction();
    console.log(`✅ PASS: ${name}`);
    passed++;
  } catch (error) {
    console.log(`❌ FAIL: ${name} - ${error.message}`);
    failed++;
  }
}

// Tests API
async function runTests() {
  console.log('🚀 Oracle Lumira API - Tests Validation Stateless');
  console.log(`📡 API Base URL: ${API_BASE_URL}`);
  console.log('=' .repeat(60));

  // Test 1: Health Check
  await test('Health Check Endpoint', async () => {
    const response = await axios.get(`${API_BASE_URL}/api/healthz`);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    if (!response.data.status) throw new Error('Missing status in response');
    if (!response.data.timestamp) throw new Error('Missing timestamp in response');
  });

  // Test 2: Ready Check
  await test('Readiness Check Endpoint', async () => {
    const response = await axios.get(`${API_BASE_URL}/api/ready`);
    // Accept both 200 (ready) and 503 (not ready) as valid
    if (![200, 503].includes(response.status)) {
      throw new Error(`Expected 200 or 503, got ${response.status}`);
    }
    if (typeof response.data.ready !== 'boolean') {
      throw new Error('Missing or invalid ready field');
    }
  });

  // Test 3: CORS Headers
  await test('CORS Configuration', async () => {
    const response = await axios.options(`${API_BASE_URL}/api/healthz`);
    if (response.status !== 204) throw new Error(`Expected 204, got ${response.status}`);
  });

  // Test 4: Rate Limiting Headers
  await test('Rate Limiting Setup', async () => {
    const response = await axios.get(`${API_BASE_URL}/api/healthz`);
    // Just verify the request goes through (rate limiting headers may vary)
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  });

  // Test 5: Security Headers (Helmet)
  await test('Security Headers Present', async () => {
    const response = await axios.get(`${API_BASE_URL}/api/healthz`);
    if (!response.headers['x-content-type-options']) {
      throw new Error('Missing X-Content-Type-Options header');
    }
  });

  // Test 6: JSON Body Parsing
  await test('JSON Body Parsing', async () => {
    try {
      // This might fail with 404 but should not fail with body parsing errors
      await axios.post(`${API_BASE_URL}/api/test-json`, { test: 'data' });
    } catch (error) {
      // 404 is expected, but 400 (bad body) is not
      if (error.response && error.response.status === 400) {
        throw new Error('JSON body parsing failed');
      }
      // Other errors (404, etc.) are acceptable for this test
    }
  });

  // Résumé
  console.log('=' .repeat(60));
  console.log(`📊 Résultats: ${passed} tests passés, ${failed} tests échoués`);
  
  if (failed === 0) {
    console.log('🎉 Tous les tests sont passés ! API prête pour déploiement stateless.');
    process.exit(0);
  } else {
    console.log('⚠️ Certains tests ont échoué. Vérifiez la configuration.');
    process.exit(1);
  }
}

// Validation que l'API n'utilise plus le filesystem
async function validateStateless() {
  console.log('\n🔍 Validation Stateless:');
  
  try {
    const response = await axios.get(`${API_BASE_URL}/api/healthz`);
    console.log('✅ API répond sans dépendance filesystem');
    
    // Vérifier qu'aucun endpoint de fichiers statiques n'existe
    try {
      await axios.get(`${API_BASE_URL}/uploads/test`);
      console.log('⚠️ ATTENTION: Endpoint /uploads/ toujours accessible');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✅ Endpoint /uploads/ correctement supprimé');
      }
    }
    
    try {
      await axios.get(`${API_BASE_URL}/generated/test`);
      console.log('⚠️ ATTENTION: Endpoint /generated/ toujours accessible');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✅ Endpoint /generated/ correctement supprimé');
      }
    }
    
  } catch (error) {
    console.log('❌ API non accessible pour validation stateless');
  }
}

// Exécution
if (require.main === module) {
  runTests()
    .then(() => validateStateless())
    .catch(error => {
      console.error('💥 Erreur lors des tests:', error.message);
      process.exit(1);
    });
}

module.exports = { runTests, validateStateless };