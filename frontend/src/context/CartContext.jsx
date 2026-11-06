import { createContext, useEffect, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { apiRequest } from "../utils/api";

export const CartContext = createContext(undefined);

function readGuestCart() {
  const saved = localStorage.getItem("bikestore_cart");
  if (!saved) return [];
  try {
    const items = JSON.parse(saved);
    return Array.isArray(items) ? items : [];
  } catch {
    localStorage.removeItem("bikestore_cart");
    localStorage.removeItem("bikestore_cart_import_id");
    return [];
  }
}

export const CartProvider = ({ children }) => {
  const { currentUser, token, isReady: authReady } = useAuth();
  const [items, setItems] = useState(readGuestCart);
  const [cartError, setCartError] = useState("");
  const syncInProgress = useRef(null);
  const previousToken = useRef(token);

  const syncCart = async (accessToken = token, role = currentUser?.role) => {
    if (!accessToken) {
      setItems(readGuestCart());
      return;
    }
    if (!authReady && accessToken === token) return;
    if (role !== "cliente") {
      setItems([]);
      setCartError("");
      return;
    }
    if (syncInProgress.current?.token === accessToken) return syncInProgress.current.promise;

    const promise = (async () => {
      const guestItems = readGuestCart();
      if (guestItems.length) {
        const importId = localStorage.getItem("bikestore_cart_import_id") || crypto.randomUUID();
        localStorage.setItem("bikestore_cart_import_id", importId);
        const { adjusted, skipped } = await apiRequest("/cart/import", {
          method: "POST",
          token: accessToken,
          body: {
            importId,
            items: guestItems.map(({ id, qty, selectedSize }) => ({
              productId: id,
              quantity: qty,
              selectedSize,
            })),
          },
        });
        localStorage.removeItem("bikestore_cart");
        localStorage.removeItem("bikestore_cart_import_id");
        setCartError(skipped
          ? `Se omitieron ${skipped} producto(s) del carrito porque ya no están disponibles.`
          : adjusted
            ? "Se ajustaron las cantidades del carrito al stock disponible."
            : "");
      } else {
        localStorage.removeItem("bikestore_cart");
        localStorage.removeItem("bikestore_cart_import_id");
        setCartError("");
      }

      const { data } = await apiRequest("/cart", { token: accessToken });
      setItems(data);
    })();
    syncInProgress.current = { token: accessToken, promise };

    try {
      await promise;
    } finally {
      if (syncInProgress.current?.promise === promise) syncInProgress.current = null;
    }
  };

  useEffect(() => {
    if (authReady) {
      syncCart().catch((error) => setCartError(error.message));
    }
  }, [authReady, token, currentUser?.id]);

  useEffect(() => {
    if (previousToken.current !== token) {
      if (previousToken.current && !token) setItems(readGuestCart());
      previousToken.current = token;
      return;
    }
    if (!token) localStorage.setItem("bikestore_cart", JSON.stringify(items));
  }, [items, token]);

  const addItem = async (product, quantity = 1, selectedSize) => {
    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
      return { success: false, message: "La cantidad debe ser un entero mayor a cero." };
    }
    if (product.stock < 1) {
      return { success: false, message: "El producto no tiene existencias." };
    }

    if (!token) {
      if (product.sizes?.length && !product.sizes.includes(selectedSize)) {
        return { success: false, message: "Selecciona una talla disponible." };
      }
      const size = selectedSize || "";
      const existing = items.find((item) => item.id === product.id && (item.selectedSize || "") === size);
      const requestedQuantity = Number(existing?.qty || 0) + Number(quantity);
      const updatedQuantity = Math.min(requestedQuantity, Number(product.stock));
      const guestItem = {
        ...product,
        cartItemId: `${product.id}:${size}`,
        qty: updatedQuantity,
        selectedSize: size || undefined,
      };
      localStorage.removeItem("bikestore_cart_import_id");
      setItems((current) => existing
        ? current.map((item) => item.cartItemId === guestItem.cartItemId ? guestItem : item)
        : [...current, guestItem]);
      return {
        success: true,
        message: updatedQuantity < requestedQuantity
          ? `La cantidad se ajustó al stock disponible (${product.stock}).`
          : `${product.name} agregado al carrito.`,
      };
    }

    try {
      const { data, adjusted } = await apiRequest("/cart/items", {
        method: "POST",
        token,
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
    if (quantity > target.stock) return { success: false, message: `Máximo disponible: ${target.stock} unidades.` };
    if (!token) {
      localStorage.removeItem("bikestore_cart_import_id");
      setItems((current) => current.map((item) => item.cartItemId === id ? { ...item, qty: quantity } : item));
      return { success: true };
    }
    try {
      const { data } = await apiRequest(`/cart/items/${id}`, {
        method: "PATCH",
        token,
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
    if (!token) {
      localStorage.removeItem("bikestore_cart_import_id");
      setItems((current) => current.filter((item) => item.cartItemId !== id));
      return { success: true };
    }
    try {
      const { data } = await apiRequest(`/cart/items/${id}`, { method: "DELETE", token });
      setItems(data);
      setCartError("");
      return { success: true };
    } catch (error) {
      setCartError(error.message);
      return { success: false, message: error.message };
    }
  };

  const clearCart = () => {
    if (!token) {
      localStorage.removeItem("bikestore_cart");
      localStorage.removeItem("bikestore_cart_import_id");
    }
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
