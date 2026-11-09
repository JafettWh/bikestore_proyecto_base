import { createContext, useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";

export const CartContext = createContext(undefined);

function readCart(key) {
  const saved = localStorage.getItem(key);
  if (!saved) return [];
  try {
    const items = JSON.parse(saved);
    return Array.isArray(items) ? items : [];
  } catch {
    localStorage.removeItem(key);
    return [];
  }
}

function cartKeyFor(user) {
  return user?.role === "cliente" ? `bikestore_cart_user_${user.id}` : "bikestore_cart";
}

function mergeCartItems(savedItems, guestItems) {
  const merged = new Map(savedItems.map((item) => [item.cartItemId, item]));
  for (const guestItem of guestItems) {
    const saved = merged.get(guestItem.cartItemId);
    if (!saved) {
      merged.set(guestItem.cartItemId, guestItem);
      continue;
    }
    const requestedQty = Number(saved.qty) + Number(guestItem.qty);
    merged.set(guestItem.cartItemId, {
      ...saved,
      qty: Math.min(requestedQty, Number(saved.stock)),
    });
  }
  return [...merged.values()];
}

export const CartProvider = ({ children }) => {
  const { currentUser, isReady: authReady } = useAuth();
  const [items, setItems] = useState(() => readCart("bikestore_cart"));
  const [cartError, setCartError] = useState("");
  const [storageKey, setStorageKey] = useState("bikestore_cart");

  useEffect(() => {
    if (!authReady) return;
    if (currentUser?.role === "admin") {
      setItems([]);
      setCartError("");
      setStorageKey("");
      return;
    }
    const userCartKey = cartKeyFor(currentUser);
    const savedItems = readCart(userCartKey);
    if (currentUser?.role === "cliente") {
      const guestItems = readCart("bikestore_cart");
      const mergedItems = mergeCartItems(savedItems, guestItems);
      localStorage.removeItem("bikestore_cart");
      localStorage.setItem(userCartKey, JSON.stringify(mergedItems));
      setItems(mergedItems);
      setCartError("");
    } else {
      setItems(savedItems);
    }
    setStorageKey(userCartKey);
  }, [authReady, currentUser?.id, currentUser?.role]);

  useEffect(() => {
    if (authReady && storageKey) localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey, authReady]);

  const syncCart = async () => {
    const key = cartKeyFor(currentUser);
    setStorageKey(key);
    setItems(readCart(key));
  };

  const addItem = async (product, quantity = 1, selectedSize) => {
    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
      return { success: false, message: "La cantidad debe ser un entero mayor a cero." };
    }
    if (product.stock < 1) {
      return { success: false, message: "El producto no tiene existencias." };
    }

    if (product.sizes?.length && !product.sizes.includes(selectedSize)) {
      return { success: false, message: "Selecciona una talla disponible." };
    }
    const size = selectedSize || "";
    const cartItemId = `${product.id}:${size}`;
    const existing = items.find((item) => item.cartItemId === cartItemId);
    const requestedQuantity = Number(existing?.qty || 0) + Number(quantity);
    const updatedQuantity = Math.min(requestedQuantity, Number(product.stock));
    const cartItem = {
      ...product,
      cartItemId,
      qty: updatedQuantity,
      selectedSize: size || undefined,
    };
    setItems((current) => existing
      ? current.map((item) => item.cartItemId === cartItemId ? cartItem : item)
      : [...current, cartItem]);
    return {
      success: true,
      message: updatedQuantity < requestedQuantity
        ? `La cantidad se ajustó al stock disponible (${product.stock}).`
        : `${product.name} agregado al carrito.`,
    };
  };

  const updateQty = async (id, delta) => {
    const target = items.find((item) => item.cartItemId === id);
    if (!target) return { success: false, message: "Producto no encontrado en el carrito." };
    const quantity = target.qty + delta;
    if (quantity < 1) return { success: false, message: "La cantidad mínima es una unidad." };
    if (quantity > target.stock) return { success: false, message: `Máximo disponible: ${target.stock} unidades.` };
    setItems((current) => current.map((item) => item.cartItemId === id ? { ...item, qty: quantity } : item));
    return { success: true };
  };

  const removeItem = async (id) => {
    setItems((current) => current.filter((item) => item.cartItemId !== id));
    return { success: true };
  };

  const clearCart = () => {
    if (storageKey) localStorage.removeItem(storageKey);
    setItems([]);
  };
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
