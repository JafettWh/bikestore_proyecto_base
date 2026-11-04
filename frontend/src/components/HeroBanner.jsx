import React from "react";
import Icon from "./Icon";
import Button from "./Button";
import { asset } from "../config/env";
import "../assets/styles.css";
export const HeroBanner = ({ onExploreCatalog, }) => {
    return (<section className="hero-banner-section-1">
      {/* Imagen de fondo con gradientes deportivos */}
      <img src={asset("/assets/products/img-029.jpg")} alt="Ciclista de montaña en sendero" className="hero-banner-img-1 animate-fade-in"/>

      {/* Gradientes de sombra para contraste perfecto */}
      <div className="hero-banner-div-1"/>
      <div className="hero-banner-div-2"/>

      {/* Contenido Hero */}
      <div className="hero-banner-div-3">
        <div className="hero-banner-div-4">
          <div className="hero-banner-div-5">
            <span className="hero-banner-span-1"/>
            Temporada Oficial 2026 · BikeStore Colombia
          </div>

          <h1 className="hero-banner-h1-1">
            DOMINA <br />
            <span className="hero-banner-span-2">CUALQUIER</span> <br />
            <span className="hero-banner-span-3">TERRENO.</span>
          </h1>

          <p className="hero-banner-p-1">
            Ingeniería de montaña de fibra de carbono, aerodinámica pura de carretera y tecnología eléctrica para ciclistas que nunca se detienen.
          </p>

          <div className="hero-banner-div-6">
            <Button variant="primary" size="lg" onClick={onExploreCatalog} icon={<Icon name="arrow" size={17}/>}>
              Explorar Catálogo
            </Button>
          </div>
        </div>
      </div>

      {/* Tarjeta de Estadísticas / Garantías en la esquina inferior derecha */}
      <div className="hero-banner-div-7">
        <div className="hero-banner-div-8">
          <span className="hero-banner-span-4">
            100%
          </span>
          <span className="hero-banner-span-5">
            Original Garantizado
          </span>
        </div>
        <div className="hero-banner-div-8">
          <span className="hero-banner-span-4">
            3-5 Días
          </span>
          <span className="hero-banner-span-5">
            Envío Nacional
          </span>
        </div>
      </div>
    </section>);
};
export default HeroBanner;
