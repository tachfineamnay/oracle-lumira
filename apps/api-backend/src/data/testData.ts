// Données de test pour l'expert desk (version mémoire)

interface TestOrder {
  _id: string;
  orderNumber: string;
  level: number;
  levelName: string;
  customerEmail: string;
  customerName: string;
  status: string;
  amount: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  assignedExpert?: string;
  assignedAt?: Date;
  details: {
    birthDate: string;
    birthTime: string;
    birthPlace: string;
    question: string;
    specificRequest: string;
  };
  payment: {
    stripeSessionId: string;
    stripePaymentIntentId: string;
    paidAt: Date;
  };
}

export const testExperts = [
  {
    _id: '674b7e123456789012345001',
    name: 'Oracle Maya',
    email: 'maya@lumira-oracle.com',
    password: '$2b$10$8K5rOhQp4a5B9q8b9q8b9A$E8K5rOhQp4a5B9q8b9q8bA', // password: maya123
    specialties: ['Niveau 1', 'Niveau 2', 'Niveau 3'],
    expertise: ['Tarot', 'Numérologie', 'Astrologie'],
    isActive: true,
    joinDate: new Date(),
    statistics: {
      totalOrders: 15,
      completedOrders: 12,
      averageRating: 4.8,
      totalEarnings: 450.0
    }
  },
  {
    _id: '674b7e123456789012345002',
    name: 'Oracle Sophia',
    email: 'sophia@lumira-oracle.com',
    password: '$2b$10$8K5rOhQp4a5B9q8b9q8b9A$E8K5rOhQp4a5B9q8b9q8bA', // password: sophia123
    specialties: ['Niveau 2', 'Niveau 3', 'Niveau 4'],
    expertise: ['Médiumnité', 'Pendule', 'Cristaux'],
    isActive: true,
    joinDate: new Date(),
    statistics: {
      totalOrders: 23,
      completedOrders: 20,
      averageRating: 4.9,
      totalEarnings: 780.0
    }
  }
];

export const testOrders: TestOrder[] = [
  {
    _id: '674b7e123456789012345101',
    orderNumber: 'LUM-2024-001',
    level: 1,
    levelName: 'Niveau 1 - Guidance Spirituelle',
    customerEmail: 'client1@email.com',
    customerName: 'Marie Dupont',
    status: 'paid',
    amount: 29.99,
    currency: 'EUR',
    createdAt: new Date('2024-12-01T10:30:00Z'),
    updatedAt: new Date('2024-12-01T10:30:00Z'),
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
      paidAt: new Date('2024-12-01T10:30:00Z')
    }
  },
  {
    _id: '674b7e123456789012345102',
    orderNumber: 'LUM-2024-002',
    level: 2,
    levelName: 'Niveau 2 - Lecture Avancée',
    customerEmail: 'client2@email.com',
    customerName: 'Sophie Martin',
    status: 'paid',
    amount: 49.99,
    currency: 'EUR',
    createdAt: new Date('2024-12-01T11:15:00Z'),
    updatedAt: new Date('2024-12-01T11:15:00Z'),
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
      paidAt: new Date('2024-12-01T11:15:00Z')
    }
  },
  {
    _id: '674b7e123456789012345103',
    orderNumber: 'LUM-2024-003',
    level: 3,
    levelName: 'Niveau 3 - Consultation Complète',
    customerEmail: 'client3@email.com',
    customerName: 'Jean Moreau',
    status: 'paid',
    amount: 79.99,
    currency: 'EUR',
    createdAt: new Date('2024-12-01T14:20:00Z'),
    updatedAt: new Date('2024-12-01T14:20:00Z'),
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
      paidAt: new Date('2024-12-01T14:20:00Z')
    }
  },
  {
    _id: '674b7e123456789012345104',
    orderNumber: 'LUM-2024-004',
    level: 1,
    levelName: 'Niveau 1 - Guidance Spirituelle',
    customerEmail: 'client4@email.com',
    customerName: 'Anna Leroy',
    status: 'paid',
    amount: 29.99,
    currency: 'EUR',
    createdAt: new Date('2024-12-02T08:45:00Z'),
    updatedAt: new Date('2024-12-02T08:45:00Z'),
    details: {
      birthDate: '1992-09-12',
      birthTime: '11:20',
      birthPlace: 'Toulouse, France',
      question: 'Je me sens perdue et j\'ai besoin de clarté sur ma direction spirituelle.',
      specificRequest: 'Guidance pour retrouver mon chemin spirituel'
    },
    payment: {
      stripeSessionId: 'cs_test_101',
      stripePaymentIntentId: 'pi_test_101',
      paidAt: new Date('2024-12-02T08:45:00Z')
    }
  }
];

export const testStats = {
  pending: 4,
  paid: 4,
  processing: 0,
  completed: 0,
  treatedToday: 0,
  totalTreated: 12
};
