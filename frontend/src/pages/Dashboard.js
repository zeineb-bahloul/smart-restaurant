import React, { useState, useEffect } from 'react';
import api from '../api/axios.js';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch KPI & Status stats
      const statsRes = await api.get('/dashboard/stats');
      setStats(statsRes.data);

      // 2. Fetch all orders to compute 7-day trend and last 5 table
      const ordersRes = await api.get('/orders');
      setOrders(ordersRes.data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les statistiques d'administration.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Utility: calculate 7-day revenue trend from all orders
  const get7DaysRevenue = () => {
    const data = [];
    const daysOfWeek = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = daysOfWeek[d.getDay()];
      
      // format date as YYYY-MM-DD
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dateVal = String(d.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${dateVal}`;

      // sum revenue for this day
      const revenue = orders
        .filter(order => order.createdAt && order.createdAt.startsWith(dateString) && order.status !== 'CANCELLED')
        .reduce((sum, order) => sum + order.total, 0);

      data.push({
        name: dayName,
        date: dateString,
        Revenus: parseFloat(revenue.toFixed(2))
      });
    }
    return data;
  };

  // Convert status mapping to Recharts bar format
  const getBarChartData = () => {
    if (!stats || !stats.ordersByStatus) return [];
    
    const labels = {
      PENDING: 'En attente',
      PREPARING: 'Préparation',
      READY: 'Prêt',
      DELIVERED: 'Livré',
      CANCELLED: 'Annulé'
    };

    return Object.keys(stats.ordersByStatus).map(key => ({
      name: labels[key] || key,
      Commandes: stats.ordersByStatus[key],
      statusKey: key
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: '#f59e0b',    // yellow
      PREPARING: '#3b82f6',  // blue
      READY: '#10b981',      // emerald
      DELIVERED: '#64748b',  // slate
      CANCELLED: '#ef4444'   // red
    };
    return colors[status] || '#f59e0b';
  };

  const lineData = get7DaysRevenue();
  const barData = getBarChartData();
  const lastFiveOrders = orders.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-dark-950 via-slate-900 to-dark-950 pb-16">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 pt-10">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          📊 Tableau de Bord Analytique
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Suivez l'activité du Gourmet Smart en temps réel (chiffre d'affaires, réservations, volumes de ventes).
        </p>
      </div>

      {loading ? (
        <div className="max-w-7xl mx-auto px-6 py-24 flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full"></div>
          <p className="text-slate-400 text-sm">Chargement des données analytiques...</p>
        </div>
      ) : error ? (
        <div className="max-w-7xl mx-auto px-6 py-20 text-center text-red-400 font-semibold">{error}</div>
      ) : (
        <div className="max-w-7xl mx-auto px-6 mt-8 space-y-8 animate-fade-in">
          
          {/* 4 KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* KPI 1: Chiffre d'affaires */}
            <div className="p-6 rounded-2xl glass-effect border border-white/5 shadow-md flex items-center gap-4">
              <span className="text-4xl bg-amber-500/10 p-3 rounded-xl">💰</span>
              <div>
                <span className="block text-slate-400 text-xs font-semibold uppercase tracking-wider">Revenus Aujourd'hui</span>
                <span className="text-2xl font-extrabold text-white">{(stats?.todayRevenue || 0).toFixed(2)} DT</span>
              </div>
            </div>

            {/* KPI 2: Total commandes */}
            <div className="p-6 rounded-2xl glass-effect border border-white/5 shadow-md flex items-center gap-4">
              <span className="text-4xl bg-blue-500/10 p-3 rounded-xl">📦</span>
              <div>
                <span className="block text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Commandes</span>
                <span className="text-2xl font-extrabold text-white">{stats?.totalOrders || 0}</span>
              </div>
            </div>

            {/* KPI 3: Commandes en attente */}
            <div className="p-6 rounded-2xl glass-effect border border-white/5 shadow-md flex items-center gap-4">
              <span className="text-4xl bg-yellow-500/10 p-3 rounded-xl">⏳</span>
              <div>
                <span className="block text-slate-400 text-xs font-semibold uppercase tracking-wider">Commandes en attente</span>
                <span className="text-2xl font-extrabold text-white">
                  {stats?.ordersByStatus?.PENDING || 0}
                </span>
              </div>
            </div>

            {/* KPI 4: Réservations aujourd'hui */}
            <div className="p-6 rounded-2xl glass-effect border border-white/5 shadow-md flex items-center gap-4">
              <span className="text-4xl bg-emerald-500/10 p-3 rounded-xl">📅</span>
              <div>
                <span className="block text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Réservations</span>
                <span className="text-2xl font-extrabold text-white">{stats?.totalReservations || 0}</span>
              </div>
            </div>

          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Chart 1: Revenue 7 days */}
            <div className="p-6 rounded-3xl glass-effect border border-white/5 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-white">📈 Chiffre d'Affaires (7 derniers jours)</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} unit=" DT" />
                    <Tooltip
                      contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                    />
                    <Line type="monotone" dataKey="Revenus" stroke="#f59e0b" strokeWidth={3} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Status distribution */}
            <div className="p-6 rounded-3xl glass-effect border border-white/5 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-white">📊 Commandes par Statut</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                      contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    />
                    <Bar dataKey="Commandes" radius={[8, 8, 0, 0]}>
                      {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getStatusColor(entry.statusKey)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Table: Latest 5 orders */}
          <div className="p-6 rounded-3xl glass-effect border border-white/5 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white">🛍️ Dernières Commandes</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th className="py-4">ID</th>
                    <th className="py-4">Client</th>
                    <th className="py-4">Date</th>
                    <th className="py-4">Statut</th>
                    <th className="py-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm text-slate-200">
                  {lastFiveOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 font-bold text-amber-500">#{order.id.substring(0, 8)}</td>
                      <td className="py-4 font-medium text-white">{order.user?.name}</td>
                      <td className="py-4 text-slate-400">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td className="py-4">
                        <span
                          className="px-2 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider"
                          style={{
                            backgroundColor: getStatusColor(order.status) + '15',
                            color: getStatusColor(order.status),
                            border: `1px solid ${getStatusColor(order.status)}30`
                          }}
                        >
                          {order.status === 'PENDING' ? 'En attente' 
                            : order.status === 'PREPARING' ? 'En préparation'
                            : order.status === 'READY' ? 'Prêt'
                            : order.status === 'DELIVERED' ? 'Livré'
                            : 'Annulé'}
                        </span>
                      </td>
                      <td className="py-4 text-right font-bold text-white">{order.total.toFixed(2)} DT</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default Dashboard;
