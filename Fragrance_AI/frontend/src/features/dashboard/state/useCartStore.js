import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  items: [],
  isOpen: false,
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  addItem: (item) => {
    const existing = get().items.find((p) => p.id === item.id);
    if (existing) {
      set({
        items: get().items.map((p) =>
          p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p
        ),
      });
    } else {
      set({ items: [...get().items, { ...item, quantity: 1 }] });
    }
  },
  removeItem: (id) =>
    set({ items: get().items.filter((item) => item.id !== id) }),
  updateQuantity: (id, quantity) =>
    set({
      items: get().items.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      ),
    }),
  clearCart: () => set({ items: [] }),
}));

export default useCartStore;

