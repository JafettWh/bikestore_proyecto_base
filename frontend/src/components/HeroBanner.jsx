import React, { useEffect, useState } from "react";
import Icon from "./Icon";
import Button from "./Button";
import { asset } from "../config/env";
import "../assets/styles.css";

const heroImages = [
    { src: "/assets/products/img-029.jpg", alt: "Ciclista de montaña en un sendero" },
    { src: "/assets/products/img-030.jpg", alt: "Bicicleta de montaña frente a las montañas" },
    { src: "/assets/products/img-031.jpg", alt: "Bicicleta de ruta de alto rendimiento" },
    { src: "/assets/products/img-033.jpg", alt: "Bicicleta lista para una ruta al aire libre" },
];

export const HeroBanner = ({ onExploreCatalog, }) => {
    const [activeImage, setActiveImage] = useState(0);
    const showPreviousImage = () => {
        setActiveImage((current) => (current - 1 + heroImages.length) % heroImages.length);
    };
    const showNextImage = () => {
        setActiveImage((current) => (current + 1) % heroImages.length);
    };

    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
        const interval = window.setInterval(() => {
            setActiveImage((current) => (current + 1) % heroImages.length);
        }, 7000);
        return () => window.clearInterval(interval);
    }, []);

    return (<section className="hero-banner-section-1">
      {heroImages.map((heroImage, index) => (
        <img
          key={heroImage.src}
          src={asset(heroImage.src)}
          alt={index === activeImage ? heroImage.alt : ""}
          aria-hidden={index !== activeImage}
          className={`hero-banner-img-1 ${index === activeImage ? "is-active" : ""}`}
        />
      ))}

      {/* Gradientes de sombra para contraste perfecto */}
      <div className="hero-banner-div-1"/>
      <div className="hero-banner-div-2"/>

      <button
        type="button"
        className="hero-banner-arrow hero-banner-arrow-previous"
        onClick={showPreviousImage}
        aria-label="Mostrar imagen anterior"
      >
        <Icon name="arrow-left" size={22}/>
      </button>
      <button
        type="button"
        className="hero-banner-arrow hero-banner-arrow-next"
        onClick={showNextImage}
        aria-label="Mostrar imagen siguiente"
      >
        <Icon name="arrow" size={22}/>
      </button>

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

      <div className="hero-banner-div-9" role="group" aria-label="Imágenes del banner">
        {heroImages.map((heroImage, index) => (
          <button
            key={heroImage.src}
            type="button"
            className={`hero-banner-button-2 ${index === activeImage ? "is-active" : ""}`}
            onClick={() => setActiveImage(index)}
            aria-label={`Mostrar imagen ${index + 1} de ${heroImages.length}`}
            aria-pressed={index === activeImage}
          />
        ))}
      </div>
    </section>);
};
export default HeroBanner;
