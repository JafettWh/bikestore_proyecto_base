import React, { useState } from "react";
import { useCart } from "../hooks/useCart";
import { formatCOP } from "../utils/formatters";
import Icon from "../components/Icon";
import Button from "../components/Button";
import { asset } from "../config/env";
import "../assets/styles.css";
export const CartPage = ({ onNavigate }) => {
    const { items, updateQty, removeItem, subtotal, tax, shipping, total } = useCart();
    const [itemToDelete, setItemToDelete] = useState(null);
    const handleDecrease = (id, currentQty, name) => {
        if (currentQty <= 1) {
            setItemToDelete({ id, name });
        }
        else {
            updateQty(id, -1);
        }
    };
    const confirmDelete = () => {
        if (itemToDelete) {
            removeItem(itemToDelete.id);
            setItemToDelete(null);
        }
    };
    return (<main className="cart-main-1">
      <div className="cart-div-1">
        <span className="cart-span-1">
          Tu Selección
        </span>
        <h1 className="cart-h1-1">
          Carrito de Compras
        </h1>
        <p className="cart-p-1">
          {items.length === 0
            ? "No tienes productos en el carrito."
            : `${items.length} productos listos para rodar.`}
        </p>
      </div>

      {items.length === 0 ? (<div className="cart-div-2">
          <div className="cart-div-3">
            <Icon name="cart" size={32}/>
          </div>
          <h2 className="cart-h2-1">
            Tu carrito está esperando una aventura
          </h2>
          <p className="cart-p-2">
            Explora nuestro catálogo oficial y encuentra la bicicleta o repuesto ideal para tu próxima rodada.
          </p>
          <Button variant="primary" size="md" onClick={() => onNavigate("home")}>
            Explorar Catálogo de Productos
          </Button>
        </div>) : (<div className="cart-div-4">
          {/* Lista de Productos del Carrito */}
          <div className="cart-div-5">
            <div className="cart-div-6">
              {items.map((item) => (<article key={item.id} className="cart-article-1">
                  {/* Foto y descripción */}
                  <div className="cart-div-7">
                    <img src={asset(item.image)} alt={item.name} className="cart-img-1"/>
                    <div className="cart-div-8">
                      <span className="cart-span-2">
                        {item.category}
                      </span>
                      <h3 className="cart-h3-1">
                        {item.name}
                      </h3>
                      <div className="cart-div-9">
                        {item.selectedSize && <span>Talla: <strong>{item.selectedSize}</strong></span>}
                        <span>· Stock disponible: <strong>{item.stock}</strong></span>
                      </div>
                      <span className="cart-span-3">
                        {formatCOP(item.price)} c/u
                      </span>
                    </div>
                  </div>

                  {/* Controles de Cantidad */}
                  <div className="cart-div-10">
                    <div className="cart-div-11">
                      <button type="button" onClick={() => handleDecrease(item.id, item.qty, item.name)} className="cart-button-1" aria-label="Disminuir cantidad">
                        <Icon name="minus" size={13}/>
                      </button>
                      <span className="cart-span-4">{item.qty}</span>
                      <button type="button" disabled={item.qty >= item.stock} onClick={() => updateQty(item.id, 1)} className="cart-button-2" aria-label="Aumentar cantidad">
                        <Icon name="plus" size={13}/>
                      </button>
                    </div>

                    {/* Subtotal del item */}
                    <div className="cart-div-12">
                      <span className="cart-span-5">
                        {formatCOP(item.price * item.qty)}
                      </span>
                    </div>

                    {/* Botón Eliminar */}
                    <button type="button" onClick={() => setItemToDelete({ id: item.id, name: item.name })} className="cart-button-3" aria-label={`Eliminar ${item.name}`}>
                      <Icon name="trash" size={18}/>
                    </button>
                  </div>
                </article>))}
            </div>

            <div className="cart-div-13">
              <Button variant="outline" size="sm" onClick={() => onNavigate("home")} icon={<Icon name="arrow-left" size={14}/>} iconPosition="left">
                Continuar Comprando
              </Button>
            </div>
          </div>

          {/* Resumen de la Orden */}
          <aside className="cart-aside-1">
            <h3 className="cart-h3-2">
              Resumen del Pedido
            </h3>

            <div className="cart-div-14">
              <div className="cart-div-15">
                <span className="cart-span-6">Subtotal productos:</span>
                <span className="cart-span-7">{formatCOP(subtotal)}</span>
              </div>

              <div className="cart-div-15">
                <span className="cart-span-6">Envío a domicilio:</span>
                <span className={`cart-span-8 ${shipping === 0 ? "cart-span-9" : "cart-span-10"}`}>
                  {shipping === 0 ? "Gratis (Aplica beneficio)" : formatCOP(shipping)}
                </span>
              </div>

              <div className="cart-div-15">
                <span className="cart-span-6">IVA (19% incluido):</span>
                <span className="cart-span-6">{formatCOP(tax)}</span>
              </div>

              <div className="cart-div-16">
                <span className="cart-span-11">Total a Pagar:</span>
                <span className="cart-span-12">
                  {formatCOP(total)}
                </span>
              </div>
            </div>

            <Button variant="primary" size="lg" fullWidth className="cart-button-4" onClick={() => onNavigate("checkout")} icon={<Icon name="arrow" size={16}/>}>
              Continuar al Pago
            </Button>

            <div className="cart-div-17">
              <Icon name="shield" size={14}/>
              <span>Transacción cifrada y protegida por pasarela segura</span>
            </div>
          </aside>
        </div>)}

      {/* Modal de Confirmación de Eliminación (CU-07 alternos 3.1 y 5.1) */}
      {itemToDelete && (<div role="dialog" aria-modal="true" className="cart-div-18">
          <div className="cart-div-19">
            <div className="cart-div-20">
              <Icon name="alert-triangle" size={18}/>
              <span>Confirmar Eliminación</span>
            </div>
            <p className="cart-p-3">
              ¿Deseas remover <strong className="cart-span-10">{itemToDelete.name}</strong> de tu carrito de compras?
            </p>
            <div className="cart-div-21">
              <Button variant="outline" size="sm" className="cart-button-5" onClick={() => setItemToDelete(null)}>
                Conservar
              </Button>
              <Button className="cart-button-style-1" variant="danger" size="sm" onClick={confirmDelete}>
                Eliminar Producto
              </Button>
            </div>
          </div>
        </div>)}
    </main>);
};
export default CartPage;
