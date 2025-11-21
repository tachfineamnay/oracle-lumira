import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  RefreshCw, 
  Search, 
  Calendar, 
  User, 
  FileText, 
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  Trash2
} from 'lucide-react';
import type { Order } from '../types/Order';

interface Props {
  orders: Order[];
  selectedOrder: Order | null;
  onSelectOrder: (order: Order) => void;
  onRegenerate: (order: Order) => void;
  onDeleteOrder: (order: Order) => void;
  onRefresh: () => void;
  refreshing: boolean;
  regeneratingOrder?: string;
  deletingOrder?: string;
}

const HistoryQueue: React.FC<Props> = ({
  orders,
  selectedOrder,
  onSelectOrder,
  onRegenerate,
  onDeleteOrder,
  onRefresh,
  refreshing,
  regeneratingOrder,
  deletingOrder
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'rejected'>('all');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.formData.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.formData.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.formData.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'approved' && order.expertValidation?.validationStatus === 'approved') ||
      (filterStatus === 'rejected' && order.expertValidation?.validationStatus === 'rejected');

    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
            <CheckCircle className="w-3 h-3" />
            Validée
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded-full">
            <XCircle className="w-3 h-3" />
            Rejetée
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-xs text-slate-400 bg-slate-400/10 px-2 py-1 rounded-full">
            <Clock className="w-3 h-3" />
            En cours
          </span>
        );
    }
  };

  return (
    <div className="glass rounded-xl p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Historique des validations</h2>
          <p className="text-sm text-slate-400">{filteredOrders.length} lecture(s)</p>
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
            placeholder="Rechercher par nom, email, #commande..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'all'
                ? 'bg-amber-400 text-slate-900'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
            }`}
          >
            Toutes
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'approved'
                ? 'bg-green-400 text-slate-900'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
            }`}
          >
            Validées
          </button>
          <button
            onClick={() => setFilterStatus('rejected')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === 'rejected'
                ? 'bg-red-400 text-slate-900'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
            }`}
          >
            Rejetées
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 -mr-2">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">Aucune lecture trouvée</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`group relative bg-slate-800/30 hover:bg-slate-800/50 rounded-lg p-4 cursor-pointer transition-all border ${
                selectedOrder?._id === order._id
                  ? 'border-amber-400/50 bg-slate-800/50'
                  : 'border-slate-700/30 hover:border-slate-600/50'
              }`}
              onClick={() => onSelectOrder(order)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-amber-400/10 rounded-lg">
                    <User className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-white truncate">
                        {order.formData.firstName} {order.formData.lastName}
                      </p>
                      {getStatusBadge(order.expertValidation?.validationStatus || 'pending')}
                    </div>
                    <p className="text-sm text-slate-400 truncate">{order.formData.email}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-mono bg-slate-900/50 px-2 py-1 rounded">
                    #{order.orderNumber}
                  </span>
                  <span className="px-2 py-1 bg-purple-400/10 text-purple-400 rounded">
                    {order.levelName}
                  </span>
                  {order.revisionCount && order.revisionCount > 0 && (
                    <span className="px-2 py-1 bg-orange-400/10 text-orange-400 rounded flex items-center gap-1">
                      <RotateCcw className="w-3 h-3" />
                      v{order.revisionCount + 1}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Calendar className="w-3 h-3" />
                    {new Date(order.expertValidation?.validatedAt || order.updatedAt).toLocaleDateString('fr-FR')}
                  </div>

                  <div className="flex items-center gap-2">
                    {order.expertValidation?.validationStatus === 'approved' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRegenerate(order);
                        }}
                        disabled={regeneratingOrder === order._id}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-amber-400/10 text-amber-400 hover:bg-amber-400/20 rounded transition-colors disabled:opacity-50"
                        title="Relancer cette lecture"
                      >
                        {regeneratingOrder === order._id ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            En cours...
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-3 h-3" />
                            Relancer
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Voulez-vous vraiment supprimer la commande #${order.orderNumber} de l'historique ?`)) {
                          onDeleteOrder(order);
                        }
                      }}
                      disabled={deletingOrder === order._id}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded transition-colors disabled:opacity-50"
                      title="Supprimer de l'historique"
                    >
                      <Trash2 className={`w-3 h-3 ${deletingOrder === order._id ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>

              {order.expertValidation?.validationNotes && (
                <div className="mt-3 pt-3 border-t border-slate-700/50">
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {order.expertValidation.validationNotes}
                  </p>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryQueue;
