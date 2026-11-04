import React, { useState, useEffect } from "react";
import { initialProducts } from "./data/products";
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
function AppContent() {
    const [currentPage, setCurrentPage] = useState("home");
    const [products, setProducts] = useState(() => {
        const catalogVersion = localStorage.getItem("bikestore_catalog_version");
        const saved = localStorage.getItem("bikestore_catalog_products");
        return saved && catalogVersion === "2" ? JSON.parse(saved) : initialProducts;
    });
    const [checkoutAfterAuth, setCheckoutAfterAuth] = useState(false);
    // Producto seleccionado para el detalle dinámico (CU-02)
    const [selectedProduct, setSelectedProduct] = useState(products[0]);
    // Último pedido completado para la pantalla de éxito (CU-08, RF-10)
    const [completedOrder, setCompletedOrder] = useState(null);
    const [orders, setOrders] = useState(() => {
        const saved = localStorage.getItem("bikestore_orders");
        return saved ? JSON.parse(saved) : [];
    });
    useEffect(() => {
        localStorage.setItem("bikestore_orders", JSON.stringify(orders));
    }, [orders]);
    // Modales interactivos
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    // Toast reactivo
    const [toastMessage, setToastMessage] = useState("");
    const [toastAction, setToastAction] = useState(null);
    const { addItem } = useCart();
    const { currentUser } = useAuth();
    useEffect(() => {
        localStorage.setItem("bikestore_catalog_products", JSON.stringify(products));
        localStorage.setItem("bikestore_catalog_version", "2");
    }, [products]);
    const showToast = (message, action) => {
        setToastMessage(message);
        setToastAction(action || null);
        setTimeout(() => {
            setToastMessage("");
            setToastAction(null);
        }, 4000);
    };
    const handleNavigate = (page) => {
        if (page === "checkout" && !currentUser) {
            setCheckoutAfterAuth(true);
            setCurrentPage("login");
            showToast("Para confirmar tu compra debes iniciar sesión. Te llevamos al acceso seguro.");
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
        const result = addItem(product, qty, selectedSize);
        if (result.success) {
            showToast(result.message, {
                label: "Ver Carrito",
                onClick: () => handleNavigate("cart"),
            });
        }
        else {
            showToast(result.message);
        }
    };
    // Guardar o actualizar producto desde el Admin (CU-09, CU-11)
    const handleSaveProduct = (productData) => {
        setProducts((prev) => {
            const exists = prev.some((p) => p.id === productData.id);
            if (exists) {
                return prev.map((p) => (p.id === productData.id ? { ...p, ...productData } : p));
            }
            return [productData, ...prev];
        });
    };
    // Inactivar producto con justificación obligatoria (CU-12)
    const handleDeactivateProduct = (productId, reason) => {
        setProducts((prev) => prev.map((p) => p.id === productId ? { ...p, status: "Inactivo", inactivationReason: reason } : p));
    };
    return (<MainLayout currentPage={currentPage} onNavigate={handleNavigate} onOpenSearch={() => setIsSearchOpen(true)}>
      {/* Vistas según la página activa */}
      {currentPage === "home" && (<HomePage products={products} onAddToCart={(p) => handleAddToCart(p, 1)} onSelectProduct={handleSelectProduct}/>)}

      {currentPage === "product" && (<ProductDetailPage product={selectedProduct} onAddToCart={handleAddToCart} onNavigate={handleNavigate}/>)}

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
