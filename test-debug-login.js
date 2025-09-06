/**
 * Test rapide de la route de debug
 * À exécuter dans la console du navigateur sur desk.oraclelumira.com
 */

// Test de la route de debug
async function testDebugLogin() {
    console.log('🔍 Test de la route debug-login...');
    
    try {
        const response = await fetch('/api/expert/debug-login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                email: 'expert@oraclelumira.com',
                password: 'Lumira2025L'
            })
        });
        
        const result = await response.json();
        
        console.log('🔍 Réponse de l\'API:');
        console.log('Status:', response.status);
        console.log('Headers:', [...response.headers.entries()]);
        console.log('Body:', result);
        
        if (result.success) {
            console.log('✅ Authentification réussie!');
            console.log('Token reçu:', result.token ? 'Oui' : 'Non');
            console.log('Expert:', result.expert);
            
            if (result.debug) {
                console.log('🔍 Info debug:', result.debug);
            }
        } else {
            console.log('❌ Authentification échouée');
            console.log('Erreur:', result.error);
            
            if (result.debug) {
                console.log('🔍 Info debug:', result.debug);
            }
        }
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    }
}

// Exécution automatique
testDebugLogin();
