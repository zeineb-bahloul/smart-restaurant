import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  items: [],
  
  addItem: (menuItem) => {
    const currentItems = get().items;
    const existingIndex = currentItems.findIndex(item => item.id === menuItem.id);
    
    if (existingIndex > -1) {
      const updatedItems = [...currentItems];
      updatedItems[existingIndex].quantity += 1;
      set({ items: updatedItems });
    } else {
      set({ items: [...currentItems, { ...menuItem, quantity: 1 }] });
    }
  },
  
  removeItem: (id) => {
    set({ items: get().items.filter(item => item.id !== id) });
  },
  
  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id);
      return;
    }
    const updatedItems = get().items.map(item => 
      item.id === id ? { ...item, quantity } : item
    );
    set({ items: updatedItems });
  },
  
  clearCart: () => {
    set({ items: [] });
  },
  
  getTotal: () => {
    return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
  },
}));

export default useCartStore;
