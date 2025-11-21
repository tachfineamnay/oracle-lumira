export interface Client {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: Date;
  stripeCustomerId?: string;
  subscriptionStatus: 'active' | 'inactive' | 'trial';
  totalOrders: number;
  lastOrderAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Profil additionnel
  profile?: {
    birthDate?: string;
    birthTime?: string;
    birthPlace?: string;
    specificQuestion?: string;
    objective?: string;
    facePhotoUrl?: string;
    palmPhotoUrl?: string;
    profileCompleted?: boolean;
    submittedAt?: Date;
  };
}

export interface ClientStats {
  totalRevenue: number;
  completedOrders: number;
  pendingOrders: number;
  averageOrderValue: number;
  lastOrderDate?: Date;
  favoriteLevel?: number;
}

export interface ClientFilters {
  search?: string;
  status?: 'active' | 'inactive' | 'trial' | 'all';
  hasOrders?: boolean;
  sortBy?: 'createdAt' | 'totalOrders' | 'lastOrderAt';
  sortOrder?: 'asc' | 'desc';
}
