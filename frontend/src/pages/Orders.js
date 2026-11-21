import React, { useState, useEffect } from 'react';
import api from '../api/axios.js';
import useAuthStore from '../store/authStore.js';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useAuthStore((state) => state.user);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let response;
      if (user.role === 'ADMIN' || user.role === 'STAFF') {
        response = await api.get('/orders');
      } else {
        response = await api.get('/orders/my');
      }
      // Sort orders by creation date (newest first)
      const sorted = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sorted);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les commandes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  // Update order status
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.put(`/orders/${id}/status?status=${newStatus}`);
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert('Erreur lors du changement de statut de la commande.');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
      PREPARING: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      READY: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      DELIVERED: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
      CANCELLED: 'bg-red-500/10 text-red-400 border border-red-500/20',
    };
    const labels = {
      PENDING: 'En attente',
      PREPARING: 'En préparation',
      READY: 'Prêt',
      DELIVERED: 'Livré',
      CANCELLED: 'Annulé',
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-black rounded-lg uppercase tracking-wider ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-dark-950 via-slate-900 to-dark-950 pb-16">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 pt-10">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          📦 {user?.role === 'ADMIN' || user?.role === 'STAFF' ? 'Gestion des Commandes' : 'Suivi de mes Commandes'}
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {user?.role === 'ADMIN' || user?.role === 'STAFF'
            ? 'Supervisez et mettez à jour le statut des commandes du restaurant.'
            : 'Consultez le statut de vos commandes culinaires en temps réel.'}
        </p>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="animate-spin h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full"></div>
            <p className="text-slate-400 text-sm">Chargement des commandes...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-400 font-medium">{error}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-slate-500 bg-slate-900/30 rounded-2xl border border-white/5">
            <span className="text-4xl block mb-2">📋</span>
            Aucune commande enregistrée pour le moment.
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl overflow-hidden glass-effect border border-white/5 p-6 shadow-xl transition-all hover:border-amber-500/10"
              >
                
                {/* Upper Order Summary Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5 mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-amber-500">ID: #{order.id.substring(0, 8)}</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-xs text-slate-400">
                      Date : {new Date(order.createdAt).toLocaleString('fr-FR')}
                    </p>
                    {(user.role === 'ADMIN' || user.role === 'STAFF') && (
                      <p className="text-xs text-slate-300 font-medium">
                        Client : <span className="text-white font-bold">{order.user?.name}</span> ({order.user?.email})
                      </p>
                    )}
                  </div>

                  {/* Pricing / Total Info */}
                  <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-2">
                    <span className="text-xs text-slate-400 font-medium">Montant total</span>
                    <span className="text-xl font-extrabold text-amber-500">{order.total.toFixed(2)} DT</span>
                  </div>
                </div>

                {/* Sub-Items List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Détails de la commande</h4>
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm py-1">
                      <div className="flex items-center gap-2">
                        <span className="h-5 w-5 bg-slate-800 text-slate-300 font-bold rounded text-xs flex items-center justify-center">
                          {item.quantity}
                        </span>
                        <span className="text-slate-200">{item.menuItem?.name}</span>
                      </div>
                      <span className="text-slate-400">{(item.price * item.quantity).toFixed(2)} DT</span>
                    </div>
                  ))}
                </div>

                {/* Optional Note Card */}
                {order.note && (
                  <div className="mt-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 text-xs text-amber-300">
                    <span className="font-bold">📝 Note :</span> {order.note}
                  </div>
                )}

                {/* Admin Actions Panel */}
                {(user.role === 'ADMIN' || user.role === 'STAFF') && (
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-end gap-3">
                    <span className="text-xs font-bold text-slate-400">Modifier l'état :</span>
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                      className="bg-slate-800 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="PENDING">En attente</option>
                      <option value="PREPARING">En préparation</option>
                      <option value="READY">Prêt</option>
                      <option value="DELIVERED">Livré</option>
                      <option value="CANCELLED">Annulé</option>
                    </select>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Orders;
