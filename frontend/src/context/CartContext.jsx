import { createContext, useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { apiRequest } from "../utils/api";

export const CartContext = createContext(undefined);

function getGuestKey() {
  let key = localStorage.getItem("bikestore_cart_key");
  if (!key) {
    key = crypto.randomUUID();
    localStorage.setItem("bikestore_cart_key", key);
  }
  return key;
}

export const CartProvider = ({ children }) => {
  const { currentUser, token, isReady: authReady } = useAuth();
  const [guestKey] = useState(getGuestKey);
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem("bikestore_cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [cartError, setCartError] = useState("");

  const syncCart = async () => {
    if (!authReady) return;
    if (token) await apiRequest("/cart/claim", { method: "POST", token, guestKey });
    const { data } = await apiRequest("/cart", { token, guestKey });
    setItems(data);
    setCartError("");
  };

  useEffect(() => {
    if (authReady) {
      syncCart().catch((error) => setCartError(error.message));
    }
  }, [authReady, token, currentUser?.id]);

  useEffect(() => {
    localStorage.setItem("bikestore_cart", JSON.stringify(items));
  }, [items]);

  const addItem = async (product, quantity = 1, selectedSize) => {
    try {
      const { data, adjusted } = await apiRequest("/cart/items", {
        method: "POST",
        token,
        guestKey,
        body: { productId: product.id, quantity, selectedSize },
      });
      setItems(data);
      setCartError("");
      return {
        success: true,
        message: adjusted
          ? `La cantidad se ajustó al stock disponible (${product.stock}).`
          : `${product.name} agregado al carrito.`,
      };
    } catch (error) {
      setCartError(error.message);
      return { success: false, message: error.message };
    }
  };

  const updateQty = async (id, delta) => {
    const target = items.find((item) => item.cartItemId === id);
    if (!target) return { success: false, message: "Producto no encontrado en el carrito." };
    const quantity = target.qty + delta;
    if (quantity < 1) return { success: false, message: "La cantidad mínima es una unidad." };
    try {
      const { data } = await apiRequest(`/cart/items/${id}`, {
        method: "PATCH",
        token,
        guestKey,
        body: { quantity },
      });
      setItems(data);
      setCartError("");
      return { success: true };
    } catch (error) {
      setCartError(error.message);
      return { success: false, message: error.message };
    }
  };

  const removeItem = async (id) => {
    try {
      const { data } = await apiRequest(`/cart/items/${id}`, { method: "DELETE", token, guestKey });
      setItems(data);
      setCartError("");
      return { success: true };
    } catch (error) {
      setCartError(error.message);
      return { success: false, message: error.message };
    }
  };

  const clearCart = () => setItems([]);
  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * item.qty, 0);
  const shipping = subtotal > 0 && subtotal < 300000 ? 15000 : 0;
  const tax = Math.round(subtotal * 0.19);
  const total = subtotal + shipping;
  const cartCount = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQty,
        removeItem,
        clearCart,
        subtotal,
        tax,
        shipping,
        total,
        cartCount,
        cartError,
        refreshCart: syncCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
