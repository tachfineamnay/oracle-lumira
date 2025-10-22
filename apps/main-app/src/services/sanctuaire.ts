import { apiRequest } from '../utils/api';

export interface SanctuaireUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  level: number;
}

export interface CompletedOrder {
  id: string;
  orderNumber: string;
  level: number;
  levelName: string;
  amount: number;
  status: string;
  createdAt: string;
  deliveredAt?: string;
  generatedContent?: {
    archetype?: string;
    reading?: string;
    audioUrl?: string;
    pdfUrl?: string;
    mandalaSvg?: string;
    ritual?: string;
    blockagesAnalysis?: string;
    soulProfile?: string;
  };
  expertValidation?: {
    validatorName?: string;
    validationNotes?: string;
    validatedAt?: string;
  };
  formData?: {
    firstName: string;
    lastName: string;
    specificQuestion?: string;
  };
}

export interface SanctuaireStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalSpent: number;
  currentLevel: number;
  maxLevel: number;
  levelProgress: number;
  lastOrderDate?: string;
  availableContent: {
    readings: number;
    audios: number;
    pdfs: number;
    mandalas: number;
  };
}

export interface OrderContent {
  order: {
    id: string;
    orderNumber: string;
    level: number;
    levelName: string;
    amount: number;
    createdAt: string;
    deliveredAt?: string;
  };
  client: {
    firstName: string;
    lastName: string;
    specificQuestion?: string;
  };
  generatedContent?: {
    archetype?: string;
    reading?: string;
    audioUrl?: string;
    pdfUrl?: string;
    mandalaSvg?: string;
    ritual?: string;
    blockagesAnalysis?: string;
    soulProfile?: string;
  };
  expertValidation?: {
    validatedAt?: string;
    validationNotes?: string;
    validatorName?: string;
  };
  availableFormats: {
    hasReading: boolean;
    hasPdf: boolean;
    hasAudio: boolean;
    hasMandala: boolean;
    hasRitual: boolean;
  };
}

class SanctuaireService {
  private token: string | null = null;

  /**
   * Authentification sanctuaire avec email
   */
  async authenticateWithEmail(email: string): Promise<{ token: string; user: SanctuaireUser }> {
    // Use v2 which accepts paid orders and completed product orders
    const response = await apiRequest<{ success: boolean; token: string; user: SanctuaireUser }>('/users/auth/sanctuaire-v2', {
      method: 'POST',
      body: JSON.stringify({ email })
    });

    if (response.success) {
      this.token = response.token;
      localStorage.setItem('sanctuaire_token', response.token);
      return { token: response.token, user: response.user };
    }

    throw new Error('Authentification échouée');
  }

  /**
   * Récupérer le token stocké
   */
  getStoredToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('sanctuaire_token');
    }
    return this.token;
  }

  /**
   * Supprimer le token (déconnexion)
   */
  logout(): void {
    this.token = null;
    localStorage.removeItem('sanctuaire_token');
  }

  /**
   * Récupérer les commandes complétées de l'utilisateur
   */
  async getUserCompletedOrders(): Promise<{ orders: CompletedOrder[]; total: number; user: SanctuaireUser }> {
    const token = this.getStoredToken();
    if (!token) {
      throw new Error('Token d\'authentification requis');
    }

    return apiRequest<{ orders: CompletedOrder[]; total: number; user: SanctuaireUser }>('/users/orders/completed', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  /**
   * Récupérer les statistiques du sanctuaire
   */
  async getSanctuaireStats(): Promise<SanctuaireStats> {
    const token = this.getStoredToken();
    if (!token) {
      throw new Error('Token d\'authentification requis');
    }

    return apiRequest<SanctuaireStats>('/users/sanctuaire/stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  /**
   * Récupérer le contenu complet d'une commande
   */
  async getOrderContent(orderId: string): Promise<OrderContent> {
    const token = this.getStoredToken();
    if (!token) {
      throw new Error('Token d\'authentification requis');
    }

    return apiRequest<OrderContent>(`/orders/${orderId}/content`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }

  /**
   * Obtenir une URL signée pour l'accès sécurisé aux fichiers
   */
  async getPresignedUrl(url: string): Promise<string> {
    const token = this.getStoredToken();
    if (!token) {
      throw new Error('Token d\'authentification requis');
    }

    const response = await apiRequest<{ signedUrl: string; expiresIn: number }>(`/users/files/presign?url=${encodeURIComponent(url)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.signedUrl;
  }

  /**
   * Télécharger un fichier (PDF, Audio)
   */
  async downloadFile(url: string, filename: string): Promise<void> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      throw new Error('Impossible de télécharger le fichier');
    }
  }
}

export const sanctuaireService = new SanctuaireService();
