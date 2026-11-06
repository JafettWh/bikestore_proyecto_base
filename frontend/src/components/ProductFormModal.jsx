import React, { useState, useEffect } from "react";
import Icon from "./Icon";
import Button from "./Button";
import Input from "./Input";
import "../assets/styles.css";

const categoriesBySection = {
  Bicicletas: ["Montaña", "Carretera / Ruta", "Carretera / Endurance", "Gravel", "E-Bike"],
  Componentes: ["Transmisión", "Bielas", "Ruedas", "Asiento", "Manubrio", "Cassette"],
  Accesorios: ["Iluminación", "Protección", "Hidratación", "Tecnología", "Herramientas", "Sensores"],
};

export const ProductFormModal = ({
  isOpen,
  onClose,
  productToEdit,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [section, setSection] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [sizes, setSizes] = useState("");
  const [badge, setBadge] = useState("");
  const [description, setDescription] = useState("");
  // Especificaciones técnicas del producto
  const [technicalSpecs, setTechnicalSpecs] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || "");
      setCategory(productToEdit.category || "");
      setSection(productToEdit.section || "");
      setPrice(String(productToEdit.price || ""));
      setStock(String(productToEdit.stock ?? ""));
      setImage(productToEdit.image || "");
      setImageFile(null);
      setSizes(Array.isArray(productToEdit.sizes) ? productToEdit.sizes.join(", ") : "");
      setBadge(productToEdit.badge || "");
      setDescription(productToEdit.description || "");

      // Cargar especificaciones técnicas existentes (CU-11)
      const currentSpecs = productToEdit.technicalSpecs || productToEdit.specs;
      if (typeof currentSpecs === "string") {
        setTechnicalSpecs(currentSpecs);
      } else if (currentSpecs && typeof currentSpecs === "object") {
        const formatted = Object.entries(currentSpecs)
          .map(([key, val]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${val}`)
          .join("\n");
        setTechnicalSpecs(formatted);
      } else {
        setTechnicalSpecs("");
      }
    } else {
      setName("");
      setCategory("");
      setSection("");
      setPrice("");
      setStock("");
      setImage("");
      setImageFile(null);
      setSizes("");
      setBadge("");
      setDescription("");
      // Limpiar para registro nuevo (CU-09)
      setTechnicalSpecs("");
    }
    setError("");
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numPrice = Number(price);
    const numStock = Number(stock);
    const productSizes = [...new Set(sizes.split(/[,\n]/).map((size) => size.trim()).filter(Boolean))];

    // Validaciones de CU-09 y CU-11
    if (!name.trim()) {
      setError("El nombre del producto es obligatorio.");
      return;
    }

    if (isNaN(numPrice) || numPrice <= 0) {
      setError("El precio debe ser un número mayor a 0.");
      return;
    }

    if (isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
      setError("Las existencias deben ser un número entero mayor o igual a 0.");
      return;
    }
    if (!image && !imageFile) {
      setError("Selecciona una imagen del producto.");
      return;
    }

    if (!description.trim()) {
      setError("La descripción del producto es obligatoria.");
      return;
    }
    try {
      await onSave({
        id: productToEdit?.id,
        name: name.trim(),
        category: category.trim(),
        section,
        price: numPrice,
        stock: numStock,
        image,
        imageFile,
        sizes: productSizes,
        badge: badge.trim() || undefined,
        description: description.trim(),
        technicalSpecs: technicalSpecs.trim() || undefined,
        specs: technicalSpecs.trim() || productToEdit?.specs,
        status: productToEdit?.status || "Activo",
      });
      onClose();
    } catch (saveError) {
      setError(saveError.message || "No fue posible guardar el producto.");
    }
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
              ? "Actualizar Producto"
              : "Registrar Nuevo Producto"}
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
                onChange={(e) => {
                  setSection(e.target.value);
                  setCategory("");
                }}
                className="product-form-modal-select-1"
              >
                <option value="">Selecciona una sección</option>
                <option value="Bicicletas">Bicicletas</option>
                <option value="Componentes">Componentes</option>
                <option value="Accesorios">Accesorios</option>
              </select>
            </div>

            <div className="product-form-modal-div-6">
              <label className="product-form-modal-label-1" htmlFor="product-category">Categoría Específica *</label>
              <select id="product-category" required value={category} onChange={(e) => setCategory(e.target.value)} className="product-form-modal-select-1">
                <option value="">Selecciona una categoría</option>
                {(categoriesBySection[section] || []).map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
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
              label="Etiqueta"
              placeholder="Ej. Nuevo, Oferta..."
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
            />
          </div>

          <Input
            label="Tallas disponibles"
            placeholder="Ej. S, M, L o 52, 54 (separadas por coma)"
            value={sizes}
            onChange={(e) => setSizes(e.target.value)}
          />

          <div className="product-form-modal-div-6">
            <label className="product-form-modal-label-1">
              Imagen de Muestra
            </label>
            <select
              value={image}
              onChange={(e) => {
                setImage(e.target.value);
                setImageFile(null);
              }}
              className="product-form-modal-select-1"
            >
              <option value="">Selecciona una imagen</option>
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
            <label className="product-form-modal-label-1" htmlFor="product-image-file">O carga una imagen JPG, PNG o WEBP (máximo 20 MB)</label>
            <input id="product-image-file" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => {
              const file = event.target.files?.[0] || null;
              if (file && (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 20 * 1024 * 1024)) {
                setError("Selecciona una imagen JPG, PNG o WEBP de máximo 20 MB.");
                setImageFile(null);
                event.target.value = "";
                return;
              }
              setImageFile(file);
              setError("");
            }} />
          </div>

          <div className="product-form-modal-div-9">
            <div className="product-form-modal-div-6">
              <label className="product-form-modal-label-1">
                Descripción Comercial
              </label>
              <textarea
                rows={2}
                placeholder="Descripción de materiales, tecnología y rendimiento..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="product-form-modal-textarea-1"
              />
            </div>

            <div className="product-form-modal-div-6">
              <label className="product-form-modal-label-1">
                Especificaciones Técnicas
              </label>
              <textarea
                rows={2}
                placeholder="Detalles técnicos: material del marco, horquilla, transmisión, frenos, peso, garantía..."
                value={technicalSpecs}
                onChange={(e) => setTechnicalSpecs(e.target.value)}
                className="product-form-modal-textarea-1"
              />
            </div>
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
