import React, { useState, useEffect } from "react";
import Icon from "./Icon";
import Button from "./Button";
import Input from "./Input";
import "../assets/styles.css";

export const ProductFormModal = ({
  isOpen,
  onClose,
  productToEdit,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Montaña");
  const [section, setSection] = useState("Bicicletas");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState("/assets/products/img-005.jpg");
  const [badge, setBadge] = useState("");
  const [description, setDescription] = useState("");
  // Campo VARCHAR para Especificaciones Técnicas (CU-09 y CU-11)
  const [technicalSpecs, setTechnicalSpecs] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || "");
      setCategory(productToEdit.category || "Montaña");
      setSection(productToEdit.section || "Bicicletas");
      setPrice(String(productToEdit.price || ""));
      setStock(String(productToEdit.stock ?? ""));
      setImage(productToEdit.image || "/assets/products/img-005.jpg");
      setBadge(productToEdit.badge || "");
      setDescription(productToEdit.description || "");

      // Cargar especificaciones técnicas existentes (CU-11)
      if (productToEdit.technicalSpecs) {
        setTechnicalSpecs(productToEdit.technicalSpecs);
      } else if (typeof productToEdit.specs === "string") {
        setTechnicalSpecs(productToEdit.specs);
      } else if (productToEdit.specs && typeof productToEdit.specs === "object") {
        const formatted = Object.entries(productToEdit.specs)
          .map(([key, val]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${val}`)
          .join("\n");
        setTechnicalSpecs(formatted);
      } else {
        setTechnicalSpecs("");
      }
    } else {
      setName("");
      setCategory("Montaña");
      setSection("Bicicletas");
      setPrice("");
      setStock("10");
      setImage("/assets/products/img-005.jpg");
      setBadge("Nuevo");
      setDescription("");
      // Limpiar para registro nuevo (CU-09)
      setTechnicalSpecs("");
    }
    setError("");
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const numPrice = Number(price);
    const numStock = Number(stock);

    // Validaciones de CU-09 y CU-11
    if (!name.trim()) {
      setError("El nombre del producto es obligatorio.");
      return;
    }

    if (isNaN(numPrice) || numPrice <= 0) {
      setError("El precio debe ser un número mayor a 0 (CU-11 paso 4).");
      return;
    }

    if (isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
      setError("Las existencias deben ser un número entero mayor o igual a 0.");
      return;
    }

    onSave({
      id: productToEdit ? productToEdit.id : Date.now(),
      name: name.trim(),
      category: category.trim(),
      section,
      price: numPrice,
      stock: numStock,
      image,
      badge: badge ? badge.trim() : undefined,
      description: description.trim() || "Producto de alto rendimiento BikeStore.",
      // Guardar Especificaciones Técnicas como VARCHAR
      technicalSpecs: technicalSpecs.trim() || undefined,
      specs: technicalSpecs.trim()
        ? technicalSpecs.trim()
        : productToEdit?.specs || {
            material: "Aluminio / Carbono",
            garantia: "Garantía oficial BikeStore 2 años",
          },
      status: productToEdit?.status || "Activo",
    });

    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="product-form-modal-div-1"
      onClick={onClose}
    >
      <div
        className="product-form-modal-div-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="product-form-modal-div-3">
          <h3 className="product-form-modal-h3-1">
            {productToEdit
              ? "Actualizar Producto (CU-11)"
              : "Registrar Nuevo Producto (CU-09)"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="product-form-modal-button-1"
            aria-label="Cerrar modal"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="product-form-modal-form-1">
          {error && <div className="product-form-modal-div-4">{error}</div>}

          <Input
            label="Nombre del Producto"
            required
            placeholder="Ej. Trek Domane SL 6"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="product-form-modal-div-5">
            <div className="product-form-modal-div-6">
              <label className="product-form-modal-label-1">
                Sección Principal *
              </label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="product-form-modal-select-1"
              >
                <option value="Bicicletas">Bicicletas</option>
                <option value="Componentes">Componentes</option>
                <option value="Accesorios">Accesorios</option>
              </select>
            </div>

            <Input
              label="Categoría Específica"
              required
              placeholder="Ej. Montaña, Carretera, Transmisión..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div className="product-form-modal-div-7">
            <Input
              label="Precio en COP ($)"
              type="number"
              required
              min="1"
              placeholder="Ej. 3500000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <Input
              label="Existencias (Stock)"
              type="number"
              required
              min="0"
              placeholder="Ej. 10"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
            <Input
              label="Badge / Etiqueta"
              placeholder="Ej. Nuevo, Oferta..."
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
            />
          </div>

          <div className="product-form-modal-div-6">
            <label className="product-form-modal-label-1">
              Imagen de Muestra
            </label>
            <select
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="product-form-modal-select-1"
            >
              <option value="/assets/products/img-005.jpg">
                img-005 (Specialized Stumpjumper)
              </option>
              <option value="/assets/products/img-006.jpg">
                img-006 (Trek Émonda)
              </option>
              <option value="/assets/products/img-007.jpg">
                img-007 (Canyon Grizl)
              </option>
              <option value="/assets/products/img-008.jpg">
                img-008 (Cannondale Habit)
              </option>
              <option value="/assets/products/img-011.jpg">
                img-011 (Pedales Shimano XT)
              </option>
              <option value="/assets/products/img-018.jpg">
                img-018 (Casco Prevail)
              </option>
            </select>
          </div>

          <div className="product-form-modal-div-6">
            <label className="product-form-modal-label-1">
              Descripción Comercial
            </label>
            <textarea
              rows={3}
              placeholder="Descripción de materiales, tecnología y rendimiento..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="product-form-modal-textarea-1"
            />
          </div>

          {/* Campo VARCHAR Especificaciones Técnicas (CU-09 y CU-11) */}
          <div className="product-form-modal-div-6">
            <label className="product-form-modal-label-1">
              Especificaciones Técnicas
            </label>
            <textarea
              rows={3}
              placeholder="Detalles técnicos: material del marco, horquilla, transmisión, frenos, peso, garantía..."
              value={technicalSpecs}
              onChange={(e) => setTechnicalSpecs(e.target.value)}
              className="product-form-modal-textarea-1"
            />
          </div>

          <div className="product-form-modal-div-8">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {productToEdit ? "Guardar Cambios" : "Publicar Producto"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
