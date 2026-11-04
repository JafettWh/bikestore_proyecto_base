import React from "react";
import { formatCOP } from "../utils/formatters";
import Icon from "../components/Icon";
import Button from "../components/Button";
import InvoiceDownload from "../components/InvoiceDownload";
import "../assets/styles.css";
export const SuccessPage = ({ order, onNavigate }) => {
    const orderId = order ? order.id : "BS-20261009-842";
    const email = order ? order.email : "ciclista.premium@gmail.com";
    const total = order ? order.total : 4599000;
    return (<main className="success-main-1">
      {/* Icono de Check */}
      <div className="success-div-1 animate-scale-in">
        <Icon name="check" size={38}/>
      </div>

      <span className="success-span-1">
        Pedido Confirmado #{orderId}
      </span>

      <h1 className="success-h1-1">
        ¡Gracias por tu Compra!
      </h1>

      <p className="success-p-1">
        Tu pedido ha sido registrado para <strong className="success-strong-1">{email}</strong>. Descarga tu comprobante con los datos de entrega y el detalle de productos. Este prototipo no procesa pagos reales ni envía facturas por correo.
      </p>

      {/* Stepper de Despacho de la Orden */}
      <div className="success-div-2">
        <div className="success-div-3">
          <span className="success-span-2">
            Estado Logístico de tu Encomienda
          </span>
          <span className="success-span-3">
            Total Pagado: {formatCOP(total)}
          </span>
        </div>

        <div className="success-div-4">
          <div className="success-div-5">
            <span className="success-span-4">
              <Icon name="check" size={16}/>
            </span>
            <b className="success-b-1">Empaquetado</b>
            <span className="success-span-5">En bodega Palmira</span>
          </div>

          <div className="success-div-6">
            <span className="success-span-6">
              2
            </span>
            <b className="success-b-1">En Camino</b>
            <span className="success-span-5">Guía Envía / Servientrega</span>
          </div>

          <div className="success-div-6">
            <span className="success-span-6">
              3
            </span>
            <b className="success-b-1">Entregado</b>
            <span className="success-span-5">En tu dirección</span>
          </div>
        </div>
      </div>

      <div className="success-div-7">
        {order && <InvoiceDownload record={order}/>}
        <Button variant="primary" size="lg" onClick={() => onNavigate("home")} icon={<Icon name="arrow" size={16}/>}>
          Volver a la Tienda
        </Button>
      </div>
    </main>);
};
export default SuccessPage;
