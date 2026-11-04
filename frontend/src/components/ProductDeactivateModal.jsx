import React, { useState } from "react";
import Icon from "./Icon";
import Button from "./Button";
import "../assets/styles.css";
export const ProductDeactivateModal = ({ isOpen, product, onClose, onConfirm, }) => {
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");
    if (!isOpen || !product)
        return null;
    const handleConfirm = (e) => {
        e.preventDefault();
        if (!reason.trim()) {
            setError("El motivo de inactivación es obligatorio (Regla de negocio CU-12).");
            return;
        }
        onConfirm(product.id, reason);
        setReason("");
        setError("");
        onClose();
    };
    return (<div role="dialog" aria-modal="true" className="product-deactivate-modal-div-1" onClick={onClose}>
      <div className="product-deactivate-modal-div-2" onClick={(e) => e.stopPropagation()}>
        <div className="product-deactivate-modal-div-3">
          <div className="product-deactivate-modal-div-4">
            <Icon name="alert-triangle" size={18}/>
            <h3 className="product-deactivate-modal-h3-1">
              Inactivar Producto (CU-12)
            </h3>
          </div>
          <button onClick={onClose} className="product-deactivate-modal-button-1">
            <Icon name="close" size={20}/>
          </button>
        </div>

        <form onSubmit={handleConfirm} className="product-deactivate-modal-form-1">
          <p className="product-deactivate-modal-p-1">
            ¿Estás seguro de inactivar <strong className="product-deactivate-modal-strong-1">{product.name}</strong>?
            El producto dejará de ser visible en el catálogo público para visitantes y clientes.
          </p>

          <div className="product-deactivate-modal-div-5">
            <strong>Nota del SENA:</strong> Inactivar un producto no es igual a "Sin stock". Requiere dejar asentada la justificación administrativa.
          </div>

          <div className="product-deactivate-modal-div-6">
            <label className="product-deactivate-modal-label-1">
              Motivo obligatorio de inactivación *
            </label>
            <textarea required rows={3} placeholder="Ej. Descontinuado por el fabricante Specialized, daño estructural en lote, fin de temporada..." value={reason} onChange={(e) => {
            setReason(e.target.value);
            if (error)
                setError("");
        }} className="product-deactivate-modal-textarea-1"/>
          </div>

          {error && (<p className="product-deactivate-modal-p-2">{error}</p>)}

          <div className="product-deactivate-modal-div-7">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="danger" size="sm">
              Confirmar Inactivación
            </Button>
          </div>
        </form>
      </div>
    </div>);
};
export default ProductDeactivateModal;
