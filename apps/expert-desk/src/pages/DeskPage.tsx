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
  Eye,
  History,
  UserCircle
} from 'lucide-react';
import type { Order, Stats } from '../types/Order';
import type { Client, ClientStats } from '../types/Client';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import OrdersQueue from '../components/OrdersQueue';
import ValidationQueue from '../components/ValidationQueue';
import HistoryQueue from '../components/HistoryQueue';
import ClientsList from '../components/ClientsList';
import ClientDetails from '../components/ClientDetails';
import ContentGenerator from '../components/ContentGenerator';
import ContentValidator from '../components/ContentValidator';
import HistoryViewer from '../components/HistoryViewer';
import { api, endpoints } from '../utils/api';
import toast from 'react-hot-toast';

const DeskPage: React.FC = () => {
  // Version 2.1 - Suppression de commandes
  const { expert, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [validationOrders, setValidationOrders] = useState<Order[]>([]);
  const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedValidationOrder, setSelectedValidationOrder] = useState<Order | null>(null);
  const [selectedHistoryOrder, setSelectedHistoryOrder] = useState<Order | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'validation' | 'history' | 'clients'>('orders');
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
  const [refreshTimeout, setRefreshTimeout] = useState<number | null>(null);
  const [takingOrderId, setTakingOrderId] = useState<string | null>(null);
  const [validatingOrderId, setValidatingOrderId] = useState<string | null>(null);
  const [regeneratingOrderId, setRegeneratingOrderId] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
  const [clientStats, setClientStats] = useState<Map<string, ClientStats>>(new Map());
  const [clientOrders, setClientOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchOrders(),
        fetchValidationOrders(),
        fetchHistoryOrders(),
        fetchStats(),
        fetchClients()
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
      const response = await api.get(endpoints.expert.orders);
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
      const response = await api.get(endpoints.expert.validationQueue);
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

  const fetchHistoryOrders = async () => {
    try {
      const response = await api.get(endpoints.expert.validatedHistory);
      console.log('📚 Fetched history orders:', response.data);
      
      if (response.data && response.data.orders) {
        setHistoryOrders(response.data.orders);
        console.log(`✅ Loaded ${response.data.orders.length} history orders`);
      } else {
        setHistoryOrders([]);
        console.log('⚠️ No history orders in response');
      }
    } catch (error: any) {
      console.error('❌ Error fetching history orders:', error);
      const errorMessage = error.response?.data?.error || 'Erreur lors du chargement de l\'historique';
      toast.error(errorMessage);
      setHistoryOrders([]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get(endpoints.expert.stats);
      setStats(response.data);
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      if (error.response?.status !== 401) {
        toast.error('Erreur lors du chargement des statistiques');
      }
    }
  };

  const fetchClients = async () => {
    try {
      const response = await api.get(endpoints.expert.clients);
      console.log('📋 Fetched clients:', response.data);
      
      if (response.data && response.data.clients) {
        setClients(response.data.clients);
        console.log(`✅ Loaded ${response.data.clients.length} clients`);
        
        // Charger les stats pour chaque client (optimisé avec Promise.all)
        const statsMap = new Map<string, ClientStats>();
        await Promise.all(
          response.data.clients.slice(0, 20).map(async (client: Client) => {
            try {
              const statsResponse = await api.get(endpoints.expert.clientStats(client._id));
              statsMap.set(client._id, statsResponse.data);
            } catch (err) {
              console.error(`Error fetching stats for client ${client._id}:`, err);
            }
          })
        );
        setClientStats(statsMap);
      } else {
        setClients([]);
        console.log('⚠️ No clients in response');
      }
    } catch (error: any) {
      console.error('❌ Error fetching clients:', error);
      const errorMessage = error.response?.data?.error || 'Erreur lors du chargement des clients';
      toast.error(errorMessage);
      setClients([]);
    }
  };

  const handleSelectClient = async (client: Client) => {
    try {
      setSelectedClient(client);
      
      // Charger les commandes du client
      const ordersResponse = await api.get(endpoints.expert.clientOrders(client._id));
      setClientOrders(ordersResponse.data.orders || []);
      
      // Charger ou mettre à jour les stats si nécessaire
      if (!clientStats.has(client._id)) {
        const statsResponse = await api.get(endpoints.expert.clientStats(client._id));
        setClientStats(new Map(clientStats).set(client._id, statsResponse.data));
      }
    } catch (error: any) {
      console.error('❌ Error loading client details:', error);
      toast.error('Erreur lors du chargement des détails du client');
    }
  };

  const handleTakeOrder = async (order: Order) => {
    try {
      console.log('🎯 Taking order:', order._id);
      setTakingOrderId(order._id);
      
      const response = await api.post(endpoints.expert.assignOrder(order._id));
      console.log('✅ Order assigned successfully:', response.data);
      
      toast.success('Commande prise en charge avec succès !');
      
      // Ouvrir la commande dans le générateur de contenu
      setSelectedOrder(order);
      setActiveTab('orders');
      
      // Actualiser la liste des commandes en arrière-plan
      await fetchOrders();
    } catch (error: any) {
      console.error('❌ Error taking order:', error);
      const errorMessage = error.response?.data?.error || 'Erreur lors de la prise en charge';
      toast.error(errorMessage);
    } finally {
      setTakingOrderId(null);
    }
  };

  const handleValidateContent = async (orderId: string, action: 'approve' | 'reject', notes: string, rejectionReason?: string) => {
    try {
      console.log('🔍 Validating content:', { orderId, action, notes, rejectionReason });
      setValidatingOrderId(orderId);
      
      const payload = {
        orderId,
        action,
        validationNotes: notes,
        ...(rejectionReason && { rejectionReason })
      };
      
      const response = await api.post(endpoints.expert.validateContent, payload);
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
    } finally {
      setValidatingOrderId(null);
    }
  };

  const handleValidationOrderSelect = (order: Order) => {
    setSelectedValidationOrder(order);
    setActiveTab('validation');
  };

  const handleHistoryOrderSelect = (order: Order) => {
    setSelectedHistoryOrder(order);
    setActiveTab('history');
  };

  const handleRegenerateLecture = async (order: Order) => {
    try {
      console.log('🔄 Regenerating lecture:', order._id);
      setRegeneratingOrderId(order._id);
      
      const payload = {
        orderId: order._id,
        orderNumber: order.orderNumber
      };
      
      const response = await api.post(endpoints.expert.regenerateLecture, payload);
      console.log('✅ Regeneration initiated:', response.data);
      
      toast.success(response.data.message || 'Régénération lancée avec succès');
      
      // Actualiser les données
      await fetchHistoryOrders();
      await fetchValidationOrders();
      await fetchStats();
      
    } catch (error: any) {
      console.error('❌ Error regenerating lecture:', error);
      const errorMessage = error.response?.data?.error || 'Erreur lors de la régénération';
      toast.error(errorMessage);
    } finally {
      setRegeneratingOrderId(null);
    }
  };

  const handleDeleteOrder = async (order: Order) => {
    try {
      console.log('🗑️ Deleting order:', order._id);
      setDeletingOrderId(order._id);
      
      await api.delete(endpoints.expert.deleteOrder(order._id));
      console.log('✅ Order deleted successfully');
      
      toast.success(`Commande #${order.orderNumber} supprimée avec succès`);
      
      // Réinitialiser la sélection si c'est la commande sélectionnée
      if (selectedOrder?._id === order._id) setSelectedOrder(null);
      if (selectedHistoryOrder?._id === order._id) setSelectedHistoryOrder(null);
      
      // Actualiser les données
      await fetchOrders();
      await fetchHistoryOrders();
      await fetchStats();
      
    } catch (error: any) {
      console.error('❌ Error deleting order:', error);
      const errorMessage = error.response?.data?.error || 'Erreur lors de la suppression';
      toast.error(errorMessage);
    } finally {
      setDeletingOrderId(null);
    }
  };

  const handleDeleteClient = async (client: Client) => {
    try {
      console.log('🗑️ Deleting client:', client._id);
      setDeletingClientId(client._id);
      
      await api.delete(endpoints.expert.deleteClient(client._id));
      console.log('✅ Client deleted successfully');
      
      toast.success(`Client ${client.firstName} ${client.lastName} supprimé avec succès`);
      
      // Réinitialiser la sélection si c'est le client sélectionné
      if (selectedClient?._id === client._id) {
        setSelectedClient(null);
        setClientOrders([]);
      }
      
      // Actualiser les données
      await fetchClients();
      await fetchStats();
      
    } catch (error: any) {
      console.error('❌ Error deleting client:', error);
      const errorMessage = error.response?.data?.error || 'Erreur lors de la suppression du client';
      toast.error(errorMessage);
    } finally {
      setDeletingClientId(null);
    }
  };

  const refreshOrders = async () => {
    // Debounce de 200ms pour éviter rafales d'appels API
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
    }
    
    const timeout = window.setTimeout(async () => {
      setRefreshing(true);
      await fetchOrders();
      await fetchValidationOrders();
      await fetchHistoryOrders();
      await fetchStats();
      setRefreshing(false);
      toast.success('Données actualisées');
    }, 200);
    
    setRefreshTimeout(timeout);
  };
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeout) clearTimeout(refreshTimeout);
    };
  }, [refreshTimeout]);

  const handleOrderUpdate = () => {
    refreshOrders();
    setSelectedOrder(null);
    setSelectedValidationOrder(null);
    setSelectedHistoryOrder(null);
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
              setSelectedHistoryOrder(null);
              setSelectedClient(null);
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
              setSelectedHistoryOrder(null);
              setSelectedClient(null);
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
          <button
            onClick={() => {
              setActiveTab('history');
              setSelectedOrder(null);
              setSelectedValidationOrder(null);
              setSelectedClient(null);
            }}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-amber-400 text-slate-900'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <History className="w-5 h-5" />
            Historique ({historyOrders.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('clients');
              setSelectedOrder(null);
              setSelectedValidationOrder(null);
              setSelectedHistoryOrder(null);
            }}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'clients'
                ? 'bg-amber-400 text-slate-900'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <UserCircle className="w-5 h-5" />
            Clients ({clients.length})
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
                onDeleteOrder={handleDeleteOrder}
                takingOrder={takingOrderId || undefined}
                deletingOrder={deletingOrderId || undefined}
              />
            ) : activeTab === 'validation' ? (
              <ValidationQueue
                orders={validationOrders}
                selectedOrder={selectedValidationOrder}
                onSelectOrder={handleValidationOrderSelect}
                onValidateContent={handleValidationOrderSelect}
                onRefresh={refreshOrders}
                refreshing={refreshing}
                validatingOrder={validatingOrderId || undefined}
              />
            ) : activeTab === 'history' ? (
              <HistoryQueue
                orders={historyOrders}
                selectedOrder={selectedHistoryOrder}
                onSelectOrder={handleHistoryOrderSelect}
                onRegenerate={handleRegenerateLecture}
                onDeleteOrder={handleDeleteOrder}
                onRefresh={refreshOrders}
                refreshing={refreshing}
                regeneratingOrder={regeneratingOrderId || undefined}
                deletingOrder={deletingOrderId || undefined}
              />
            ) : (
              <ClientsList
                clients={clients}
                selectedClient={selectedClient}
                onSelectClient={handleSelectClient}
                onDeleteClient={handleDeleteClient}
                onRefresh={fetchClients}
                refreshing={refreshing}
                deletingClient={deletingClientId || undefined}
                clientStats={clientStats}
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
            ) : activeTab === 'validation' ? (
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
            ) : activeTab === 'history' ? (
              <HistoryViewer
                order={selectedHistoryOrder}
                onRegenerate={handleRegenerateLecture}
                isProcessing={regeneratingOrderId === selectedHistoryOrder?._id}
              />
            ) : (
              <ClientDetails
                client={selectedClient}
                stats={selectedClient ? clientStats.get(selectedClient._id) : undefined}
                orders={clientOrders}
              />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DeskPage;
