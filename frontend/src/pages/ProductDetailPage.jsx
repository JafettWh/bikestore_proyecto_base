import React, { useState } from "react";
import { formatCOP } from "../utils/formatters";
import Breadcrumb from "../components/Breadcrumb";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Icon from "../components/Icon";
import { asset } from "../config/env";
import "../assets/styles.css";
export const ProductDetailPage = ({ product, onAddToCart, onNavigate, }) => {
    const [selectedPhoto, setSelectedPhoto] = useState(product.gallery && product.gallery.length > 0 ? product.gallery[0] : product.image);
    const [selectedSize, setSelectedSize] = useState(product.sizes ? product.sizes[0] : undefined);
    const [quantity, setQuantity] = useState(1);
    const isOutOfStock = product.stock <= 0;
    const photos = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];
    const handleAddToCart = () => {
        if (isOutOfStock)
            return;
        onAddToCart(product, quantity, selectedSize);
    };
    const handleBuyNow = () => {
        if (isOutOfStock)
            return;
        onAddToCart(product, quantity, selectedSize);
        onNavigate("checkout");
    };
    return (<main className="product-detail-main-1">
      {/* Migas de Pan */}
      <Breadcrumb items={[
            { label: "Inicio", onClick: () => onNavigate("home") },
            { label: product.section, onClick: () => onNavigate("home") },
            { label: product.category, onClick: () => onNavigate("home") },
            { label: product.name, active: true },
        ]}/>

      {/* Grid Principal: Galería a la izquierda, Información a la derecha */}
      <section className="product-detail-section-1">
        {/* Columna Izquierda: Galería */}
        <div className="product-detail-div-1">
          <div className="product-detail-div-2">
            {product.badge && (<div className="product-detail-div-3">
                <Badge variant={isOutOfStock ? "red" : "yellow"}>
                  {isOutOfStock ? "Sin Stock" : product.badge}
                </Badge>
              </div>)}
            <img src={asset(selectedPhoto)} alt={product.name} className="product-detail-img-1"/>
          </div>

          {/* Miniaturas */}
          {photos.length > 1 && (<div className="product-detail-div-4">
              {photos.map((photo, idx) => (<button key={idx} type="button" onClick={() => setSelectedPhoto(photo)} className={`product-detail-button-1 ${selectedPhoto === photo
                    ? "product-detail-button-2"
                    : "product-detail-button-3"}`}>
                  <img src={asset(photo)} alt="" className="product-detail-img-2"/>
                </button>))}
            </div>)}
        </div>

        {/* Columna Derecha: Detalles Comerciales */}
        <div className="product-detail-div-5">
          <div className="product-detail-div-6">
            <span className="product-detail-span-1">
              {product.section} · {product.category}
            </span>
            <div className="product-detail-div-7">
              <span>★★★★★</span>
              <span className="product-detail-span-2">(4.9 · 24 reseñas)</span>
            </div>
          </div>

          <h1 className="product-detail-h1-1">
            {product.name}
          </h1>

          <div className="product-detail-div-8">
            <span className="product-detail-span-3">
              {formatCOP(product.price)}
            </span>
            <span className="product-detail-span-4">
              IVA del 19% Incluido
            </span>
          </div>

          {/* Estado de Existencias (CU-02 paso 4 y alterno 4.1) */}
          <div className="product-detail-div-9">
            <span className="product-detail-span-5">Disponibilidad en almacén:</span>
            {isOutOfStock ? (<span className="product-detail-span-6">
                <Icon name="close" size={14}/> Producto sin existencias disponibles
              </span>) : (<span className="product-detail-span-7">
                <Icon name="check" size={14}/> {product.stock} unidades listas para despacho
              </span>)}
          </div>

          <p className="product-detail-p-1">
            {product.description}
          </p>

          {/* Selector de Tallas si aplica */}
          {product.sizes && product.sizes.length > 0 && (<div className="product-detail-div-10">
              <div className="product-detail-div-11">
                <span className="product-detail-span-8">
                  Selecciona tu talla:
                </span>
    
              </div>
              <div className="product-detail-div-12">
                {product.sizes.map((s) => (<button key={s} type="button" onClick={() => setSelectedSize(s)} className={`product-detail-button-4 ${selectedSize === s
                    ? "product-detail-button-5"
                    : "product-detail-button-6"}`}>
                    {s}
                  </button>))}
              </div>
            </div>)}

          {/* Selector de Cantidad */}
          {!isOutOfStock && (<div className="product-detail-div-13">
              <span className="product-detail-span-10">
                Cantidad:
              </span>
              <div className="product-detail-div-14">
                <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="product-detail-button-7">
                  <Icon name="minus" size={14}/>
                </button>
                <span className="product-detail-span-11">{quantity}</span>
                <button type="button" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="product-detail-button-7">
                  <Icon name="plus" size={14}/>
                </button>
              </div>
              <span className="product-detail-span-12">
                (Máx. {product.stock})
              </span>
            </div>)}

          {/* Botones de Compra / Carrito (Inhabilitados si sin stock, CU-02 alterno 4.1) */}
          <div className="product-detail-div-15">
            <Button variant="primary" size="lg" fullWidth disabled={isOutOfStock} onClick={handleAddToCart} icon={<Icon name="cart" size={18}/>}>
              {isOutOfStock ? "Sin Stock" : "Agregar al Carrito"}
            </Button>

            {!isOutOfStock && (<Button variant="dark" size="lg" fullWidth onClick={handleBuyNow} icon={<Icon name="arrow" size={18}/>}>
                Comprar Ahora
              </Button>)}
          </div>

          {/* Garantía y soporte */}
          <div className="product-detail-div-16">
            <span className="product-detail-span-13">
              <Icon name="shield" size={24}/>
            </span>
            <div className="product-detail-div-17">
              <b className="product-detail-b-1">Despacho Asegurado con Envía & Servientrega</b>
              <span className="product-detail-span-5">
                Entrega estimada de 3 a 5 días hábiles a nivel nacional.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Ficha de Especificaciones Técnicas (CU-02 paso 5) */}
      <section className="product-detail-section-2">
        <div className="product-detail-div-18">
          <span className="product-detail-span-14">
            Ficha Técnica Oficial
          </span>
          <h2 className="product-detail-h2-1">
            Especificaciones Mecánicas y Materiales
          </h2>

          <div className="product-detail-div-19">
            {product?.specs && typeof product.specs === "object" && !Array.isArray(product.specs) ? (
              Object.entries(product.specs).map(([key, val]) => (
                <div key={key} className="product-detail-div-20">
                  <span className="product-detail-span-15">
                    {key}:
                  </span>
                  <span className="product-detail-span-16">{String(val)}</span>
                </div>
              ))
            ) : (
              <div className="product-detail-div-20 !flex !flex-col !items-start gap-2 col-span-2">
                <span className="product-detail-span-16 whitespace-pre-line text-sm leading-relaxed text-neutral-700">
                  {product?.technicalSpecs || product?.specs || "Especificaciones mecánicas oficiales de BikeStore."}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>);
};
export default ProductDetailPage;
