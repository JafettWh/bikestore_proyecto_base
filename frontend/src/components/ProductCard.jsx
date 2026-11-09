import React from "react";
import { formatCOP } from "../utils/formatters";
import Icon from "./Icon";
import Badge from "./Badge";
import Button from "./Button";
import { asset } from "../config/env";
import "../assets/styles.css";
export const ProductCard = ({ product, onAddToCart, onViewDetail, }) => {
    const isOutOfStock = product.stock <= 0;
    return (<article className="product-card-article-1 group">
      {/* Contenedor de Imagen */}
      <button type="button" onClick={() => onViewDetail(product)} aria-label={`Ver detalles de ${product.name}`} className="product-card-button-1">
        {product.badge && (<div className="product-card-div-1">
            <Badge variant={isOutOfStock ? "red" : product.badge === "Oferta" ? "yellow" : "dark"}>
              {isOutOfStock ? "Sin Stock" : product.badge}
            </Badge>
          </div>)}

        <img src={asset(product.image)} alt={product.name} className="product-card-img-1" loading="lazy"/>

        {/* Overlay hover sutil con icono de lupa/detalle */}
        <div className="product-card-div-2">
          <span className="product-card-span-1">
            <Icon name="eye" size={14}/> Ver Ficha Técnica
          </span>
        </div>
      </button>

      {/* Información del Producto */}
      <div className="product-card-div-3">
        <span className="product-card-span-2">
          {product.category}
        </span>

        <button type="button" onClick={() => onViewDetail(product)} className="product-card-button-2">
          {product.name}
        </button>

        <div className="product-card-div-4">
          <div className="product-card-div-5">
            <span className="product-card-span-3 product-card-span-style-1">
              {formatCOP(product.price)}
            </span>
            <span className="product-card-span-4 product-card-span-style-2">
              {isOutOfStock
            ? "No disponible en bodega"
            : `${product.stock} unidades en stock`}
            </span>
          </div>

          <Button type="button" variant="primary" size="sm" fullWidth disabled={isOutOfStock} onClick={() => onAddToCart(product)} aria-label={isOutOfStock
            ? `${product.name} agotado`
            : `Agregar ${product.name} al carrito`} className={`product-card-button-3 ${isOutOfStock
            ? "product-card-button-4"
            : ""}`}>
            {isOutOfStock ? "Sin stock" : "Agregar al carrito +"}
          </Button>
        </div>
      </div>
    </article>);
};
export default ProductCard;
