import React, { useState, useEffect, useRef } from "react";
import Icon from "./Icon";
import Button from "./Button";
import Input from "./Input";
import { useAuth } from "../hooks/useAuth";
import { apiRequest } from "../utils/api";
import { asset } from "../config/env";
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
  const [gallery, setGallery] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [availableImages, setAvailableImages] = useState([]);
  const [imagesLoadError, setImagesLoadError] = useState("");
  const [sizes, setSizes] = useState("");
  const [etiqueta, setEtiqueta] = useState("");
  const [description, setDescription] = useState("");
  // Especificaciones técnicas del producto
  const [technicalSpecs, setTechnicalSpecs] = useState("");
  const [error, setError] = useState("");
  const { token } = useAuth();

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    apiRequest("/products/images", { token })
      .then(({ data }) => {
        if (active) {
          setAvailableImages(data);
          setImagesLoadError("");
        }
      })
      .catch(() => {
        if (active) {
          setAvailableImages([]);
          setImagesLoadError("No se pudieron cargar las imágenes guardadas. Aún puedes subir archivos nuevos.");
        }
      });
    return () => { active = false; };
  }, [isOpen, token]);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || "");
      setCategory(productToEdit.category || "");
      setSection(productToEdit.section || "");
      setPrice(String(productToEdit.price || ""));
      setStock(String(productToEdit.stock ?? ""));
      setImage(productToEdit.image || "");
      setGallery(Array.isArray(productToEdit.gallery) ? productToEdit.gallery : []);
      setImageFiles([]);
      setSizes(Array.isArray(productToEdit.sizes) ? productToEdit.sizes.join(", ") : "");
      setEtiqueta(productToEdit.etiqueta || "");
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
      setGallery([]);
      setImageFiles([]);
      setSizes("");
      setEtiqueta("");
      setDescription("");
      // Limpiar para registro nuevo (CU-09)
      setTechnicalSpecs("");
    }
    setError("");
  }, [productToEdit, isOpen]);

  const fileInputRef = useRef(null);
  useEffect(() => {
    const previews = imageFiles.map((file) => ({ name: file.name, url: URL.createObjectURL(file) }));
    setFilePreviews(previews);
    return () => previews.forEach(({ url }) => URL.revokeObjectURL(url));
  }, [imageFiles]);

  const imageOptions = [...new Map([
    ...availableImages,
    ...(productToEdit?.image ? [{ url: productToEdit.image, name: productToEdit.image.split("/").pop() }] : []),
    ...(productToEdit?.gallery || []).map((url) => ({ url, name: url.split("/").pop() })),
  ].map((option) => [option.url, option])).values()];

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
    if (!image && !imageFiles.length) {
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
        gallery: [...new Set([
          ...gallery,
          ...(productToEdit?.image && productToEdit.image !== image ? [productToEdit.image] : []),
        ])].filter((url) => url !== image),
        imageFiles,
        sizes: productSizes,
        etiqueta: etiqueta.trim() || undefined,
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
              value={etiqueta}
              onChange={(e) => setEtiqueta(e.target.value)}
            />
          </div>

          <Input
            label="Tallas disponibles"
            placeholder="Ej. S, M, L o 52, 54 (separadas por coma)"
            value={sizes}
            onChange={(e) => setSizes(e.target.value)}
          />

          <div className="product-form-modal-div-6">
            <label className="product-form-modal-label-1" htmlFor="product-main-image">
              Imagen principal del producto
            </label>
            <select id="product-main-image" value={image} onChange={(e) => {
              setImage(e.target.value);
              setGallery((selected) => selected.filter((url) => url !== e.target.value));
            }} className="product-form-modal-select-1">
              <option value="">Selecciona una imagen guardada</option>
              {imageOptions.map((option) => (
                <option key={option.url} value={option.url}>{option.name}</option>
              ))}
            </select>

            {(image || filePreviews.length > 0) && (
              <div className="product-form-image-preview">
                <img
                  src={image ? asset(image) : filePreviews[0].url}
                  alt="Vista previa de la imagen principal"
                />
                <div>
                  <strong>Vista previa de imagen principal</strong>
                  <span>{image || `${filePreviews[0]?.name} (se usará como principal al guardar)`}</span>
                </div>
              </div>
            )}

            <div className="product-form-gallery">
              <div className="product-form-gallery-heading">
                <label className="product-form-modal-label-1">
                  Galería adicional guardada
                </label>
                <span>{gallery.filter((url) => url !== image).length} seleccionada(s)</span>
              </div>
              {imagesLoadError && <p className="product-form-image-notice" role="status">{imagesLoadError}</p>}
              {imageOptions.length ? (
                <div className="product-form-image-grid">
                  {imageOptions.map((option) => (
                    <label className="product-form-image-option" key={option.url}>
                      <input
                        type="checkbox"
                        checked={gallery.includes(option.url) && option.url !== image}
                        disabled={option.url === image}
                        onChange={(event) => setGallery((selected) => (
                          event.target.checked
                            ? [...new Set([...selected, option.url])]
                            : selected.filter((url) => url !== option.url)
                        ))}
                      />
                      <img src={asset(option.url)} alt="" />
                      <span>{option.name}{option.url === image ? " · Principal" : ""}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="product-form-image-notice">No hay imágenes guardadas disponibles. Puedes subir archivos nuevos.</p>
              )}
              <p className="product-form-image-notice">
                Las imágenes guardadas se reutilizan desde <code>frontend/public/assets/products</code> o <code>backend/uploads</code>. Al guardar, la ruta principal queda vinculada al producto y las adicionales a su galería en la base de datos.
              </p>
            </div>

            <label className="product-form-modal-label-1" htmlFor="product-image-file">
              Subir imágenes nuevas (JPG, PNG o WEBP; hasta 10 archivos de 20 MB cada uno)
            </label>
            <input ref={fileInputRef} id="product-image-file" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => {
              const files = Array.from(event.target.files || []);
              if (files.length > 10 || files.some((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 20 * 1024 * 1024)) {
                setError("Selecciona hasta 10 imágenes JPG, PNG o WEBP de máximo 20 MB cada una.");
                setImageFiles([]);
                event.target.value = "";
                return;
              }
              setImageFiles(files);
              setError("");
            }} />
            {filePreviews.length > 0 && (
              <>
                <p className="product-form-image-notice">
                  {image ? "Los archivos nuevos se agregarán como imágenes adicionales." : "El primer archivo será la imagen principal; los demás se agregarán a la galería."}
                  {" "}Al guardar, los archivos se almacenan en <code>backend/uploads</code> y sus rutas quedan vinculadas al producto.
                </p>
                <div className="product-form-image-grid">
                  {filePreviews.map((preview, index) => (
                    <div className="product-form-image-option product-form-image-upload" key={`${preview.name}-${index}`}>
                      <img src={preview.url} alt={`Vista previa de ${preview.name}`} />
                      <span>{preview.name}{!image && index === 0 ? " · Principal al guardar" : " · Nueva"}</span>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="product-form-clear-images"
                  onClick={() => {
                    setImageFiles([]);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  Quitar archivos seleccionados
                </button>
              </>
            )}
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
