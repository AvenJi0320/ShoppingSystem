import { create } from 'zustand';
import type { CartItem } from '../pages/shop/types';

interface CartStore {
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  cart: [],

  addToCart: (product) => {
    set((state) => {
      const existingItem = state.cart.find((item) => item.product_id === product.product_id);
      if (existingItem) {
        return {
          cart: state.cart.map((item) =>
            item.product_id === product.product_id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      } else {
        return {
          cart: [
            ...state.cart,
            {
              product_id: product.product_id,
              product_name: product.product_name,
              price: product.price,
              quantity: 1,
            },
          ],
        };
      }
    });
  },

  removeFromCart: (productId) => {
    set((state) => ({
      cart: state.cart.filter((item) => item.product_id !== productId),
    }));
  },

  updateQuantity: (productId, quantity) => {
    set((state) => {
      // 如果数量小于等于0，则移除该商品
      if (quantity <= 0) {
        return {
          cart: state.cart.filter((item) => item.product_id !== productId),
        };
      }
      // 否则更新数量
      return {
        cart: state.cart.map((item) =>
          item.product_id === productId
            ? { ...item, quantity }
            : item
        ),
      };
    });
  },

  clearCart: () => {
    set({ cart: [] });
  },

  getTotal: () => {
    const state = get();
    return state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },
}));
