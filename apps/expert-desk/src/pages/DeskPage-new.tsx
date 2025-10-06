import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LogOut, 
  Bell, 
  Users, 
  Wand2, 
  CheckCircle,
  Clock,
  TrendingUp,
  AlertCircle,
  Eye
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import OrdersQueue from '../components/OrdersQueue';
import ValidationQueue from '../components/ValidationQueue';
import ContentGenerator from '../components/ContentGenerator';
import ContentValidator from '../components/ContentValidator';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import type { Order, Stats } from '../types/Order';

// Use shared Order and Stats types from ../types/Order

const DeskPage: React.FC = () => {
  const { expert, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [validationOrders, setValidationOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedValidationOrder, setSelectedValidationOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'validation'>('orders');
  const [stats, setStats] = useState<Stats>({
    pending: 0,
    paid: 0,
    processing: 0,
    completed: 0,
    awaitingValidation: 0,
    treatedToday: 0,
    totalTreated: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchOrders(),
        fetchValidationOrders(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/expert/orders/pending');
      console.log('📋 Fetched pending orders:', response.data);
      
      if (response.data && response.data.orders) {
        setOrders(response.data.orders);
        console.log(`✅ Loaded ${response.data.orders.length} pending orders`);
      } else {
        setOrders([]);
        console.log('⚠️ No orders in response');
      }
    } catch (error: any) {
      console.error('❌ Error fetching orders:', error);
      const errorMessage = error.response?.data?.error || 'Erreur lors du chargement des commandes';
      toast.error(errorMessage);
      setOrders([]);
    }
  };

  const fetchValidationOrders = async () => {
    try {
      const response = await api.get('/expert/orders/validation-queue');
      console.log('📋 Fetched validation orders:', response.data);
      
      if (response.data && response.data.orders) {
        setValidationOrders(response.data.orders);
        console.log(`✅ Loaded ${response.data.orders.length} validation orders`);
      } else {
        setValidationOrders([]);
        console.log('⚠️ No validation orders in response');
      }
    } catch (error: any) {
      console.error('❌ Error fetching validation orders:', error);
      const errorMessage = error.response?.data?.error || 'Erreur lors du chargement des validations';
      toast.error(errorMessage);
      setValidationOrders([]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/expert/stats');
      setStats(response.data);
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      if (error.response?.status !== 401) {
        toast.error('Erreur lors du chargement des statistiques');
      }
    }
  };

  const handleTakeOrder = async (order: Order) => {
    try {
      console.log('🎯 Taking order:', order._id);
      const response = await api.post(`/expert/orders/${order._id}/assign`);
      console.log('✅ Order assigned successfully:', response.data);
      
      toast.success('Commande prise en charge avec succès !');
      
      // Actualiser la liste des commandes
      await fetchOrders();
      
      // Fermer les détails si c'était la commande sélectionnée
      if (selectedOrder?._id === order._id) {
        setSelectedOrder(null);
      }
    } catch (error: any) {
      console.error('❌ Error taking order:', error);
      const errorMessage = error.response?.data?.error || 'Erreur lors de la prise en charge';
      toast.error(errorMessage);
    }
  };

  const handleValidateContent = async (orderId: string, action: 'approve' | 'reject', notes: string, rejectionReason?: string) => {
    try {
      console.log('🔍 Validating content:', { orderId, action, notes, rejectionReason });
      
      const payload = {
        orderId,
        action,
        validationNotes: notes,
        ...(rejectionReason && { rejectionReason })
      };
      
      const response = await api.post('/expert/validate-content', payload);
      console.log('✅ Content validated:', response.data);
      
      toast.success(response.data.message || 'Validation effectuée avec succès');
      
      // Actualiser les données
      await fetchValidationOrders();
      await fetchStats();
      
      // Réinitialiser la sélection
      setSelectedValidationOrder(null);
      
    } catch (error: any) {
      console.error('❌ Error validating content:', error);
      const errorMessage = error.response?.data?.error || 'Erreur lors de la validation';
      toast.error(errorMessage);
    }
  };

  const handleValidationOrderSelect = (order: Order) => {
    setSelectedValidationOrder(order);
    setActiveTab('validation');
  };

  const refreshOrders = async () => {
    setRefreshing(true);
    await fetchOrders();
    await fetchValidationOrders();
    await fetchStats();
    setRefreshing(false);
    toast.success('Données actualisées');
  };

  const handleOrderUpdate = () => {
    refreshOrders();
    setSelectedOrder(null);
    setSelectedValidationOrder(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg text-white">
      {/* Header */}
      <header className="bg-slate-800/80 backdrop-blur-xl border-b border-amber-500/20 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Expert Desk</h1>
              <p className="text-sm text-slate-400">
                Bonjour, <span className="text-amber-400">{expert?.name}</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Bell className={`w-5 h-5 ${(stats.pending + stats.awaitingValidation) > 0 ? 'text-yellow-400 animate-pulse' : 'text-slate-400'}`} />
              <span className="text-sm">
                {stats.pending} commandes, {stats.awaitingValidation} validations
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 transition-colors rounded-lg hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      {/* Stats Dashboard */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <motion.div 
            className="glass rounded-xl p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
                <p className="text-sm text-slate-400">En attente</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="glass rounded-xl p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-blue-400">{stats.processing}</p>
                <p className="text-sm text-slate-400">En traitement</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="glass rounded-xl p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-2xl font-bold text-amber-400">{stats.awaitingValidation || 0}</p>
                <p className="text-sm text-slate-400">Validation</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="glass rounded-xl p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-green-400">{stats.treatedToday}</p>
                <p className="text-sm text-slate-400">Traitées aujourd'hui</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="glass rounded-xl p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-2xl font-bold text-amber-400">{stats.totalTreated}</p>
                <p className="text-sm text-slate-400">Total traitées</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => {
              setActiveTab('orders');
              setSelectedValidationOrder(null);
            }}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-amber-400 text-slate-900'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Wand2 className="w-5 h-5" />
            Commandes ({stats.pending})
          </button>
          <button
            onClick={() => {
              setActiveTab('validation');
              setSelectedOrder(null);
            }}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'validation'
                ? 'bg-amber-400 text-slate-900'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Eye className="w-5 h-5" />
            Validations ({stats.awaitingValidation || 0})
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Column - Orders or Validation Queue */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            {activeTab === 'orders' ? (
              <OrdersQueue 
                orders={orders}
                selectedOrder={selectedOrder}
                onSelectOrder={(order: Order) => setSelectedOrder(order)}
                onRefresh={refreshOrders}
                refreshing={refreshing}
                onTakeOrder={handleTakeOrder}
              />
            ) : (
              <ValidationQueue
                orders={validationOrders}
                selectedOrder={selectedValidationOrder}
                onSelectOrder={handleValidationOrderSelect}
                onValidateContent={handleValidationOrderSelect}
                onRefresh={refreshOrders}
                refreshing={refreshing}
              />
            )}
          </motion.div>
          
          {/* Right Column - Content Generator or Validator */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            {activeTab === 'orders' ? (
              <ContentGenerator 
                order={selectedOrder}
                onOrderUpdate={handleOrderUpdate}
              />
            ) : (
              <ContentValidator
                order={selectedValidationOrder}
                onBack={() => setSelectedValidationOrder(null)}
                onApprove={async (orderId, notes) => {
                  await handleValidateContent(orderId, 'approve', notes);
                }}
                onReject={async (orderId, notes, reason) => {
                  await handleValidateContent(orderId, 'reject', notes, reason);
                }}
                isProcessing={false}
              />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DeskPage;
