import React, { useState, useMemo } from "react";
import HeroBanner from "../components/HeroBanner";
import ProductCard from "../components/ProductCard";
import Icon from "../components/Icon";
import Button from "../components/Button";
import "../assets/styles.css";
export const HomePage = ({ products = [], error = "", onAddToCart, onSelectProduct, }) => {
    // Estados para filtros de CU-01
    const [selectedCategory, setSelectedCategory] = useState("Todas");
    const [selectedSection, setSelectedSection] = useState("Todas");
    const [sortOrder, setSortOrder] = useState("default");
    // Filtramos solo productos activos para el público (CU-01 alterno 2.2)
    const activeProducts = useMemo(() => {
        return products.filter((p) => p.status === "Activo");
    }, [products]);
    // División por secciones
    const categories = useMemo(() => [...new Set(activeProducts
        .filter((product) => selectedSection === "Todas" || product.section === selectedSection)
        .map((product) => product.category))].sort(), [activeProducts, selectedSection]);
    const filterAndSort = (section) => {
        let list = activeProducts.filter((product) =>
            product.section === section &&
            (selectedSection === "Todas" || product.section === selectedSection) &&
            (selectedCategory === "Todas" || product.category === selectedCategory));
        if (sortOrder === "asc") {
            list = [...list].sort((a, b) => Number(a.price) - Number(b.price));
        }
        else if (sortOrder === "desc") {
            list = [...list].sort((a, b) => Number(b.price) - Number(a.price));
        }
        return list;
    };
    const bikeProducts = useMemo(() => filterAndSort("Bicicletas"), [activeProducts, selectedCategory, selectedSection, sortOrder]);
    const gearProducts = useMemo(() => filterAndSort("Componentes"), [activeProducts, selectedCategory, selectedSection, sortOrder]);
    const accessoryProducts = useMemo(() => filterAndSort("Accesorios"), [activeProducts, selectedCategory, selectedSection, sortOrder]);
    const hasProducts = bikeProducts.length + gearProducts.length + accessoryProducts.length > 0;
    return (<main className="home-main-1">
      {/* Hero Principal */}
      <HeroBanner onExploreCatalog={() => {
            document.getElementById("bicicletas")?.scrollIntoView({ behavior: "smooth" });
        }}/>
      {error && <div className="catalog-error" role="alert">{error}</div>}

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

      {/* Filtros compartidos del catálogo (CU-01) */}
      <section id="bicicletas" className="home-section-1">
        <div className="home-div-5">
          <div>
            <span className="home-span-3">
              Catálogo BikeStore
            </span>
            <h2 className="home-h2-1">Catálogo de Productos</h2>
            <p className="home-p-1">
              Filtra por sección o categoría y ordena los productos por precio.
            </p>
          </div>

          <div className="home-div-6">
            <select value={selectedSection} onChange={(event) => {
              setSelectedSection(event.target.value);
              setSelectedCategory("Todas");
            }} className="home-select-1" aria-label="Filtrar por sección">
              <option value="Todas">Todas las secciones</option>
              <option value="Bicicletas">Bicicletas</option>
              <option value="Componentes">Componentes</option>
              <option value="Accesorios">Accesorios</option>
            </select>
            <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)} className="home-select-1" aria-label="Filtrar por categoría">
              <option value="Todas">Todas las categorías</option>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="home-select-1" aria-label="Ordenar productos">
              <option value="default">Ordenar por: Relevancia</option>
              <option value="asc">Precio: Menor a Mayor</option>
              <option value="desc">Precio: Mayor a Menor</option>
            </select>
          </div>
        </div>

        {!hasProducts && <div className="home-div-8">
          <Icon name="bike" size={40} className="home-icon-1"/>
          <h3 className="home-h3-1">{error ? "No hay productos disponibles por el momento" : "No se encontraron productos"}</h3>
          <Button variant="outline" size="sm" className="home-button-4" onClick={() => {
            setSelectedSection("Todas");
            setSelectedCategory("Todas");
            setSortOrder("default");
          }}>Restablecer Filtros</Button>
        </div>}
        {bikeProducts.length > 0 && <div className="home-div-9">
          {bikeProducts.map((product) => <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} onViewDetail={onSelectProduct}/>)}
        </div>}
      </section>

      {/* SECCIÓN 2: COMPONENTES */}
      {gearProducts.length > 0 && <section id="componentes" className="home-section-2">
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
      </section>}

      {/* SECCIÓN 3: ACCESORIOS */}
      {accessoryProducts.length > 0 && <section id="accesorios" className="home-section-3">
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
      </section>}
    </main>);
};
export default HomePage;
