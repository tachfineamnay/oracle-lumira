// Script de test pour l'API Expert Desk
const testLogin = async () => {
  try {
    console.log('🧪 Test de connexion à l\'API Expert Desk...');
    
    const response = await fetch('http://localhost:3001/api/expert/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'maya@lumira-oracle.com',
        password: 'maya123'
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Connexion réussie !');
      console.log('Expert:', result.expert.name);
      console.log('Token:', result.token.substring(0, 20) + '...');
      
      // Test de récupération des commandes
      const ordersResponse = await fetch('http://localhost:3001/api/expert/orders/pending', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${result.token}`
        }
      });
      
      const ordersResult = await ordersResponse.json();
      
      if (ordersResponse.ok) {
        console.log(`✅ Récupération des commandes réussie ! ${ordersResult.total} commandes trouvées`);
        ordersResult.orders.forEach((order, index) => {
          console.log(`  📋 ${index + 1}. ${order.orderNumber} - ${order.customerName} - ${order.amount}€`);
        });
      } else {
        console.log('❌ Erreur lors de la récupération des commandes:', ordersResult.error);
      }
      
    } else {
      console.log('❌ Erreur de connexion:', result.error);
    }
    
  } catch (error) {
    console.log('❌ Erreur réseau:', error.message);
  }
};

testLogin();
