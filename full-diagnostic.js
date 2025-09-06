/**
 * Diagnostic complet des routes API
 * À exécuter dans la console du navigateur sur desk.oraclelumira.com
 */

async function fullDiagnostic() {
    console.log('🔍 DIAGNOSTIC COMPLET API EXPERT');
    console.log('='.repeat(50));
    
    // Test 1: Route de santé
    console.log('\n🏥 Test 1: Route de santé...');
    try {
        const healthResponse = await fetch('/api/health', { method: 'GET' });
        console.log('Health status:', healthResponse.status);
        const healthData = await healthResponse.text();
        console.log('Health response:', healthData.substring(0, 200));
    } catch (error) {
        console.error('❌ Health check failed:', error.message);
    }
    
    // Test 2: Route de login normale
    console.log('\n🔐 Test 2: Route de login normale...');
    try {
        const loginResponse = await fetch('/api/expert/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                email: 'expert@oraclelumira.com',
                password: 'Lumira2025L'
            })
        });
        
        console.log('Login status:', loginResponse.status);
        console.log('Login headers:', [...loginResponse.headers.entries()]);
        
        const loginText = await loginResponse.text();
        console.log('Login response (first 300 chars):', loginText.substring(0, 300));
        
        try {
            const loginData = JSON.parse(loginText);
            console.log('✅ Login JSON:', loginData);
        } catch {
            console.log('❌ Login response is not JSON, probably HTML error');
        }
        
    } catch (error) {
        console.error('❌ Login test failed:', error.message);
    }
    
    // Test 3: Route de debug (si disponible)
    console.log('\n🔍 Test 3: Route de debug...');
    try {
        const debugResponse = await fetch('/api/expert/debug-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                email: 'expert@oraclelumira.com',
                password: 'Lumira2025L'
            })
        });
        
        console.log('Debug status:', debugResponse.status);
        
        const debugText = await debugResponse.text();
        console.log('Debug response (first 300 chars):', debugText.substring(0, 300));
        
        try {
            const debugData = JSON.parse(debugText);
            console.log('✅ Debug JSON:', debugData);
        } catch {
            console.log('❌ Debug response is not JSON');
        }
        
    } catch (error) {
        console.error('❌ Debug test failed:', error.message);
    }
    
    // Test 4: Vérification des routes disponibles
    console.log('\n📋 Test 4: Test des routes expert disponibles...');
    const expertRoutes = [
        { path: '/api/expert/verify', method: 'GET' },
        { path: '/api/expert/orders/pending', method: 'GET' },
    ];
    
    for (const route of expertRoutes) {
        try {
            const response = await fetch(route.path, { method: route.method });
            console.log(`${route.method} ${route.path}: ${response.status}`);
        } catch (error) {
            console.log(`${route.method} ${route.path}: ERROR - ${error.message}`);
        }
    }
    
    // Test 5: Informations sur l'environnement
    console.log('\n🌍 Test 5: Informations environnement...');
    console.log('URL actuelle:', window.location.href);
    console.log('User Agent:', navigator.userAgent);
    console.log('Cookies:', document.cookie);
    
    console.log('\n✅ Diagnostic terminé !');
    console.log('Copiez tous ces logs et envoyez-les pour analyse.');
}

// Exécuter le diagnostic
fullDiagnostic();
