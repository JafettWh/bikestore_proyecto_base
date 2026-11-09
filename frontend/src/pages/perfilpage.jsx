import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { formatCOP } from "../utils/formatters";
import Icon from "../components/Icon";
import Button from "../components/Button";
import Input from "../components/Input";
import Badge from "../components/Badge";
import "../assets/styles.css";

// Departamentos y Ciudades de Colombia para selección dinámica
const departamentosColombia = {
  "Valle del Cauca": [
    "Palmira",
    "Cali",
    "Buga",
    "Tuluá",
    "Yumbo",
    "Jamundí",
    "Cartago",
    "Buenaventura",
  ],
  Antioquia: [
    "Medellín",
    "Envigado",
    "Rionegro",
    "Itagüí",
    "Bello",
    "Sabaneta",
    "La Ceja",
  ],
  "Bogotá D.C.": [
    "Bogotá D.C. (Usaquén)",
    "Bogotá D.C. (Chapinero)",
    "Bogotá D.C. (Suba)",
    "Bogotá D.C. (Teusaquillo)",
    "Bogotá D.C. (Fontibón)",
  ],
  Cundinamarca: [
    "Chía",
    "Cota",
    "Soacha",
    "Facatativá",
    "Zipaquirá",
    "Fusagasugá",
  ],
  Santander: [
    "Bucaramanga",
    "Floridablanca",
    "Girón",
    "Piedecuesta",
    "Barrancabermeja",
  ],
  Atlántico: ["Barranquilla", "Soledad", "Malambo", "Puerto Colombia"],
  Risaralda: ["Pereira", "Dosquebradas", "Santa Rosa de Cabal"],
  Caldas: ["Manizales", "Villamaría", "Chinchiná"],
  Quindío: ["Armenia", "Calarcá", "Circasia", "Montenegro"],
  Bolívar: ["Cartagena", "Turbaco", "Magangué"],
};

export const PerfilPage = ({ onNavigate, orders = [] }) => {
  const { currentUser, updateProfile } = useAuth();

  // Modo edición vs visualización
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Datos del formulario de perfil
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");

  // Carga inicial de datos del cliente actual
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setEmail(currentUser.email || "");
      setPhone(currentUser.phone || "");
      setDepartment(currentUser.department || "");
      setCity(currentUser.city || "");
      setAddress(currentUser.address || "");
      setNeighborhood(currentUser.neighborhood || "");
    }
  }, [currentUser]);

  // Manejador de cambio de departamento
  const handleDepartmentChange = (newDept) => {
    setDepartment(newDept);
    setCity("");
  };

  // Restaurar datos originales al cancelar edición
  const handleCancelEdit = () => {
    if (currentUser) {
      setName(currentUser.name || "");
      setEmail(currentUser.email || "");
      setPhone(currentUser.phone || "");
      setDepartment(currentUser.department || "");
      setCity(currentUser.city || "");
      setAddress(currentUser.address || "");
      setNeighborhood(currentUser.neighborhood || "");
    }
    setErrorMessage("");
    setIsEditing(false);
  };

  // Guardar cambios en el perfil del cliente
  const handleSaveChanges = async (e) => {
    e?.preventDefault();
    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("El nombre completo es un campo obligatorio.");
      return;
    }
    if (!email.trim()) {
      setErrorMessage("El correo electrónico es un campo obligatorio.");
      return;
    }

    const updatedData = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      department,
      city,
      address: address.trim(),
      neighborhood: neighborhood.trim(),
    };

    const result = await updateProfile(updatedData);
    if (!result.success) {
      setErrorMessage(result.message);
      return;
    }

    setSaveSuccess(true);
    setIsEditing(false);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 4000);
  };

  // Pedidos del cliente
  const userOrders = orders.filter(
    (o) =>
      o.email?.toLowerCase() === (currentUser?.email || email).toLowerCase() ||
      o.customerName?.toLowerCase() === (currentUser?.name || name).toLowerCase()
  );

  const initials = (name || "BS")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <main className="perfil-page-container">
      {/* Miga de Pan (Breadcrumb) */}
      <div className="perfil-breadcrumb">
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="hover:text-black transition-colors"
        >
          Inicio
        </button>
        <span>/</span>
        <span className="font-semibold text-neutral-900">Mi Perfil</span>
      </div>

      {/* Alerta de Éxito al Guardar */}
      {saveSuccess && (
        <div className="perfil-alert-success animate-fade-in">
          <Icon name="check" size={18} />
          <span>¡Datos de perfil actualizados exitosamente en BikeStore!</span>
        </div>
      )}

      {/* Alerta de Error */}
      {errorMessage && (
        <div className="perfil-alert-error animate-fade-in">
          <Icon name="alert-triangle" size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Cabecera / Tarjeta Principal del Perfil */}
      <section className="perfil-hero-card">
        <div className="perfil-hero-left">
          <div className="perfil-avatar">
            <span>{initials}</span>
          </div>
          <div className="perfil-hero-info">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="perfil-tag">Cliente Registrado</span>
              <Badge variant={currentUser?.status === "Inactivo" ? "red" : "green"}>
                {currentUser?.status || "Activo"}
              </Badge>
              <Badge variant="yellow">
                {currentUser?.role === "admin" ? "Administrador" : "Cliente Preferencial"}
              </Badge>
            </div>
            <h1 className="perfil-title">{name}</h1>
            <p className="perfil-subtitle">
              <Icon name="mail" size={14} /> {email} ·{" "}
              <Icon name="phone" size={14} /> {phone || "Sin teléfono"}
            </p>
          </div>
        </div>

        {!isEditing && (
          <div className="perfil-hero-actions">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => setIsEditing(true)}
              icon={<Icon name="edit" size={16} />}
              iconPosition="left"
            >
              Editar Perfil
            </Button>
        </div>
      )}
      </section>

      {/* Grid de Formulario / Información Detallada */}
      <div className="perfil-grid">
        {/* Columna Principal: Datos del Cliente */}
        <div className="perfil-main-col">
          <form onSubmit={handleSaveChanges} className="perfil-form-card">
            <div className="perfil-card-header">
              <div className="flex items-center gap-2">
                <Icon name="user" size={18} />
                <h3 className="perfil-section-title">Información Personal</h3>
              </div>
              {isEditing ? (
                <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-1 rounded">
                  Modo Edición Activado
                </span>
              ) : (
                <span className="text-xs text-neutral-400">Solo Lectura</span>
              )}
            </div>

            <div className="perfil-fields-grid">
              <div>
                <Input
                  label="Nombre Completo"
                  required
                  placeholder="Tu nombre completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <Input
                  label="Correo Electrónico"
                  type="email"
                  required
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <Input
                  label="Teléfono Móvil / WhatsApp"
                  placeholder="Teléfono móvil"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isEditing}
                  icon={<Icon name="phone" size={16} />}
                />
              </div>
            </div>

            <div className="perfil-divider" />

            {/* SECCIÓN 2: DIRECCIÓN Y DESPACHOS */}
            <div className="perfil-card-header">
              <div className="flex items-center gap-2">
                <Icon name="bike" size={18} />
                <h3 className="perfil-section-title">
                  Dirección de Entrega y Despachos
                </h3>
              </div>
            </div>

            <div className="perfil-fields-grid">
              <div className="perfil-field-group">
                <label className="perfil-field-label">Departamento *</label>
                <select
                  value={department}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  disabled={!isEditing}
                  className="perfil-select"
                >
                  <option value="">Selecciona un departamento</option>
                  {Object.keys(departamentosColombia).map((dep) => (
                    <option key={dep} value={dep}>
                      {dep}
                    </option>
                  ))}
                </select>
              </div>

              <div className="perfil-field-group">
                <label className="perfil-field-label">Ciudad / Municipio *</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={!isEditing}
                  className="perfil-select"
                >
                  <option value="">Selecciona una ciudad</option>
                  {(departamentosColombia[department] || []).map(
                    (c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="col-span-full">
                <Input
                  label="Dirección Principal"
                  placeholder="Ej. Calle 15 #28-40, Barrio San Pedro"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="col-span-full">
                <Input
                  label="Barrio / Apartamento / Indicaciones de Entrega"
                  placeholder="Ej. Apto 402, Torre B, frente al parque"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Botones de acción en modo edición */}
            {isEditing && (
              <div className="perfil-form-actions">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                >
                  Descartar Cambios
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  icon={<Icon name="check" size={16} />}
                  iconPosition="left"
                >
                  Guardar Cambios
                </Button>
              </div>
            )}
          </form>
        </div>

        {/* Columna Lateral: Resumen de Seguridad y Estado */}
        <div className="perfil-sidebar-col">
          {/* Tarjeta de Seguridad y Garantía */}
          <div className="perfil-side-card">
            <h4 className="perfil-side-title">Garantía BikeStore</h4>
            <p className="perfil-side-text">
              Tu cuenta cuenta con respaldo oficial para gestión de garantías en
              marcas Specialized, Trek, SRAM y Shimano.
            </p>
            <div className="perfil-feature-list">
              <div className="perfil-feature-item">
                <Icon name="shield" size={16} className="text-[#ffd400]" />
                <span>Facturación electrónica DIAN vinculada</span>
              </div>
              <div className="perfil-feature-item">
                <Icon name="check" size={16} className="text-emerald-500" />
                <span>Despachos asegurados a nivel nacional</span>
              </div>
              <div className="perfil-feature-item">
                <Icon name="clock" size={16} className="text-[#ffd400]" />
                <span>Historial sincronizado en tiempo real</span>
              </div>
            </div>
          </div>

          {/* Tarjeta de Resumen de Pedidos */}
          <div className="perfil-side-card">
            <div className="flex items-center justify-between mb-3">
              <h4 className="perfil-side-title">Mis Pedidos Recientes</h4>
              <Badge variant="yellow">{userOrders.length}</Badge>
            </div>

            {userOrders.length > 0 ? (
              <div className="space-y-3">
                {userOrders.slice(0, 3).map((order) => (
                  <div key={order.id} className="perfil-order-snippet">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{order.id}</span>
                      <Badge variant="green">{order.status}</Badge>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      {order.date || "Fecha reciente"} · {order.items?.length || 1} producto(s)
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100">
                      <span className="text-[10px] uppercase text-neutral-400 font-bold">
                        Total Pagado:
                      </span>
                      <strong className="text-xs text-neutral-900">
                        {formatCOP(order.total || 0)}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="perfil-orders-empty">
                <Icon name="cart" size={24} className="text-neutral-300" />
                <p>No tienes pedidos activos en este momento.</p>
                <button
                  type="button"
                  onClick={() => onNavigate("home")}
                  className="perfil-empty-link"
                >
                  Explorar bicicletas en catálogo →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default PerfilPage;
