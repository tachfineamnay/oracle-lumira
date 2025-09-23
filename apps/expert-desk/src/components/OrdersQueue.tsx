import { Order } from '../types/Order';
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Euro, 
  User, 
  Calendar, 
  RefreshCw, 
  FileText,
  Mail,
  Phone,
  CheckCircle
} from 'lucide-react';

interface OrdersQueueProps {
  orders: Order[];
  selectedOrder: Order | null;
  onSelectOrder: (order: Order) => void;
  onTakeOrder: (order: Order) => void;
  onRefresh: () => void;
  refreshing: boolean;
  takingOrder?: string; // ID of the order being taken
}

const OrdersQueue: React.FC<OrdersQueueProps> = ({
  orders,
  selectedOrder,
  onSelectOrder,
  onTakeOrder,
  onRefresh,
  refreshing,
  takingOrder
}) => {
  const levelColors: Record<string, string> = {
    'Simple': 'text-gray-400 bg-gray-500/10 border-gray-500/20',
    'Intuitive': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    'Alchimique': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    'Intégrale': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
  };

  const formatPrice = (amount: number) => {
    return amount === 0 ? 'Gratuit' : `${(amount / 100).toFixed(0)}€`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="card h-fit">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-400" />
          Queue des commandes
        </h2>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="btn-secondary text-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Actualisation...' : 'Actualiser'}
        </button>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-hide">
        {orders.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">Aucune commande en attente</p>
            <p className="text-sm">Les nouvelles commandes apparaîtront ici</p>
          </div>
        ) : (
          orders.map((order, index) => (
            <motion.div
              key={order._id}
              onClick={() => onSelectOrder(order)}
              className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                selectedOrder?._id === order._id
                  ? 'border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-400/20'
                  : 'border-white/20 hover:border-white/40 hover:bg-white/10'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                      levelColors[order.levelName] || levelColors['Simple']
                    }`}>
                      Niveau {order.level} - {order.levelName}
                    </span>
                    <div className="flex items-center gap-1 text-green-400">
                      <Euro className="w-3 h-3" />
                      <span className="text-sm font-medium">
                        {formatPrice(order.amount)}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    #{order.orderNumber}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">
                    {order.formData.firstName} {order.formData.lastName}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Mail className="w-4 h-4" />
                  <span>{order.formData.email}</span>
                </div>

                {order.formData.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Phone className="w-4 h-4" />
                    <span>{order.formData.phone}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(order.createdAt)}</span>
                </div>

                {order.files && order.files.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-amber-400">
                    <FileText className="w-4 h-4" />
                    <span>{order.files.length} fichier(s) joint(s)</span>
                  </div>
                )}

                {order.formData.specificQuestion && (
                  <div className="mt-2 p-2 bg-white/10 rounded border border-white/20 text-xs text-white/80">
                    <p className="font-medium mb-1 text-amber-400">Question :</p>
                    <p className="line-clamp-2">{order.formData.specificQuestion}</p>
                  </div>
                )}

                {/* Take Order Button */}
                <div className="mt-3 pt-3 border-t border-white/20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTakeOrder(order);
                    }}
                    disabled={takingOrder === order._id}
                    className="w-full btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className={`w-4 h-4 mr-2 ${takingOrder === order._id ? 'animate-spin' : ''}`} />
                    {takingOrder === order._id ? 'Prise en cours...' : 'Prendre cette commande'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {orders.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <p className="text-xs text-slate-400 text-center">
            {orders.length} commande{orders.length > 1 ? 's' : ''} en attente de traitement
          </p>
        </div>
      )}
    </div>
  );
};

export default OrdersQueue;
