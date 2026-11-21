import React, { useState, useEffect } from 'react';
import api from '../api/axios.js';
import useCartStore from '../store/cartStore.js';
import useAuthStore from '../store/authStore.js';

const Menu = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('ALL');
  
  // Cart Store integration
  const { items: cartItems, addItem, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();
  const user = useAuthStore((state) => state.user);

  // Note for order
  const [orderNote, setOrderNote] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Drawer / Modal states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // for editing

  // Form states for Admin add/edit
  const [formCategoryId, setFormCategoryId] = useState(1);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');

  // Fixed categories from db V1
  const categories = [
    { id: 'ALL', name: 'Tous les Plats' },
    { id: 1, name: 'Entrées' },
    { id: 2, name: 'Plats' },
    { id: 3, name: 'Desserts' },
    { id: 4, name: 'Boissons' }
  ];

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const response = await api.get('/menu');
      setItems(response.data);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger le menu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleAddToCart = (item) => {
    addItem(item);
    setIsCartOpen(true);
  };

  // Submit order
  const handleOrder = async () => {
    if (cartItems.length === 0) return;
    setOrderLoading(true);
    try {
      const payload = {
        items: cartItems.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity
        })),
        note: orderNote
      };
      await api.post('/orders', payload);
      setOrderSuccess(true);
      clearCart();
      setOrderNote('');
      setTimeout(() => {
        setOrderSuccess(false);
        setIsCartOpen(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la validation de la commande.");
    } finally {
      setOrderLoading(false);
    }
  };

  // Admin delete dish
  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce plat ?')) return;
    try {
      await api.delete(`/menu/${id}`);
      fetchMenu();
    } catch (err) {
      console.error(err);
      alert('Impossible de supprimer ce plat.');
    }
  };

  // Admin toggle available
  const handleToggleAvailable = async (id) => {
    try {
      await api.patch(`/menu/${id}/toggle-available`);
      fetchMenu();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la modification de disponibilité.");
    }
  };

  // Admin save (Create or Edit)
  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!formName || !formPrice) {
      alert('Veuillez remplir les champs obligatoires.');
      return;
    }

    const payload = {
      categoryId: parseInt(formCategoryId),
      name: formName,
      description: formDescription,
      price: parseFloat(formPrice),
      imageUrl: formImageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300'
    };

    try {
      if (selectedItem) {
        // Edit mode
        await api.put(`/menu/${selectedItem.id}`, payload);
      } else {
        // Create mode
        await api.post('/menu', payload);
      }
      setIsAdminModalOpen(false);
      fetchMenu();
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement du plat.");
    }
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setFormCategoryId(item.category?.id || 1);
    setFormName(item.name);
    setFormDescription(item.description || '');
    setFormPrice(item.price);
    setFormImageUrl(item.imageUrl || '');
    setIsAdminModalOpen(true);
  };

  const resetForm = () => {
    setSelectedItem(null);
    setFormCategoryId(1);
    setFormName('');
    setFormDescription('');
    setFormPrice('');
    setFormImageUrl('');
  };

  // Filter items based on active category selection
  const filteredItems = activeCategory === 'ALL'
    ? items
    : items.filter(item => item.category?.id === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-dark-950 via-slate-900 to-dark-950 pb-16">
      
      {/* Category Filter Banner */}
      <div className="max-w-7xl mx-auto px-6 pt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                activeCategory === cat.id
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-3">
          {user?.role === 'ADMIN' && (
            <button
              onClick={() => { resetForm(); setIsAdminModalOpen(true); }}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              ➕ Ajouter un Plat
            </button>
          )}

          <button
            onClick={() => setIsCartOpen(true)}
            className="px-5 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded-xl font-bold text-sm flex items-center gap-2 relative shadow-md transition-all duration-300"
          >
            🛒 Mon Panier
            {cartItems.length > 0 && (
              <span className="h-5 w-5 rounded-full bg-amber-500 text-white text-xs font-extrabold flex items-center justify-center animate-pulse">
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="animate-spin h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full"></div>
            <p className="text-slate-400 font-medium">Chargement des délices culinaires...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-400 font-medium">{error}</div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 text-slate-500 font-medium">Aucun plat n'est disponible dans cette catégorie.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl overflow-hidden glass-effect shadow-xl border border-white/5 flex flex-col group hover:border-amber-500/20 transition-all duration-300 transform hover:scale-[1.01]"
              >
                {/* Food Image */}
                <div className="h-52 w-full overflow-hidden relative">
                  <img
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300'}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {!item.available && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="px-4 py-2 bg-red-600/90 text-white rounded-lg text-xs font-black uppercase tracking-wider">Épuisé</span>
                    </div>
                  )}
                  <span className="absolute top-4 right-4 bg-slate-900/85 backdrop-blur px-3 py-1.5 rounded-lg text-amber-500 font-black text-sm border border-white/10">
                    {item.price.toFixed(2)} DT
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-amber-500/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/10">
                        {item.category?.name}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-500 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">
                      {item.description || 'Aucune description disponible.'}
                    </p>
                  </div>

                  {/* Options row */}
                  <div className="mt-6 flex flex-col gap-2">
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={!item.available}
                      className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <span>🛒 Ajouter au Panier</span>
                    </button>

                    {/* Admin Specific Action Controls */}
                    {user?.role === 'ADMIN' && (
                      <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-white/5">
                        <button
                          onClick={() => handleToggleAvailable(item.id)}
                          className={`text-xs py-2 font-bold rounded-lg transition-all ${
                            item.available
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {item.available ? 'Rendre Épuisé' : 'Disponible'}
                        </button>
                        <button
                          onClick={() => openEditModal(item)}
                          className="text-xs py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold rounded-lg transition-all"
                        >
                          ✏️ Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-xs py-2 bg-red-600/10 text-red-500 border border-red-600/20 font-bold rounded-lg transition-all"
                        >
                          🗑️ Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Sidebar Slider Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-slate-900 border-l border-white/10 shadow-2xl flex flex-col justify-between">
              
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between text-white bg-slate-900/80">
                <h2 className="text-xl font-bold flex items-center gap-2">🛒 Mon Panier</h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="h-8 w-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all"
                >
                  ✕
                </button>
              </div>

              {/* Drawer Body Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {orderSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl p-4 text-sm text-center">
                    🎉 Commande validée avec succès ! Bon appétit !
                  </div>
                )}

                {cartItems.length === 0 ? (
                  !orderSuccess && (
                    <div className="text-center py-20 text-slate-500">
                      <span className="text-4xl block mb-2">🛒</span>
                      Votre panier est vide.
                    </div>
                  )
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-4 p-3 rounded-xl bg-slate-800/40 border border-white/5">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-16 w-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-sm text-white">{item.name}</h4>
                          <span className="text-xs text-amber-500 font-semibold">{item.price.toFixed(2)} DT</span>
                          
                          {/* Quantity selector */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="h-6 w-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs"
                              >
                                -
                              </button>
                              <span className="text-sm font-bold text-white">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="h-6 w-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-xs text-red-400 hover:underline"
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Notes for kitchen */}
                    <div className="pt-4 border-t border-white/5">
                      <label className="block text-slate-300 text-xs font-semibold mb-2">Note spéciale pour la cuisine :</label>
                      <textarea
                        value={orderNote}
                        onChange={(e) => setOrderNote(e.target.value)}
                        placeholder="Ex: Sans oignon, cuisson à point, etc."
                        rows={2}
                        className="w-full bg-slate-800 border border-slate-700/50 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer Checkout */}
              {cartItems.length > 0 && (
                <div className="p-6 bg-slate-900 border-t border-white/5 space-y-4">
                  <div className="flex items-center justify-between text-white font-bold">
                    <span>Total :</span>
                    <span className="text-xl text-amber-500">{getTotal().toFixed(2)} DT</span>
                  </div>
                  
                  <button
                    onClick={handleOrder}
                    disabled={orderLoading}
                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center text-sm"
                  >
                    {orderLoading ? 'Traitement...' : '🛒 Confirmer la Commande'}
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Admin Add/Edit Modal */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsAdminModalOpen(false)} />
          <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl p-8 relative z-10 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">
              {selectedItem ? '✏️ Modifier le Plat' : '➕ Ajouter un Nouveau Plat'}
            </h2>
            
            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-1">Catégorie</label>
                <select
                  value={formCategoryId}
                  onChange={(e) => setFormCategoryId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                >
                  <option value={1}>Entrées</option>
                  <option value={2}>Plats</option>
                  <option value={3}>Desserts</option>
                  <option value={4}>Boissons</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-1">Nom du Plat *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Spaghetti Carbonara"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-1">Description</label>
                <textarea
                  placeholder="Ingrédients, allergènes..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-800 border border-slate-700/50 rounded-xl p-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-1">Prix (DT) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ex: 18.50"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-1">URL de l'image</label>
                <input
                  type="text"
                  placeholder="Ex: http://..."
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setIsAdminModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm shadow-md"
                >
                  Enregistrer
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Menu;
