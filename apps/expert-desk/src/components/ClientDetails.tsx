import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  CreditCard,
  TrendingUp,
  Package,
  CheckCircle,
  Clock,
  MapPin,
  FileText,
  Edit,
  MessageCircle
} from 'lucide-react';
import type { Client, ClientStats } from '../types/Client';
import type { Order } from '../types/Order';

interface ClientDetailsProps {
  client: Client | null;
  stats?: ClientStats;
  orders?: Order[];
}

const ClientDetails: React.FC<ClientDetailsProps> = ({
  client,
  stats,
  orders = []
}) => {
  const [isEditing, setIsEditing] = useState(false);

  if (!client) {
    return (
      <div className="glass rounded-xl p-6 h-[calc(100vh-300px)] flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Sélectionnez un client</p>
          <p className="text-slate-500 text-sm mt-2">
            Choisissez un client dans la liste pour voir ses détails
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date | undefined | string) => {
    if (!date) return 'Non défini';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-500/20 text-green-400 border-green-500/30',
      trial: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      inactive: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    };
    
    const labels = {
      active: 'Actif',
      trial: 'Période d\'essai',
      inactive: 'Inactif'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || styles.inactive}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getLevelName = (level: number) => {
    const levels: Record<number, string> = {
      1: 'Simple',
      2: 'Intuitive',
      3: 'Alchimique',
      4: 'Intégrale'
    };
    return levels[level] || `Niveau ${level}`;
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'processing': return 'text-blue-400';
      case 'awaiting_validation': return 'text-amber-400';
      case 'pending': return 'text-slate-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="glass rounded-xl p-6 h-[calc(100vh-300px)] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {client.firstName.charAt(0)}{client.lastName.charAt(0)}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {client.firstName} {client.lastName}
            </h2>
            {getStatusBadge(client.subscriptionStatus)}
          </div>
        </div>

        {/* Actions rapides */}
        <div className="flex gap-2">
          <button
            onClick={() => window.location.href = `mailto:${client.email}`}
            className="p-2 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 rounded-lg transition-colors"
            title="Contacter"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
            title="Modifier"
          >
            <Edit className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Statistiques principales */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <p className="text-xs text-slate-400">Chiffre d'affaires</p>
            </div>
            <p className="text-xl font-bold text-white">
              {formatCurrency(stats.totalRevenue)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/50 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-purple-400" />
              <p className="text-xs text-slate-400">Complétées</p>
            </div>
            <p className="text-xl font-bold text-white">
              {stats.completedOrders}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/50 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <p className="text-xs text-slate-400">En cours</p>
            </div>
            <p className="text-xl font-bold text-white">
              {stats.pendingOrders}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-800/50 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-blue-400" />
              <p className="text-xs text-slate-400">Panier moyen</p>
            </div>
            <p className="text-xl font-bold text-white">
              {formatCurrency(stats.averageOrderValue)}
            </p>
          </motion.div>
        </div>
      )}

      {/* Informations personnelles */}
      <div className="bg-slate-800/30 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-purple-400" />
          Informations personnelles
        </h3>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300">{client.email}</span>
          </div>

          {client.phone && (
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300">{client.phone}</span>
            </div>
          )}

          {client.dateOfBirth && (
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300">Né(e) le {formatDate(client.dateOfBirth)}</span>
            </div>
          )}

          {client.stripeCustomerId && (
            <div className="flex items-center gap-3">
              <CreditCard className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300 text-xs font-mono">{client.stripeCustomerId}</span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2 border-t border-slate-700">
            <Clock className="w-4 h-4 text-slate-400" />
            <div className="text-sm">
              <span className="text-slate-400">Client depuis le </span>
              <span className="text-slate-300 font-medium">{formatDate(client.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profil spirituel */}
      {client.profile && client.profile.profileCompleted && (
        <div className="bg-slate-800/30 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            Profil spirituel
          </h3>

          <div className="space-y-3 text-sm">
            {client.profile.birthDate && (
              <div>
                <p className="text-slate-400 mb-1">Date de naissance</p>
                <p className="text-slate-300">{client.profile.birthDate}</p>
              </div>
            )}

            {client.profile.birthTime && (
              <div>
                <p className="text-slate-400 mb-1">Heure de naissance</p>
                <p className="text-slate-300">{client.profile.birthTime}</p>
              </div>
            )}

            {client.profile.birthPlace && (
              <div>
                <p className="text-slate-400 mb-1">Lieu de naissance</p>
                <p className="text-slate-300 flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  {client.profile.birthPlace}
                </p>
              </div>
            )}

            {client.profile.objective && (
              <div>
                <p className="text-slate-400 mb-1">Objectif spirituel</p>
                <p className="text-slate-300 italic">"{client.profile.objective}"</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Historique des commandes */}
      <div className="bg-slate-800/30 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-400" />
          Historique des commandes ({orders.length})
        </h3>

        <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {orders.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">
              Aucune commande pour ce client
            </p>
          ) : (
            orders.map((order) => (
              <div
                key={order._id}
                className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium text-sm">
                      {order.orderNumber}
                    </span>
                    <span className="text-xs text-slate-400">
                      {getLevelName(order.level)}
                    </span>
                  </div>
                  <p className={`text-xs ${getOrderStatusColor(order.status)}`}>
                    {order.status}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-white font-semibold text-sm">
                    {formatCurrency(order.amount / 100)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;
