import React, { useEffect } from "react";
import { formatCOP } from "../utils/formatters";
import Icon from "./Icon";
import Badge from "./Badge";
import "../assets/styles.css";

const logisticsSteps = ["empaquetado", "en camino", "entregado"];
const logisticsLabels = {
  empaquetado: "Empaquetado",
  "en camino": "En camino",
  entregado: "Entregado",
  retornado: "Retornado",
};

function LogisticsTracker({ status = "empaquetado" }) {
  const isReturned = status === "retornado";
  const activeStep = isReturned ? 2 : Math.max(0, logisticsSteps.indexOf(status));
  const steps = isReturned
    ? [...logisticsSteps.slice(0, 2), "retornado"]
    : logisticsSteps;

  return (
    <div className={`order-tracker ${isReturned ? "order-tracker-returned" : ""}`}>
      {steps.map((step, index) => {
        const complete = index < activeStep;
        const current = index === activeStep;
        return (
          <div
            key={step}
            className={`order-tracker-step ${complete ? "is-complete" : ""} ${current ? "is-current" : ""}`}
          >
            <span>{complete ? <Icon name="check" size={16} /> : index + 1}</span>
            <b>{logisticsLabels[step]}</b>
          </div>
        );
      })}
    </div>
  );
}

export default function OrderDetailsModal({ order, onClose }) {
  useEffect(() => {
    if (!order) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [order, onClose]);

  if (!order) return null;

  const logisticsStatus = order.logisticsStatus || "empaquetado";
  const lines = order.items || [];

  return (
    <div
      className="order-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="order-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-modal-title"
      >
        <header className="order-modal-header">
          <div>
            <span>Detalle de compra</span>
            <h2 id="order-modal-title">{order.orderNumber || order.id}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar detalle del pedido">
            <Icon name="close" size={20} />
          </button>
        </header>

        <div className="order-modal-content">
          <section className="order-modal-tracking">
            <div className="order-modal-section-heading">
              <div>
                <span>Estado logístico</span>
                <Badge variant={logisticsStatus === "retornado" ? "red" : "green"}>
                  {logisticsLabels[logisticsStatus] || logisticsLabels.empaquetado}
                </Badge>
              </div>
              <small>{order.date || "Fecha no disponible"}</small>
            </div>
            <LogisticsTracker status={logisticsStatus} />
            {logisticsStatus === "retornado" && (
              <p className="order-return-note">
                La entrega no pudo completarse. El pedido fue marcado como retornado.
              </p>
            )}
          </section>

          <section className="order-modal-section">
            <h3>Productos</h3>
            <div className="order-modal-items">
              {lines.map((item, index) => (
                <article key={`${item.id}-${item.selectedSize || ""}-${index}`} className="order-modal-item">
                  {item.image && <img src={item.image} alt="" />}
                  <div className="order-modal-item-copy">
                    <b>{item.name}</b>
                    <span>
                      {item.qty} un. × {formatCOP(item.price)}
                      {item.selectedSize ? ` · Talla ${item.selectedSize}` : ""}
                    </span>
                  </div>
                  <strong>{formatCOP(item.price * item.qty)}</strong>
                </article>
              ))}
            </div>
            <div className="order-modal-totals">
              <div><span>Subtotal</span><strong>{formatCOP(order.subtotal || 0)}</strong></div>
              <div><span>Envío</span><strong>{formatCOP(order.shipping || 0)}</strong></div>
              <div className="order-modal-total"><span>Total pagado</span><strong>{formatCOP(order.total || 0)}</strong></div>
            </div>
          </section>

          <section className="order-modal-section order-modal-delivery">
            <h3>Datos de entrega</h3>
            <p><b>Pago:</b> {order.paymentMethod === "pse" ? "PSE" : "Tarjeta"} · {order.status || "Pagado"}</p>
            <p><b>Destinatario:</b> {order.customerName || "—"}</p>
            <p><b>Correo:</b> {order.email || "—"}</p>
            <p><b>Teléfono:</b> {order.phone || "—"}</p>
            <p><b>Dirección:</b> {[order.address, order.neighborhood, order.city].filter(Boolean).join(", ") || "—"}</p>
          </section>
        </div>
      </section>
    </div>
  );
}
