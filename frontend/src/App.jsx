import React, { useState, useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import { CartProvider } from "./context/CartContext";
import { useCart } from "./hooks/useCart";
// Componentes Templates y Organismos
import MainLayout from "./components/MainLayout";
import SearchModal from "./components/SearchModal";
import ProtectedRoute from "./components/ProtectedRoute";
import Toast from "./components/Toast";
// Páginas Atómicas
import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import SuccessPage from "./pages/SuccessPage";
import AuthPage from "./pages/AuthPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import PerfilPage from "./pages/perfilpage";
import "./assets/styles.css";
import { apiRequest } from "./utils/api";
function AppContent() {
    const [currentPage, setCurrentPage] = useState("home");
    const [products, setProducts] = useState([]);
    const [catalogError, setCatalogError] = useState("");
    const [checkoutAfterAuth, setCheckoutAfterAuth] = useState(false);
    // Producto seleccionado para el detalle dinámico (CU-02)
    const [selectedProduct, setSelectedProduct] = useState(null);
    // Último pedido completado para la pantalla de éxito (CU-08, RF-10)
    const [completedOrder, setCompletedOrder] = useState(null);
    const [orders, setOrders] = useState([]);
    // Modales interactivos
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    // Toast reactivo
    const [toastMessage, setToastMessage] = useState("");
    const [toastAction, setToastAction] = useState(null);
    const { addItem, cartError } = useCart();
    const { currentUser, token, isReady } = useAuth();
    useEffect(() => {
        apiRequest(currentUser?.role === "admin" ? "/products/manage" : "/products", {
            token: currentUser?.role === "admin" ? token : undefined,
        })
            .then(({ data }) => {
                setProducts(data);
                setCatalogError("");
                if (!selectedProduct && data.length) setSelectedProduct(data[0]);
            })
            .catch((error) => setCatalogError(error.message));
    }, [currentUser?.role, token]);

    useEffect(() => {
        if (token && currentUser?.role !== "admin") {
            apiRequest("/orders/mine", { token })
                .then(({ data }) => setOrders(data))
                .catch((error) => showToast(error.message));
        } else {
            setOrders([]);
        }
    }, [token, currentUser?.role]);

    useEffect(() => {
        if (cartError) showToast(cartError);
    }, [cartError]);

    const showToast = (message, action) => {
        setToastMessage(message);
        setToastAction(action || null);
        setTimeout(() => {
            setToastMessage("");
            setToastAction(null);
        }, 4000);
    };
    const handleNavigate = (page) => {
        if (page === "checkout" && (!currentUser || currentUser.role !== "cliente")) {
            setCheckoutAfterAuth(true);
            setCurrentPage("login");
            showToast(currentUser
                ? "Solo los clientes pueden finalizar una compra."
                : "Para confirmar tu compra debes iniciar sesión. Te llevamos al acceso seguro.");
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }
        if (page === "profile" && !currentUser) {
            setCurrentPage("login");
            showToast("Inicia sesión para gestionar y visualizar tu perfil.");
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }
        if (page !== "login" && page !== "register" && page !== "recovery") {
            setCheckoutAfterAuth(false);
        }
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
    const handleSelectProduct = (product) => {
        setSelectedProduct(product);
        handleNavigate("product");
    };
    const handleAddToCart = (product, qty = 1, selectedSize) => {
        addItem(product, qty, selectedSize).then((result) => {
        if (result.success) {
            showToast(result.message, {
                label: "Ver Carrito",
                onClick: () => handleNavigate("cart"),
            });
        }
        else {
            showToast(result.message);
        }
        });
    };
    // Guardar o actualizar producto desde el Admin (CU-09, CU-11)
    const handleSaveProduct = async (productData) => {
        const editing = productData.id !== undefined && productData.id !== null;
        const { imageFile, ...fields } = productData;
        let body = fields;
        if (imageFile) {
            body = new FormData();
            for (const [key, value] of Object.entries(fields)) {
                if (value !== undefined && value !== null) {
                    body.append(key, typeof value === "object" ? JSON.stringify(value) : String(value));
                }
            }
            body.append("image", imageFile);
        }
        const { data } = await apiRequest(editing ? `/products/${productData.id}` : "/products", {
            method: editing ? "PUT" : "POST",
            token,
            body,
        });
        setProducts((prev) => editing
            ? prev.map((product) => product.id === data.id ? data : product)
            : [data, ...prev]);
        return data;
    };
    // Inactivar producto con justificación obligatoria (CU-12)
    const handleDeactivateProduct = async (productId, reason) => {
        const { data } = await apiRequest(`/products/${productId}/deactivate`, {
            method: "PATCH",
            token,
            body: { reason },
        });
        setProducts((prev) => prev.map((product) => product.id === data.id ? data : product));
    };
    if (!isReady) return <main className="api-state">Validando la sesión...</main>;
    return (<MainLayout currentPage={currentPage} onNavigate={handleNavigate} onOpenSearch={() => setIsSearchOpen(true)}>
      {/* Vistas según la página activa */}
      {currentPage === "home" && (<HomePage products={products} error={catalogError} onAddToCart={(p) => handleAddToCart(p, 1)} onSelectProduct={handleSelectProduct}/>)}

      {currentPage === "product" && selectedProduct && (<ProductDetailPage product={selectedProduct} onAddToCart={handleAddToCart} onNavigate={handleNavigate}/>)}

      {currentPage === "cart" && <CartPage onNavigate={handleNavigate}/>}

      {currentPage === "checkout" && (<CheckoutPage onNavigate={handleNavigate} onOrderCompleted={(order) => {
                setCompletedOrder(order);
                setOrders((prev) => [order, ...prev]);
            }}/>)}

      {currentPage === "success" && (<SuccessPage order={completedOrder} onNavigate={handleNavigate}/>)}

      {currentPage === "profile" && (<PerfilPage onNavigate={handleNavigate} orders={orders}/>)}

      {(currentPage === "login" || currentPage === "register" || currentPage === "recovery") && (<AuthPage mode={currentPage} onNavigate={handleNavigate} returnAfterAuth={checkoutAfterAuth ? "checkout" : undefined}/>)}

      {currentPage === "admin" && (<ProtectedRoute roles={["admin"]} onDenied={() => handleNavigate("login")}>
          <AdminDashboardPage orders={orders} products={products} onNavigate={handleNavigate} onSaveProduct={handleSaveProduct} onDeactivateProduct={handleDeactivateProduct}/>
        </ProtectedRoute>)}

      {/* Modales Globales */}
      <SearchModal products={products.filter((p) => p.status === "Activo")} isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onSelectProduct={handleSelectProduct}/>

      {/* Alerta Toast Flotante */}
      <Toast message={toastMessage} actionLabel={toastAction?.label} onAction={toastAction?.onClick} onClose={() => setToastMessage("")}/>
    </MainLayout>);
}
export default function App() {
    return (<AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>);
}
