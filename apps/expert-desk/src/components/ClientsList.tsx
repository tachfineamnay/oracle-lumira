import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Mail, 
  Phone, 
  TrendingUp, 
  User,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  ChevronDown,
  MoreVertical
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
  const [showFilters, setShowFilters] = useState(false);

  // Filtrage des clients
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.lastName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || client.subscriptionStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'trial':
        return <Clock className="w-4 h-4 text-amber-400" />;
      default:
        return <XCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'trial': return 'Essai';
      default: return 'Inactif';
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

  return (
    <div className="glass rounded-xl p-6 h-[calc(100vh-300px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Gestion des Clients</h2>
            <p className="text-sm text-slate-400">
              {filteredClients.length} client{filteredClients.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
          title="Actualiser"
        >
          <TrendingUp className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* Filtres */}
      <div className="mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filtres
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
        
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 p-3 bg-slate-800/30 rounded-lg"
          >
            <div className="flex gap-2">
              {(['all', 'active', 'trial', 'inactive'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    statusFilter === status
                      ? 'bg-purple-500 text-white'
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {status === 'all' ? 'Tous' : getStatusLabel(status)}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Liste des clients */}
      <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Aucun client trouvé</p>
          </div>
        ) : (
          filteredClients.map((client) => {
            const stats = clientStats?.get(client._id);
            const isSelected = selectedClient?._id === client._id;
            
            return (
              <motion.div
                key={client._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => onSelectClient(client)}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-purple-500/20 border-2 border-purple-500'
                    : 'bg-slate-800/50 border border-slate-700 hover:border-purple-500/50 hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">
                        {client.firstName} {client.lastName}
                      </h3>
                      {getStatusIcon(client.subscriptionStatus)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                      <Mail className="w-3 h-3" />
                      {client.email}
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Phone className="w-3 h-3" />
                        {client.phone}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Actions menu
                    }}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                {/* Statistiques rapides */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-700/50">
                  <div className="text-center">
                    <p className="text-xs text-slate-400">Commandes</p>
                    <p className="text-sm font-semibold text-white">{client.totalOrders}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400">Complétées</p>
                    <p className="text-sm font-semibold text-green-400">
                      {stats?.completedOrders || 0}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400">Dernière</p>
                    <p className="text-xs font-semibold text-slate-300">
                      {formatDate(client.lastOrderAt)}
                    </p>
                  </div>
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
