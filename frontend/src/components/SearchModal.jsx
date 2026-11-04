import React, { useState } from "react";
import { formatCOP } from "../utils/formatters";
import Icon from "./Icon";
import { asset } from "../config/env";
import "../assets/styles.css";
export const SearchModal = ({ products, isOpen, onClose, onSelectProduct, }) => {
    const [query, setQuery] = useState("");
    if (!isOpen)
        return null;
    const filtered = query.trim()
        ? products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.category.toLowerCase().includes(query.toLowerCase()) ||
            p.description.toLowerCase().includes(query.toLowerCase()))
        : [];
    const handleSelect = (product) => {
        onSelectProduct(product);
        onClose();
    };
    return (<div role="dialog" aria-modal="true" className="search-modal-div-1" onClick={onClose}>
      <div className="search-modal-div-2" onClick={(e) => e.stopPropagation()}>
        {/* Input de Búsqueda */}
        <div className="search-modal-div-3">
          <span className="search-modal-span-1">
            <Icon name="search" size={22}/>
          </span>
          <input type="text" autoFocus placeholder="Busca bicicletas, transmisiones, cascos, pedales..." value={query} onChange={(e) => setQuery(e.target.value)} className="search-modal-input-1"/>
          {query && (<button type="button" onClick={() => setQuery("")} className="search-modal-button-1">
              Borrar
            </button>)}
          <button type="button" onClick={onClose} aria-label="Cerrar búsqueda" className="search-modal-button-2">
            <Icon name="close" size={22}/>
          </button>
        </div>

        {/* Términos rápidos */}
        <div className="search-modal-div-4">
          <span className="search-modal-span-2">
            Populares:
          </span>
          {["Specialized", "Shimano", "Trek", "Carbono", "Casco", "Gravel"].map((tag) => (<button key={tag} type="button" onClick={() => setQuery(tag)} className="search-modal-button-3">
                {tag}
              </button>))}
        </div>

        {/* Resultados */}
        <div className="search-modal-div-5">
          {query.trim() === "" ? (<div className="search-modal-div-6">
              <Icon name="bike" size={32} className="search-modal-icon-1"/>
              <p className="search-modal-p-1">Escribe el nombre de un modelo, marca o accesorio para consultar disponibilidad.</p>
            </div>) : filtered.length === 0 ? (<div className="search-modal-div-6">
              <p className="search-modal-p-2">
                No encontramos coincidencias para "{query}"
              </p>
              <p className="search-modal-p-1">
                Intenta con términos más generales como "Ruta", "Frenos" o "MTB".
              </p>
            </div>) : (filtered.map((product) => (<button key={product.id} type="button" onClick={() => handleSelect(product)} className="search-modal-button-4 group">
                <div className="search-modal-div-7">
                  <img src={asset(product.image)} alt={product.name} className="search-modal-img-1"/>
                  <div>
                    <span className="search-modal-span-2">
                      {product.category}
                    </span>
                    <h4 className="search-modal-h4-1">
                      {product.name}
                    </h4>
                  </div>
                </div>
                <div className="search-modal-div-8">
                  <span className="search-modal-span-3">
                    {formatCOP(product.price)}
                  </span>
                  <span className="search-modal-span-4">
                    {product.stock > 0 ? "Disponible" : "Sin stock"}
                  </span>
                </div>
              </button>)))}
        </div>
      </div>
    </div>);
};
export default SearchModal;
