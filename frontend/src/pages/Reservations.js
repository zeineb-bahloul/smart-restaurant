import React, { useState, useEffect } from 'react';
import api from '../api/axios.js';
import useAuthStore from '../store/authStore.js';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useAuthStore((state) => state.user);

  // Form states for booking
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState(2);
  const [note, setNote] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      let response;
      if (user.role === 'ADMIN') {
        response = await api.get('/reservations');
      } else {
        response = await api.get('/reservations/my');
      }
      // Sort reservations by date (newest first)
      const sorted = response.data.sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));
      setReservations(sorted);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les réservations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchReservations();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !time || !guests) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setFormLoading(true);
    try {
      const payload = {
        date,
        time: time + ':00', // ensure HH:MM:SS format
        guests: parseInt(guests),
        note
      };
      await api.post('/reservations', payload);
      setFormSuccess(true);
      setDate('');
      setTime('');
      setGuests(2);
      setNote('');
      fetchReservations();
      setTimeout(() => setFormSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Impossible d\'enregistrer la réservation. Veuillez vérifier la date (aujourd\'hui ou futur).');
    } finally {
      setFormLoading(false);
    }
  };

  // Admin status update
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.put(`/reservations/${id}/status?status=${newStatus}`);
      fetchReservations();
    } catch (err) {
      console.error(err);
      alert('Erreur lors du changement de statut de la réservation.');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
      CONFIRMED: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      CANCELLED: 'bg-red-500/10 text-red-400 border border-red-500/20',
    };
    const labels = {
      PENDING: 'En attente',
      CONFIRMED: 'Confirmée',
      CANCELLED: 'Annulée',
    };
    return (
      <span className={`px-2.5 py-0.5 text-xs font-black rounded-lg uppercase tracking-wider ${styles[status] || styles.PENDING}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-dark-950 via-slate-900 to-dark-950 pb-16">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 pt-10">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          📅 {user?.role === 'ADMIN' ? 'Gestion des Réservations' : 'Réserver une Table'}
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {user?.role === 'ADMIN'
            ? 'Supervisez et validez les réservations de tables de vos convives.'
            : 'Planifiez un repas d\'exception dans notre établissement.'}
        </p>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        
        {/* CLIENT WORKFLOW (Split: Form + History) */}
        {user?.role !== 'ADMIN' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Reservation Form */}
            <div className="lg:col-span-1 rounded-3xl p-6 glass-effect border border-white/5 shadow-xl h-fit">
              <h3 className="text-lg font-bold text-white mb-4">Nouvelle Réservation</h3>
              
              {formSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl p-4 mb-4 text-xs text-center">
                  🎉 Votre table a été réservée ! Notre équipe va la valider sous peu.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Heure *</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Nombre de convives *</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Note / Demande spéciale</label>
                  <textarea
                    placeholder="Ex: Table près de la fenêtre, chaise bébé, intolérance au gluten..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-950/60 border border-slate-700/50 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all active:scale-95 text-xs flex items-center justify-center"
                >
                  {formLoading ? 'Envoi...' : '📅 Confirmer ma demande'}
                </button>

              </form>
            </div>

            {/* Client History List */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-bold text-white mb-4">Mes Réservations</h3>
              
              {loading ? (
                <div className="text-slate-400 py-10 text-center text-sm">Chargement...</div>
              ) : reservations.length === 0 ? (
                <div className="text-center py-16 text-slate-500 bg-slate-900/20 rounded-2xl border border-white/5">
                  Aucune réservation passée.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reservations.map((res) => (
                    <div key={res.id} className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 shadow-md flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black text-white">{res.date} à {res.time.substring(0, 5)}</span>
                          {getStatusBadge(res.status)}
                        </div>
                        <p className="text-xs text-slate-400">
                          🍽️ Table pour <span className="font-bold text-white">{res.guests}</span> convive{res.guests > 1 ? 's' : ''}
                        </p>
                        {res.note && (
                          <p className="text-xs text-slate-300 italic bg-white/5 p-2 rounded-lg mt-2">
                            "{res.note}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ADMIN WORKFLOW (Full table overview) */}
        {user?.role === 'ADMIN' && (
          <div className="rounded-3xl overflow-hidden glass-effect border border-white/5 shadow-xl">
            {loading ? (
              <div className="flex justify-center py-20 text-slate-400">Chargement...</div>
            ) : reservations.length === 0 ? (
              <div className="text-center py-20 text-slate-500">Aucune réservation reçue.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/80 border-b border-white/5 text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">Client</th>
                      <th className="px-6 py-4">Date & Heure</th>
                      <th className="px-6 py-4">Couverts</th>
                      <th className="px-6 py-4">Notes</th>
                      <th className="px-6 py-4">Statut</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm text-slate-200">
                    {reservations.map((res) => (
                      <tr key={res.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-white">{res.user?.name}</div>
                          <div className="text-xs text-slate-400">{res.user?.email}</div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-white">
                          {res.date} à {res.time.substring(0, 5)}
                        </td>
                        <td className="px-6 py-4 font-bold text-amber-500">
                          {res.guests}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400 max-w-[200px] truncate" title={res.note}>
                          {res.note || '-'}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(res.status)}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          {res.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(res.id, 'CONFIRMED')}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow transition-all active:scale-95"
                              >
                                Valider
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(res.id, 'CANCELLED')}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow transition-all active:scale-95"
                              >
                                Réfuser
                              </button>
                            </>
                          )}
                          {res.status === 'CONFIRMED' && (
                            <button
                              onClick={() => handleUpdateStatus(res.id, 'CANCELLED')}
                              className="px-3 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/10 rounded-lg text-xs font-bold transition-all"
                            >
                              Annuler
                            </button>
                          )}
                          {res.status === 'CANCELLED' && (
                            <span className="text-xs text-slate-500">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};

export default Reservations;
