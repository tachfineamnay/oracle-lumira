import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LogOut, 
  Bell, 
  Users, 
  Wand2, 
  CheckCircle,
  Clock,
  TrendingUp 
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/LoadingSpinner';
import OrdersQueue from '../components/OrdersQueue';
import ContentGenerator from '../components/ContentGenerator';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

interface Order {
  _id: string;
  orderNumber: string;
  level: number;
  levelName: string;
  amount: number;
  status: string;
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    specificQuestion?: string;
  };
  files?: Array<{
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
  }>;
  clientInputs?: {
    birthTime?: string;
    birthPlace?: string;
    specificContext?: string;
    lifeQuestion?: string;
  };
  createdAt: string;
  userId: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}

interface Stats {
  pending: number;
  paid: number;
  processing: number;
  completed: number;
  treatedToday: number;
  totalTreated: number;
}

const DeskPage: React.FC = () => {
  const { expert, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [stats, setStats] = useState<Stats>({
    pending: 0,
    paid: 0,
    processing: 0,
    completed: 0,
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
      setOrders(response.data.orders || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      if (error.response?.status !== 401) {
        toast.error('Erreur lors du chargement des commandes');
      }
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

  const refreshOrders = async () => {
    setRefreshing(true);
    await fetchOrders();
    await fetchStats();
    setRefreshing(false);
    toast.success('Données actualisées');
  };

  const handleOrderUpdate = () => {
    refreshOrders();
    setSelectedOrder(null);
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
      <header className="bg-slate-800/80 backdrop-blur-xl border-b border-purple-500/20 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Expert Desk</h1>
              <p className="text-sm text-slate-400">
                Bonjour, <span className="text-purple-400">{expert?.name}</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Bell className={`w-5 h-5 ${stats.pending > 0 ? 'text-yellow-400 animate-pulse' : 'text-slate-400'}`} />
              <span className="text-sm">
                {stats.pending} en attente
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-purple-400">{stats.totalTreated}</p>
                <p className="text-sm text-slate-400">Total traitées</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Orders Queue */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <OrdersQueue 
              orders={orders}
              selectedOrder={selectedOrder}
              onSelectOrder={setSelectedOrder}
              onRefresh={refreshOrders}
              refreshing={refreshing}
            />
          </motion.div>
          
          {/* Content Generator */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <ContentGenerator 
              order={selectedOrder}
              onOrderUpdate={handleOrderUpdate}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DeskPage;
