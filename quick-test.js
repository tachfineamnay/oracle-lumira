/**
 * Test rapide de connectivité API
 * À exécuter dans la console du navigateur
 */

async function quickTest() {
    console.log('🚀 Test rapide de l\'API...');
    
    // Test 1: Route de santé
    try {
        const healthResponse = await fetch('/api/health');
        console.log('✅ Health check status:', healthResponse.status);
        
        if (healthResponse.ok) {
            const healthText = await healthResponse.text();
            console.log('Health response:', healthText);
        }
    } catch (error) {
        console.error('❌ Health check failed:', error);
    }
    
    // Test 2: Route login (simple check)
    try {
        console.log('\n🔐 Test route login...');
        const loginResponse = await fetch('/api/expert/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test', password: 'test' }) // Juste pour tester si la route répond
        });
        
        console.log('Login route status:', loginResponse.status);
        
        if (loginResponse.status === 400) {
            console.log('✅ Route login accessible (erreur 400 = validation failed, c\'est normal)');
        } else if (loginResponse.status === 405) {
            console.log('❌ Route login toujours inaccessible (405 = Method Not Allowed)');
        } else {
            console.log('ℹ️ Status inattendu, mais la route répond:', loginResponse.status);
        }
        
    } catch (error) {
        console.error('❌ Login route test failed:', error);
    }
    
    console.log('\n✅ Tests terminés');
}

quickTest();
