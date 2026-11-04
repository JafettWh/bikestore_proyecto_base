import React from "react";
import Icon from "./Icon";
import Button from "./Button";
import "../assets/styles.css";

export const TermsModal = ({ isOpen, onClose, onAccept }) => {
  if (!isOpen) return null;

  const handleAccept = () => {
    if (onAccept) {
      onAccept();
    }
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="terms-modal-overlay"
      onClick={onClose}
    >
      <div
        className="terms-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="terms-modal-header">
          <div>
            <span className="terms-modal-tag">Marco Legal & Seguridad</span>
            <h3 className="terms-modal-title">
              Términos y Condiciones de BikeStore
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="terms-modal-close-btn"
            aria-label="Cerrar modal"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Contenido desplazable */}
        <div className="terms-modal-body">
          <div className="terms-modal-alert">
            <Icon name="shield" size={18} />
            <p>
              Bienvenido a <strong>BikeStore Colombia</strong>. Al registrarte o
              utilizar nuestra plataforma de comercio electrónico, declaras haber
              leído y aceptado los siguientes términos y condiciones de servicio.
            </p>
          </div>

          <article className="terms-modal-section">
            <h4>1. Identificación y Objeto de la Plataforma</h4>
            <p>
              BikeStore es un distribuidor oficial de bicicletas de ruta,
              montaña, gravel, componentes certificados y accesorios de alto
              rendimiento en Colombia, con sede operativa en Palmira, Valle del
              Cauca. La plataforma permite la consulta de catálogo, gestión de
              pedidos y compra segura de productos originales.
            </p>
          </article>

          <article className="terms-modal-section">
            <h4>2. Registro de Usuario y Seguridad de Credenciales (CU-15 / CU-16)</h4>
            <p>
              El usuario se compromete a proporcionar información veraz, precisa
              y actualizada. La contraseña de acceso debe cumplir con los
              requisitos mínimos de seguridad de al menos 8 caracteres. El usuario
              es el único responsable de salvaguardar sus credenciales de acceso y
              notificar inmediatamente cualquier uso no autorizado.
            </p>
          </article>

          <article className="terms-modal-section">
            <h4>3. Precios, Moneda y Medios de Pago</h4>
            <p>
              Todos los precios exhibidos están expresados en Pesos Colombianos
              (COP) e incluyen los impuestos de ley (IVA). Los pagos se procesan a
              través de pasarelas electrónicas certificadas bajo protocolos de
              cifrado SSL mediante PSE, tarjetas de crédito y transferencias bancarias.
            </p>
          </article>

          <article className="terms-modal-section">
            <h4>4. Despachos y Cobertura Nacional</h4>
            <p>
              Realizamos envíos a nivel nacional con aliados logísticos
              autorizados (Envía, Servientrega). Los plazos promedio de entrega son
              de 3 a 5 días hábiles a ciudades principales. Toda mercancía viaja
              asegurada contra pérdida o daño en tránsito.
            </p>
          </article>

          <article className="terms-modal-section">
            <h4>5. Cobertura de Garantías Oficiales</h4>
            <p>
              Todos los productos cuentan con respaldo de los fabricantes
              (Specialized, Trek, Shimano, SRAM). Los cuadros de carbono y
              aluminio disponen de garantía oficial de fábrica sujeta a las
              condiciones de uso e inspección técnica previa.
            </p>
          </article>

          <article className="terms-modal-section">
            <h4>6. Derecho de Retracto y Devoluciones (Ley 1480 de 2011)</h4>
            <p>
              De conformidad con el Estatuto del Consumidor en Colombia, el
              comprador cuenta con 5 días hábiles posteriores a la recepción del
              producto para ejercer su derecho de retracto, siempre y cuando el
              artículo se encuentre en perfecto estado, sin señales de ensamblaje o
              rodaje, en su empaque y con etiquetas originales.
            </p>
          </article>

          <article className="terms-modal-section">
            <h4>7. Tratamiento de Datos Personales (Ley 1581 de 2012)</h4>
            <p>
              Al registrarte autorizas a BikeStore Colombia para recolectar,
              almacenar y usar tus datos personales con el fin exclusivo de
              procesar tus compras, emitir facturación electrónica, coordinar
              despachos y brindar atención posventa de acuerdo con nuestra política
              de Habeas Data.
            </p>
          </article>
        </div>

        {/* Acciones inferiores */}
        <div className="terms-modal-footer">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cerrar
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleAccept}
            icon={<Icon name="check" size={16} />}
            iconPosition="left"
          >
            Aceptar Términos y Condiciones
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
