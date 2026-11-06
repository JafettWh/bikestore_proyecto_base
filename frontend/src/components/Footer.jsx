import React, { useState } from "react";
import Logo from "./Logo";
import Icon from "./Icon";
import TermsModal from "./TermsModal";
import "../assets/styles.css";
export const Footer = ({ onNavigate }) => {
    const [isTermsOpen, setIsTermsOpen] = useState(false);
    return (<footer className="footer-footer-1">
      <div className="footer-div-1">
        <div className="footer-div-2">
          {/* Columna 1: Marca y descripción */}
          <div className="footer-div-3">
            <Logo onClick={() => onNavigate("home")} size="lg" variant="dark"/>
            <p className="footer-p-1">
              La plataforma definitiva para apasionados del ciclismo de ruta, montaña y aventura.
              Distribuidor de bicicletas premium y componentes de competición en Palmira y Valle del Cauca.
            </p>
            <div className="footer-div-4">
              <Icon name="shield" size={14}/> Productos originales con respaldo oficial
            </div>
          </div>

          {/* Columna 2: Catálogo */}
          <div>
            <h4 className="footer-h4-1">
              Explorar Catálogo
            </h4>
            <ul className="footer-ul-1">
              <li>
                <button type="button" onClick={() => onNavigate("home")} className="footer-button-1">
                  Bicicletas
                </button>
              </li>
              <li>
                <button type="button" onClick={() => {
            onNavigate("home");
            setTimeout(() => document.getElementById("componentes")?.scrollIntoView({ behavior: "smooth" }), 100);
        }} className="footer-button-1">
                  Componentes
                </button>
              </li>
              <li>
                <button type="button" onClick={() => {
            onNavigate("home");
            setTimeout(() => document.getElementById("accesorios")?.scrollIntoView({ behavior: "smooth" }), 100);
        }} className="footer-button-1">
                  Accesorios
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate("cart")} className="footer-button-1">
                  Carrito de compras
                </button>
              </li>
              <li>
                <span className="footer-span-1">Garantías de productos originales</span>
              </li>
            </ul>
          </div>

          {/* Columna 3: Información y Soporte */}
          <div>
            <h4 className="footer-h4-1">
              Atención al Ciclista
            </h4>
            <ul className="footer-ul-1">
              <li>
                <button type="button" onClick={() => onNavigate("home")} className="footer-button-1">
                  Catálogo Oficial 2026
                </button>
              </li>
              <li>
                <a href="#politicas" onClick={(e) => {
            e.preventDefault();
            alert("Envíos gratis a nivel nacional por compras superiores a $300.000 COP.");
        }} className="footer-a-1">
                  Políticas de Envío Express
                </a>
              </li>
              <li>
                <a href="#garantias" onClick={(e) => {
            e.preventDefault();
            alert("Garantía de por vida en cuadros de carbono seleccionados Specialized y Trek.");
        }} className="footer-a-1">
                  Cobertura de Garantías
                </a>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate("login")} className="footer-button-1">
                  Portal de Clientes
                </button>
              </li>
              <li>
                <span className="footer-span-1">Sede: Palmira, Valle del Cauca</span>
              </li>
            </ul>
          </div>

        </div>
        {/* Barra Inferior de Copyright */}
        <div className="footer-div-6">
          <p>© 2026 BikeStore Colombia. Desarrollado con arquitectura limpia en React.</p>
          <div className="footer-div-7">
            <button type="button" onClick={() => setIsTermsOpen(true)} className="hover:text-[#ffd400] transition-colors bg-transparent border-0 p-0 text-inherit cursor-pointer font-normal">
              Términos y Condiciones
            </button>
            <span>Tratamiento de Datos Personales</span>
            <span>Ayuda al Cliente</span>
          </div>
        </div>
      </div>

      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} onAccept={() => setIsTermsOpen(false)}/>
    </footer>);
};
export default Footer;
