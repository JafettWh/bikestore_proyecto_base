import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import Logo from "./Logo";
import Icon from "./Icon";
import "../assets/styles.css";
export const Header = ({ currentPage, onNavigate, onOpenSearch, }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { currentUser, logout } = useAuth();
    const { cartCount } = useCart();
    const handleNav = (page) => {
        onNavigate(page);
        setMobileMenuOpen(false);
    };
    return (<header className="header-header-1">
      {/* Barra de Navegación Principal */}
      <div className="header-div-1">
        {/* Logo con imagen transparente */}
        <div className="header-div-2">
          <Logo onClick={() => handleNav("home")} size="md" variant="dark"/>
        </div>

        {/* Links de Navegación Escritorio */}
        <nav className="header-nav-1">
          <button type="button" onClick={() => handleNav("home")} className={`header-button-1 ${currentPage === "home"
            ? "header-button-2"
            : "header-button-3"}`}>
            Bicicletas
          </button>

          <button type="button" onClick={() => {
            handleNav("home");
            setTimeout(() => {
                const el = document.getElementById("componentes");
                el?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }} className="header-button-4">
            Componentes
          </button>

          <button type="button" onClick={() => {
            handleNav("home");
            setTimeout(() => {
                const el = document.getElementById("accesorios");
                el?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }} className="header-button-4">
            Accesorios
          </button>

          {currentUser?.role === "admin" && (<button type="button" onClick={() => handleNav("admin")} className={`header-button-5 ${currentPage === "admin" ? "header-button-6" : ""}`}>
              Panel Admin
            </button>)}
        </nav>

        {/* Acciones de la Derecha */}
        <div className="header-div-3">
          {/* Buscar */}
          <button type="button" onClick={onOpenSearch} aria-label="Abrir buscador" className="header-button-7">
            <Icon name="search" size={20}/>
          </button>

          {/* Cuenta / Mi Perfil */}
          <button type="button" onClick={() => handleNav(currentUser ? "profile" : "login")} aria-label={currentUser ? "Mi Perfil de Usuario" : "Iniciar Sesión"} className={`header-button-8 ${currentPage === "login" || currentPage === "profile" || (currentUser?.role === "admin" && currentPage === "admin")
            ? "header-button-9"
            : "header-button-3"}`}>
            <Icon name="user" size={20}/>
            <span className="header-span-1">
              {currentUser ? currentUser.name.split(" ")[0] : "Cuenta"}
            </span>
          </button>
          {currentUser && (<button type="button" onClick={logout} aria-label="Cerrar Sesión" className="header-button-10">
              <Icon name="logout" size={20}/>
              <span className="header-span-1">Cerrar Sesión</span>
            </button>)}

          {/* Carrito */}
          <button type="button" onClick={() => handleNav("cart")} aria-label={`Carrito con ${cartCount} productos`} className={`header-button-11 ${currentPage === "cart"
            ? "header-button-9"
            : "header-button-3"}`}>
            <div className="header-div-4">
              <Icon name="cart" size={20}/>
              {cartCount > 0 && (<span className="header-span-2 animate-scale-in">
                  {cartCount}
                </span>)}
            </div>
            <span className="header-span-1">Carrito</span>
          </button>

          {/* Botón Menú Móvil */}
          <button type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Alternar menú móvil" className="header-button-12">
            <Icon name={mobileMenuOpen ? "close" : "menu"} size={22}/>
          </button>
        </div>
      </div>

      {/* Menú Desplegable Móvil */}
      {mobileMenuOpen && (<div className="header-div-5 animate-slide-down">
          <button onClick={() => handleNav("home")} className="header-button-13">
            Bicicletas de Montaña, Ruta & Gravel
          </button>
          <button onClick={() => {
                handleNav("home");
                setTimeout(() => {
                    document.getElementById("componentes")?.scrollIntoView({ behavior: "smooth" });
                }, 100);
            }} className="header-button-13">
            Componentes de Alto Rendimiento
          </button>
          <button onClick={() => {
                handleNav("home");
                setTimeout(() => {
                    document.getElementById("accesorios")?.scrollIntoView({ behavior: "smooth" });
                }, 100);
            }} className="header-button-13">
            Accesorios & Protección
          </button>
          {currentUser && (<button onClick={() => handleNav("profile")} className="header-button-13 !text-[#ffd400] font-bold">
              Mi Perfil de Usuario ({currentUser.name.split(" ")[0]})
            </button>)}
          {currentUser?.role === "admin" && (<button onClick={() => handleNav("admin")} className="header-button-14">
              Panel de Administración
            </button>)}
        </div>)}
    </header>);
};
export default Header;
