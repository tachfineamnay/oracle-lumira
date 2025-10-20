// Script d'initialisation MongoDB pour Lumira MVP

// Basculer vers la base de données lumira-mvp
db = db.getSiblingDB('lumira-mvp');

// Collection experts
db.experts.insertMany([
  {
    name: 'Oracle Maya',
    email: 'maya@lumira-oracle.com',
    password: '$2b$10$8K5rOhQp4a5B9q8b9q8b9A$E8K5rOhQp4a5B9q8b9q8bA', // password: maya123
    specialties: ['Niveau 1', 'Niveau 2', 'Niveau 3'],
    expertise: ['Tarot', 'Numérologie', 'Astrologie'],
    isActive: true,
    joinDate: new Date(),
    statistics: {
      totalOrders: 0,
      completedOrders: 0,
      averageRating: 0,
      totalEarnings: 0
    }
  },
  {
    name: 'Oracle Sophia',
    email: 'sophia@lumira-oracle.com',
    password: '$2b$10$8K5rOhQp4a5B9q8b9q8b9A$E8K5rOhQp4a5B9q8b9q8bA', // password: sophia123
    specialties: ['Niveau 2', 'Niveau 3', 'Niveau 4'],
    expertise: ['Médiumnité', 'Pendule', 'Cristaux'],
    isActive: true,
    joinDate: new Date(),
    statistics: {
      totalOrders: 0,
      completedOrders: 0,
      averageRating: 0,
      totalEarnings: 0
    }
  }
]);

// Collection orders avec des commandes de test
db.orders.insertMany([
  {
    orderNumber: 'LUM-2024-001',
    level: 1,
    customerEmail: 'client1@email.com',
    customerName: 'Marie Dupont',
    status: 'paid',
    amount: 29.99,
    currency: 'EUR',
    createdAt: new Date(),
    updatedAt: new Date(),
    details: {
      birthDate: '1985-03-15',
      birthTime: '14:30',
      birthPlace: 'Paris, France',
      question: 'Je traverse une période difficile dans ma vie professionnelle et j\'aimerais des conseils spirituels.',
      specificRequest: 'Guidance générale pour mon avenir professionnel'
    },
    payment: {
      stripeSessionId: 'cs_test_123',
      stripePaymentIntentId: 'pi_test_123',
      paidAt: new Date()
    }
  },
  {
    orderNumber: 'LUM-2024-002',
    level: 2,
    customerEmail: 'client2@email.com',
    customerName: 'Sophie Martin',
    status: 'paid',
    amount: 49.99,
    currency: 'EUR',
    createdAt: new Date(),
    updatedAt: new Date(),
    details: {
      birthDate: '1990-07-22',
      birthTime: '09:15',
      birthPlace: 'Lyon, France',
      question: 'Questions sur ma relation amoureuse et mes choix de vie.',
      specificRequest: 'Lecture tarot approfondie sur l\'amour et les relations'
    },
    payment: {
      stripeSessionId: 'cs_test_456',
      stripePaymentIntentId: 'pi_test_456',
      paidAt: new Date()
    }
  },
  {
    orderNumber: 'LUM-2024-003',
    level: 3,
    customerEmail: 'client3@email.com',
    customerName: 'Jean Moreau',
    status: 'paid',
    amount: 79.99,
    currency: 'EUR',
    createdAt: new Date(),
    updatedAt: new Date(),
    details: {
      birthDate: '1978-11-03',
      birthTime: '16:45',
      birthPlace: 'Marseille, France',
      question: 'Questionnement global sur ma voie de vie et mes objectifs spirituels.',
      specificRequest: 'Consultation complète avec thème astral et guidance spirituelle'
    },
    payment: {
      stripeSessionId: 'cs_test_789',
      stripePaymentIntentId: 'pi_test_789',
      paidAt: new Date()
    }
  }
]);

print('✅ Base de données Lumira MVP initialisée avec succès');
print('✅ 2 experts créés');
print('✅ 3 commandes de test créées');
