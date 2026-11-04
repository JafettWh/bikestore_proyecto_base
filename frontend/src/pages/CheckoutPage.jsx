import React, { useState } from "react";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { formatCOP, generateOrderId } from "../utils/formatters";
import Icon from "../components/Icon";
import Button from "../components/Button";
import Input from "../components/Input";
import { asset } from "../config/env";
import "../assets/styles.css";
// Departamentos de Colombia con ciudades y municipios principales
const departamentosColombia = {
    "Valle del Cauca": ["Palmira", "Cali", "Buga", "Tuluá", "Yumbo", "Jamundí", "Cartago", "Buenaventura", "Candelaria", "Pradera"],
    "Antioquia": ["Medellín", "Envigado", "Rionegro", "Itagüí", "Bello", "Sabaneta", "La Ceja", "Apartadó"],
    "Bogotá D.C.": ["Bogotá D.C. (Usaquén)", "Bogotá D.C. (Chapinero)", "Bogotá D.C. (Suba)", "Bogotá D.C. (Teusaquillo)", "Bogotá D.C. (Fontibón)"],
    "Cundinamarca": ["Chía", "Cota", "Soacha", "Facatativá", "Zipaquirá", "Fusagasugá", "Mosquera", "Madrid", "Funza"],
    "Santander": ["Bucaramanga", "Floridablanca", "Girón", "Piedecuesta", "Barrancabermeja", "San Gil"],
    "Atlántico": ["Barranquilla", "Soledad", "Malambo", "Puerto Colombia"],
    "Risaralda": ["Pereira", "Dosquebradas", "Santa Rosa de Cabal"],
    "Caldas": ["Manizales", "Villamaría", "Chinchiná"],
    "Quindío": ["Armenia", "Calarcá", "Circasia", "Montenegro"],
    "Tolima": ["Ibagué", "Espinal", "Melgar"],
    "Huila": ["Neiva", "Pitalito", "Garzón"],
    "Bolívar": ["Cartagena", "Turbaco", "Magangué"],
    "Boyacá": ["Tunja", "Duitama", "Sogamoso", "Villa de Leyva"],
    "Cauca": ["Popayán", "Santander de Quilichao"],
    "Nariño": ["Pasto", "Ipiales", "Tumaco"],
    "Meta": ["Villavicencio", "Acacías", "Granada"],
    "Norte de Santander": ["Cúcuta", "Los Patios", "Villa del Rosario", "Ocaña"],
    "Magdalena": ["Santa Marta", "Ciénaga"],
    "Córdoba": ["Montería", "Cereté", "Lorica"],
    "Cesar": ["Valledupar", "Aguachica"],
};
export const CheckoutPage = ({ onNavigate, onOrderCompleted, }) => {
    const { items, subtotal, tax, shipping, total, clearCart } = useCart();
    const { currentUser } = useAuth();
    const [name, setName] = useState(currentUser?.name || "Beatriz Mendoza");
    const [email, setEmail] = useState(currentUser?.email || "beatriz.m@gmail.com");
    const [address, setAddress] = useState("Calle 15 #28-40, Barrio San Pedro");
    const [phone, setPhone] = useState("");
    const [department, setDepartment] = useState("Valle del Cauca");
    const [city, setCity] = useState("Palmira");
    const [paymentMethod, setPaymentMethod] = useState("card");
    const [isProcessing, setIsProcessing] = useState(false);
    // Datos simulados de tarjeta
    const [cardNumber, setCardNumber] = useState("4532 •••• •••• 8912");
    const [expiry, setExpiry] = useState("12 / 28");
    const [cvv, setCvv] = useState("892");
    // Lista de ciudades dinámicas según departamento
    const availableCities = departamentosColombia[department] || ["Ciudad Principal"];
    const handleDepartmentChange = (newDept) => {
        setDepartment(newDept);
        const cities = departamentosColombia[newDept] || [];
        if (cities.length > 0) {
            setCity(cities[0]);
        }
    };
    // Si no hay productos en el carrito
    if (items.length === 0) {
        return (<main className="checkout-main-1">
        <Icon name="cart" size={40} className="checkout-icon-1"/>
        <h2 className="checkout-h2-1">
          No tienes productos para finalizar compra
        </h2>
        <p className="checkout-p-1">
          Tu carrito está vacío. Agrega tus bicicletas o componentes favoritos antes de continuar.
        </p>
        <Button variant="primary" size="md" onClick={() => onNavigate("home")}>
          Ir al Catálogo
        </Button>
      </main>);
    }
    const handleCheckout = (e) => {
        e.preventDefault();
        setIsProcessing(true);
        setTimeout(() => {
            const newOrder = {
                id: generateOrderId(),
                customerName: name,
                email,
                address,
                phone,
                shipping,
                createdAt: new Date().toISOString(),
                city: `${city}, ${department}`,
                paymentMethod,
                items: items.map((i) => ({
                    id: i.id,
                    name: i.name,
                    price: i.price,
                    qty: i.qty,
                    image: i.image,
                    selectedSize: i.selectedSize,
                })),
                subtotal,
                tax,
                total,
                status: "Pagado",
                date: new Date().toLocaleString("es-CO"),
            };
            clearCart();
            setIsProcessing(false);
            onOrderCompleted(newOrder);
            onNavigate("success");
        }, 1200);
    };
    return (<main className="checkout-main-2">
      <div className="checkout-div-1">
        <span className="checkout-span-1">
          Paso Final · Despacho Seguro
        </span>
        <h1 className="checkout-h1-1">
          Finaliza tu Compra
        </h1>
        <p className="checkout-p-2">
          Entrega rápida a domicilio a nivel nacional y pago protegido con cifrado bancario.
        </p>
      </div>

      <div className="checkout-div-2">
        {/* Formulario de Checkout */}
        <form onSubmit={handleCheckout} className="checkout-form-1">
          {/* SECCIÓN 1: DATOS DE ENTREGA */}
          <section className="checkout-section-1">
            <span className="checkout-span-2">
              01
            </span>
            <h2 className="checkout-h2-2">
              Dirección de Despacho
            </h2>

            <div className="checkout-div-3">
              <Input label="Nombre Completo" required value={name} onChange={(e) => setName(e.target.value)}/>
              <Input label="Correo Electrónico" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}/>

              {/* Selector de Departamento */}
              <div className="checkout-div-4">
                <label className="checkout-label-1">
                  Departamento *
                </label>
                <select value={department} onChange={(e) => handleDepartmentChange(e.target.value)} className="checkout-select-1">
                  {Object.keys(departamentosColombia).map((dept) => (<option key={dept} value={dept}>
                      {dept}
                    </option>))}
                </select>
              </div>

              {/* Selector / Input de Ciudad con sugerencias */}
              <div className="checkout-div-4">
                <label className="checkout-label-1">
                  Ciudad o Municipio *
                </label>
                <input type="text" required list="ciudades-list" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Escribe o selecciona tu ciudad" className="checkout-input-1"/>
                <datalist id="ciudades-list">
                  {availableCities.map((c) => (<option key={c} value={c}/>))}
                </datalist>
                <span className="checkout-span-3">
                  Sugerencias para {department}: {availableCities.slice(0, 4).join(", ")}...
                </span>
              </div>

              <div className="checkout-div-5">
                <Input label="Dirección de Entrega Detallada" required placeholder="Calle, Carrera, Número, Conjunto o Apartamento" value={address} onChange={(e) => setAddress(e.target.value)}/>
              </div>

              <div className="checkout-div-5">
                <Input label="Teléfono Móvil de Contacto" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="300 000 0000"/>
              </div>
            </div>
          </section>

          {/* SECCIÓN 2: MÉTODO DE PAGO */}
          <section className="checkout-section-1">
            <span className="checkout-span-2">
              02
            </span>
            <h2 className="checkout-h2-2">
              Método de Pago
            </h2>

            {/* Pestañas de método */}
            <div className="checkout-div-6">
              <button type="button" onClick={() => setPaymentMethod("card")} className={`checkout-button-1 ${paymentMethod === "card"
            ? "checkout-button-2"
            : "checkout-button-3"}`}>
                <Icon name="shield" size={15}/> Tarjeta Débito / Crédito
              </button>

              <button type="button" onClick={() => setPaymentMethod("pse")} className={`checkout-button-1 ${paymentMethod === "pse"
            ? "checkout-button-2"
            : "checkout-button-3"}`}>
                <Icon name="check" size={15}/> Transferencia PSE
              </button>
            </div>

            {paymentMethod === "card" ? (<div className="checkout-div-7">
                <div className="checkout-div-8">
                  <Input label="Número de Tarjeta" required value={cardNumber} onChange={(e) => setCardNumber(e.target.value)}/>
                </div>
                <Input label="Vencimiento" required placeholder="MM / AA" value={expiry} onChange={(e) => setExpiry(e.target.value)}/>
                <Input label="CVV / CVC" required type="password" placeholder="•••" value={cvv} onChange={(e) => setCvv(e.target.value)}/>
                <div className="checkout-div-9">
                  <span className="checkout-span-4">
                    <Icon name="check" size={13}/> Pasarela Aprobada
                  </span>
                </div>
              </div>) : (<div className="checkout-div-10">
                <p className="checkout-p-3">
                  Serás redirigido a la pasarela segura de tu entidad bancaria (Bancolombia, Davivienda, Nequi, etc.) al confirmar el pago.
                </p>
                <div>
                  <label className="checkout-label-2">
                    Selecciona tu Banco:
                  </label>
                  <select className="checkout-select-2">
                    <option>Bancolombia</option>
                    <option>Davivienda</option>
                    <option>Nequi / Daviplata</option>
                    <option>Banco de Bogotá</option>
                  </select>
                </div>
              </div>)}

            <Button type="submit" variant="primary" size="lg" fullWidth className="checkout-button-4" disabled={isProcessing} icon={<Icon name="arrow" size={17}/>}>
              {isProcessing
            ? "Procesando Pago Seguro..."
            : `Confirmar y Pagar ${formatCOP(total)}`}
            </Button>
          </section>
        </form>

        {/* Resumen Lateral de los Productos Reales del Carrito */}
        <aside className="checkout-aside-1">
          <h3 className="checkout-h3-1">
            Tu Pedido ({items.length} {items.length === 1 ? "ítem" : "ítems"})
          </h3>

          <div className="checkout-div-11">
            {items.map((item) => (<div key={item.id} className="checkout-div-12">
                <img src={asset(item.image)} alt={item.name} className="checkout-img-1"/>
                <div className="checkout-div-13">
                  <h4 className="checkout-h4-1">
                    {item.name}
                  </h4>
                  <div className="checkout-div-14">
                    <span>Cant: {item.qty}</span>
                    {item.selectedSize && <span> · Talla: {item.selectedSize}</span>}
                  </div>
                  <span className="checkout-span-5">
                    {formatCOP(item.price * item.qty)}
                  </span>
                </div>
              </div>))}
          </div>

          <div className="checkout-div-15">
            <div className="checkout-div-16">
              <span className="checkout-p-3">Subtotal:</span>
              <span className="checkout-span-6">{formatCOP(subtotal)}</span>
            </div>
            <div className="checkout-div-16">
              <span className="checkout-p-3">Envío a domicilio:</span>
              <span className={`checkout-span-7 ${shipping === 0 ? "checkout-span-8" : "checkout-span-9"}`}>
                {shipping === 0 ? "Gratis" : formatCOP(shipping)}
              </span>
            </div>
            <div className="checkout-div-16">
              <span className="checkout-p-3">Impuestos (19% IVA):</span>
              <span className="checkout-p-3">{formatCOP(tax)}</span>
            </div>
            <div className="checkout-div-17">
              <span className="checkout-span-10">Total a Pagar:</span>
              <span className="checkout-span-11">
                {formatCOP(total)}
              </span>
            </div>
          </div>

          <div className="checkout-div-18">
            <Icon name="shield" size={16} className="checkout-icon-2"/>
            <span>Compra protegida y transacción respaldada con garantía oficial BikeStore.</span>
          </div>
        </aside>
      </div>
    </main>);
};
export default CheckoutPage;
