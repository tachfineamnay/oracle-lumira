import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Phone, 
  User,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Euro,
  Calendar
} from 'lucide-react';
import type { Client, ClientStats } from '../types/Client';

interface ClientsListProps {
  clients: Client[];
  selectedClient: Client | null;
  onSelectClient: (client: Client) => void;
  onRefresh: () => void;
  refreshing: boolean;
  clientStats?: Map<string, ClientStats>;
}

const ClientsList: React.FC<ClientsListProps> = ({
  clients,
  selectedClient,
  onSelectClient,
  onRefresh,
  refreshing,
  clientStats
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'trial'>('all');

  // Filtrage des clients
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.lastName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || client.subscriptionStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
            <CheckCircle className="w-3 h-3" />
            Actif
          </span>
        );
      case 'trial':
        return (
          <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full">
            <Clock className="w-3 h-3" />
            Essai
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-xs text-slate-400 bg-slate-400/10 px-2 py-1 rounded-full">
            <XCircle className="w-3 h-3" />
            Inactif
          </span>
        );
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Jamais';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatRevenue = (amount: number) => {
    return `${(amount / 100).toFixed(0)}€`;
  };

  return (
    <div className="glass rounded-xl p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Gestion des Clients</h2>
          <p className="text-sm text-slate-400">{filteredClients.length} client{filteredClients.length > 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
          title="Actualiser"
        >
          <RefreshCw className={`w-5 h-5 text-amber-400 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-amber-400 text-slate-900'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'active'
                ? 'bg-green-400 text-slate-900'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
            }`}
          >
            Actifs
          </button>
          <button
            onClick={() => setStatusFilter('trial')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'trial'
                ? 'bg-amber-400 text-slate-900'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
            }`}
          >
            Essais
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'inactive'
                ? 'bg-slate-400 text-slate-900'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
            }`}
          >
            Inactifs
          </button>
        </div>
      </div>

      {/* Clients List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 -mr-2">
        {filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Aucun client trouvé</p>
          </div>
        ) : (
          filteredClients.map((client, index) => {
            const stats = clientStats?.get(client._id);
            const isSelected = selectedClient?._id === client._id;
            
            return (
              <motion.div
                key={client._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`group relative bg-slate-800/30 hover:bg-slate-800/50 rounded-lg p-4 cursor-pointer transition-all border ${
                  isSelected
                    ? 'border-amber-400/50 bg-slate-800/50'
                    : 'border-slate-700/30 hover:border-slate-600/50'
                }`}
                onClick={() => onSelectClient(client)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-purple-400/10 rounded-lg">
                      <User className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-white truncate">
                          {client.firstName} {client.lastName}
                        </p>
                        {getStatusBadge(client.subscriptionStatus)}
                      </div>
                      <p className="text-sm text-slate-400 truncate">{client.email}</p>
                      {client.phone && (
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                          <Phone className="w-3 h-3" />
                          {client.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-mono bg-slate-900/50 px-2 py-1 rounded">
                      {client.totalOrders} commande{client.totalOrders > 1 ? 's' : ''}
                    </span>
                    {stats && (
                      <>
                        <span className="px-2 py-1 bg-green-400/10 text-green-400 rounded flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {stats.completedOrders}
                        </span>
                        {stats.totalRevenue > 0 && (
                          <span className="px-2 py-1 bg-amber-400/10 text-amber-400 rounded flex items-center gap-1">
                            <Euro className="w-3 h-3" />
                            {formatRevenue(stats.totalRevenue)}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {client.lastOrderAt && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      Dernière commande: {formatDate(client.lastOrderAt)}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ClientsList;
