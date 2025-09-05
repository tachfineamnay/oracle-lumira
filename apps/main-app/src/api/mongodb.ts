// Mock MongoDB operations for MVP
// In production, this would connect to real MongoDB

export interface User {
  _id: string;
  email: string;
  firstName: string;
  dateNaissance: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  userId: string;
  level: number;
  upsells: {
    mandala: boolean;
    audio: boolean;
    rituel: boolean;
    pack: boolean;
  };
  answers: {
    intention?: string;
    blockages?: string;
    familyHistory?: string;
    photoUrl?: string;
  };
  persona: {
    archetype: string;
    color: string;
    phrase: string;
  };
  pdfUrl?: string;
  audioUrl?: string;
  mandalaUrl?: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  createdAt: string;
  updatedAt: string;
}

// Mock data storage
let mockUsers: User[] = [];
let mockOrders: Order[] = [];

// User operations
export const createUser = async (userData: Partial<User>): Promise<User> => {
  const user: User = {
    _id: `user_${Date.now()}`,
    email: userData.email || '',
    firstName: userData.firstName || '',
    dateNaissance: userData.dateNaissance || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  mockUsers.push(user);
  console.log('Created user:', user);
  return user;
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const user = mockUsers.find(u => u.email === email);
  console.log('Finding user by email:', email, user ? 'found' : 'not found');
  return user || null;
};

export const getUserById = async (userId: string): Promise<User | null> => {
  const user = mockUsers.find(u => u._id === userId);
  return user || null;
};

// Order operations
export const createOrder = async (orderData: Partial<Order>): Promise<Order> => {
  const order: Order = {
    _id: `order_${Date.now()}`,
    userId: orderData.userId || '',
    level: orderData.level || 1,
    upsells: orderData.upsells || { mandala: false, audio: false, rituel: false, pack: false },
    answers: orderData.answers || {},
    persona: orderData.persona || { archetype: '', color: '', phrase: '' },
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  mockOrders.push(order);
  console.log('Created order:', order);
  return order;
};

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  const order = mockOrders.find(o => o._id === orderId);
  return order || null;
};

export const getOrdersByUserId = async (userId: string): Promise<Order[]> => {
  const orders = mockOrders.filter(o => o.userId === userId);
  return orders;
};

export const updateOrder = async (orderId: string, updates: Partial<Order>): Promise<Order | null> => {
  const index = mockOrders.findIndex(o => o._id === orderId);
  if (index === -1) return null;
  
  mockOrders[index] = {
    ...mockOrders[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  console.log('Updated order:', mockOrders[index]);
  return mockOrders[index];
};

export const getPendingOrders = async (): Promise<Order[]> => {
  const orders = mockOrders.filter(o => o.status === 'pending');
  return orders;
};

// Helper to get all data (for debugging)
export const getAllMockData = () => ({
  users: mockUsers,
  orders: mockOrders
});

// Reset mock data (for testing)
export const resetMockData = () => {
  mockUsers = [];
  mockOrders = [];
  console.log('Mock data reset');
};
