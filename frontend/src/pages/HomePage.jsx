import React, { useState, useMemo } from "react";
import HeroBanner from "../components/HeroBanner";
import ProductCard from "../components/ProductCard";
import Icon from "../components/Icon";
import Button from "../components/Button";
import "../assets/styles.css";
export const HomePage = ({ products, onAddToCart, onSelectProduct, }) => {
    // Estados para filtros de CU-01
    const [selectedCategory, setSelectedCategory] = useState("Todas");
    const [sortOrder, setSortOrder] = useState("default");
    // Filtramos solo productos activos para el público (CU-01 alterno 2.2)
    const activeProducts = useMemo(() => {
        return products.filter((p) => p.status === "Activo");
    }, [products]);
    // División por secciones
    const bikeProducts = useMemo(() => {
        let list = activeProducts.filter((p) => p.section === "Bicicletas");
        if (selectedCategory !== "Todas") {
            list = list.filter((p) => p.category === selectedCategory);
        }
        if (sortOrder === "asc") {
            list = [...list].sort((a, b) => a.price - b.price);
        }
        else if (sortOrder === "desc") {
            list = [...list].sort((a, b) => b.price - a.price);
        }
        return list;
    }, [activeProducts, selectedCategory, sortOrder]);
    const gearProducts = useMemo(() => activeProducts.filter((p) => p.section === "Componentes"), [activeProducts]);
    const accessoryProducts = useMemo(() => activeProducts.filter((p) => p.section === "Accesorios"), [activeProducts]);
    const bikeCategories = ["Todas", "Montaña", "Carretera / Ruta", "Gravel", "E-Bike"];
    return (<main className="home-main-1">
      {/* Hero Principal */}
      <HeroBanner onExploreCatalog={() => {
            document.getElementById("bicicletas")?.scrollIntoView({ behavior: "smooth" });
        }}/>

      {/* Franja de Beneficios y Garantías */}
      <div className="home-div-1">
        <div className="home-div-2">
          <span className="home-span-1">
            <Icon name="shield" size={26}/>
          </span>
          <div className="home-div-3">
            <b className="home-b-1">
              Compra 100% Protegida
            </b>
            <span className="home-span-2">
              Garantía oficial directa y factura legal Dian
            </span>
          </div>
        </div>

        <div className="home-div-2">
          <span className="home-span-1">
            <Icon name="cart" size={26}/>
          </span>
          <div className="home-div-3">
            <b className="home-b-1">
              Envío Nacional Sin Costo
            </b>
            <span className="home-span-2">
              Gratis en órdenes mayores a $300.000 COP
            </span>
          </div>
        </div>

        <div className="home-div-4">
          <span className="home-span-1">
            <Icon name="sparkles" size={26}/>
          </span>
          <div className="home-div-3">
            <b className="home-b-1">
              Productos 100% Originales
            </b>
            <span className="home-span-2">
              Marcas premium con respaldo oficial
            </span>
          </div>
        </div>
      </div>

      {/* SECCIÓN 1: BICICLETAS (Con Filtro por Categoría y Orden por Precio CU-01) */}
      <section id="bicicletas" className="home-section-1">
        <div className="home-div-5">
          <div>
            <span className="home-span-3">
              Catálogo Oficial 2026
            </span>
            <h2 className="home-h2-1">
              Bicicletas de Alto Rendimiento
            </h2>
            <p className="home-p-1">
              Máquinas diseñadas para competición, entrenamiento de fondo y aventuras gravel.
            </p>
          </div>

          {/* Controles de Filtro y Ordenamiento */}
          <div className="home-div-6">
            <div className="home-div-7">
              {bikeCategories.map((cat) => (<button key={cat} onClick={() => setSelectedCategory(cat)} className={`home-button-1 ${selectedCategory === cat
                ? "home-button-2"
                : "home-button-3"}`}>
                  {cat}
                </button>))}
            </div>

            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="home-select-1">
              <option value="default">Ordenar por: Relevancia</option>
              <option value="asc">Precio: Menor a Mayor</option>
              <option value="desc">Precio: Mayor a Menor</option>
            </select>
          </div>
        </div>

        {/* Grilla de Bicicletas */}
        {bikeProducts.length === 0 ? (<div className="home-div-8">
            <Icon name="bike" size={40} className="home-icon-1"/>
            <h3 className="home-h3-1">
              No hay bicicletas disponibles en esta categoría
            </h3>
            <p className="home-p-2">
              Prueba cambiando los filtros seleccionados o consulta nuestro catálogo completo.
            </p>
            <Button variant="outline" size="sm" className="home-button-4" onClick={() => {
                setSelectedCategory("Todas");
                setSortOrder("default");
            }}>
              Restablecer Filtros
            </Button>
          </div>) : (<div className="home-div-9">
            {bikeProducts.map((product) => (<ProductCard key={product.id} product={product} onAddToCart={onAddToCart} onViewDetail={onSelectProduct}/>))}
          </div>)}
      </section>

      {/* SECCIÓN 2: COMPONENTES */}
      <section id="componentes" className="home-section-2">
        <div className="home-div-10">
          <div>
            <span className="home-span-3">
              Precisión Mecánica
            </span>
            <h2 className="home-h2-1">
              Componentes & Transmisión
            </h2>
            <p className="home-p-1">
              Ruedas de carbono, bielas con potenciómetro y grupos electrónicos.
            </p>
          </div>
        </div>

        <div className="home-div-9">
          {gearProducts.map((product) => (<ProductCard key={product.id} product={product} onAddToCart={onAddToCart} onViewDetail={onSelectProduct}/>))}
        </div>
      </section>

      {/* SECCIÓN 3: ACCESORIOS */}
      <section id="accesorios" className="home-section-3">
        <div className="home-div-10">
          <div>
            <span className="home-span-3">
              Equipamiento & Seguridad
            </span>
            <h2 className="home-h2-1">
              Accesorios & Tecnología
            </h2>
            <p className="home-p-1">
              Cascos MIPS, ciclocomputadores GPS con carga solar y luces inteligentes.
            </p>
          </div>
        </div>

        <div className="home-div-9">
          {accessoryProducts.map((product) => (<ProductCard key={product.id} product={product} onAddToCart={onAddToCart} onViewDetail={onSelectProduct}/>))}
        </div>
      </section>
    </main>);
};
export default HomePage;
