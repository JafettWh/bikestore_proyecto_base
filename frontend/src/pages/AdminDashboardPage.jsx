import React, { useState, useMemo } from "react";
import { exportReport, salesSummary } from "../utils/documents";
import { useAuth } from "../hooks/useAuth";
import { formatCOP } from "../utils/formatters";
import Logo from "../components/Logo";
import Icon from "../components/Icon";
import Badge from "../components/Badge";
import Button from "../components/Button";
import MetricCard from "../components/MetricCard";
import ProductFormModal from "../components/ProductFormModal";
import ProductDeactivateModal from "../components/ProductDeactivateModal";
import UserFormModal from "../components/UserFormModal";
import { asset } from "../config/env";
import "../assets/styles.css";
export const AdminDashboardPage = ({ products = [], orders = [], onNavigate, onSaveProduct, onDeactivateProduct, }) => {
    const { users = [], currentUser, logout, addUser, updateUser, deactivateUser, } = useAuth();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [productSearch, setProductSearch] = useState("");
    const [productCategoryFilter, setProductCategoryFilter] = useState("Todas");
    const [userSearch, setUserSearch] = useState("");
    const [salesChartView, setSalesChartView] = useState("days");
    const [salesChartYear, setSalesChartYear] = useState(new Date().getFullYear());
    const [salesChartMonth, setSalesChartMonth] = useState(new Date().getMonth());
    const [salesCategory, setSalesCategory] = useState("Todas");
    // Modales de productos
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState(null);
    const [productToDeactivate, setProductToDeactivate] = useState(null);
    // Modales de usuarios
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);
    // Alerta temporal
    const [adminNotice, setAdminNotice] = useState("");
    const [isExporting, setIsExporting] = useState(false);
    const summary = useMemo(() => salesSummary(orders), [orders]);
    const monthOptions = useMemo(() => Array.from({ length: 12 }, (_, month) => ({
        value: month,
        label: new Intl.DateTimeFormat("es-CO", { month: "long" }).format(new Date(2024, month, 1)),
        shortLabel: new Intl.DateTimeFormat("es-CO", {
            month: "short",
        })
            .format(new Date(2024, month, 1))
            .replace(".", ""),
    })), []);
    const salesYears = useMemo(() => Array.from(new Set([
        new Date().getFullYear(),
        ...orders
            .map((order) => new Date(order.createdAt || "").getFullYear())
            .filter((year) => !Number.isNaN(year)),
    ])).sort((a, b) => b - a), [orders]);
    const productSectionById = useMemo(() => new Map(products.map((product) => [product.id, product.section])), [products]);
    const salesChartData = useMemo(() => {
        const pointCount = salesChartView === "days"
            ? new Date(salesChartYear, salesChartMonth + 1, 0).getDate()
            : 12;
        return Array.from({ length: pointCount }, (_, index) => {
            const total = orders.reduce((sum, order) => {
                const orderDate = new Date(order.createdAt || "");
                const matchesPeriod = orderDate.getFullYear() === salesChartYear &&
                    (salesChartView === "months" ||
                        orderDate.getMonth() === salesChartMonth) &&
                    (salesChartView === "days"
                        ? orderDate.getDate() === index + 1
                        : orderDate.getMonth() === index);
                if (!matchesPeriod)
                    return sum;
                return (sum +
                    order.items.reduce((itemSum, item) => {
                        const matchesCategory = salesCategory === "Todas" ||
                            productSectionById.get(item.id) === salesCategory;
                        return matchesCategory ? itemSum + item.price * item.qty : itemSum;
                    }, 0));
            }, 0);
            return {
                label: salesChartView === "days"
                    ? String(index + 1)
                    : monthOptions[index].shortLabel,
                total,
            };
        });
    }, [
        monthOptions,
        orders,
        productSectionById,
        salesCategory,
        salesChartMonth,
        salesChartView,
        salesChartYear,
    ]);
    const maxChartSales = Math.max(1, ...salesChartData.map((point) => point.total));
    const showNotice = (msg) => {
        setAdminNotice(msg);
        setTimeout(() => setAdminNotice(""), 3500);
    };
    const handleLogout = () => {
        logout();
        onNavigate("home");
    };
    // Filtrado de productos
    const filteredProducts = useMemo(() => {
        const list = products || [];
        return list.filter((p) => {
            const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                p.category.toLowerCase().includes(productSearch.toLowerCase());
            const matchesCategory = productCategoryFilter === "Todas" || p.section === productCategoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [products, productSearch, productCategoryFilter]);
    // Filtrado de usuarios
    const filteredUsers = useMemo(() => {
        const list = users || [];
        return list.filter((u) => (u.name && u.name.toLowerCase().includes(userSearch.toLowerCase())) ||
            (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase())) ||
            (u.role && u.role.toLowerCase().includes(userSearch.toLowerCase())));
    }, [users, userSearch]);
    const handleExportReport = async (format) => {
        setIsExporting(true);
        try {
            await exportReport(format, orders, products, users);
            showNotice(`Informe ${format} generado. Descarga iniciada.`);
        }
        catch {
            showNotice("No se pudo generar el informe. Intenta nuevamente.");
        }
        finally {
            setIsExporting(false);
        }
    };
    const safeUsers = users || [];
    return (<div className="admin-dashboard-div-1">
      {/* SIDEBAR ADMINISTRATIVO CORREGIDO */}
      <aside className="admin-dashboard-aside-1">
        <div className="admin-dashboard-div-2">
          {/* Cabecera con Logo */}
          <div className="admin-dashboard-div-3">
            <Logo onClick={() => onNavigate("home")} size="md"/>
            <span className="admin-dashboard-span-1">
              Panel de Administración
            </span>
          </div>

          {/* Menú de Navegación Vertical */}
          <nav className="admin-dashboard-nav-1">
            <button type="button" onClick={() => setActiveTab("dashboard")} className={`admin-dashboard-button-1 ${activeTab === "dashboard"
            ? "admin-dashboard-button-2"
            : "admin-dashboard-button-3"}`}>
              <Icon name="sparkles" size={17}/> Resumen & Métricas
            </button>

            <button type="button" onClick={() => setActiveTab("products")} className={`admin-dashboard-button-1 ${activeTab === "products"
            ? "admin-dashboard-button-2"
            : "admin-dashboard-button-3"}`}>
              <Icon name="bike" size={17}/> Gestión de Productos
            </button>

            <button type="button" onClick={() => setActiveTab("users")} className={`admin-dashboard-button-1 ${activeTab === "users"
            ? "admin-dashboard-button-2"
            : "admin-dashboard-button-3"}`}>
              <Icon name="user" size={17}/> Administrar Usuarios
            </button>
          </nav>
        </div>

        {/* Sección de Usuario y Sesión */}
        <div className="admin-dashboard-div-4">
          <div className="admin-dashboard-div-5">
            <span className="admin-dashboard-span-2">
              {currentUser?.name
            ? currentUser.name.charAt(0).toUpperCase()
            : "A"}
            </span>
            <div className="admin-dashboard-div-6">
              <span className="admin-dashboard-span-3">
                {currentUser?.name || "Administrador BikeStore"}
              </span>
              <span className="admin-dashboard-span-4">
                {currentUser?.role || "Administrador"}
              </span>
            </div>
          </div>

          <div className="admin-dashboard-nav-1">
            <button type="button" onClick={() => onNavigate("home")} className="admin-dashboard-button-4">
              <Icon name="arrow-left" size={13}/> Volver a la Tienda
            </button>
            <button type="button" onClick={handleLogout} className="admin-dashboard-button-5">
              <Icon name="logout" size={13}/> Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="admin-dashboard-main-1">
        <div className="admin-dashboard-div-7">
          <div>
            <span className="admin-dashboard-span-5">
              Módulo de Control · BikeStore Colombia
            </span>
            <h1 className="admin-dashboard-h1-1">
              {activeTab === "dashboard" &&
            "Dashboard de Métricas & Rendimiento"}
              {activeTab === "products" && "Administración de Catálogo"}
              {activeTab === "users" && "Gestión de Usuarios & Seguridad"}
            </h1>
          </div>

          {activeTab === "dashboard" && (<div className="admin-dashboard-div-8">
              <Button variant="outline" size="sm" onClick={() => handleExportReport("Excel")} disabled={isExporting} icon={<Icon name="download" size={14}/>} iconPosition="left">
                Exportar Excel
              </Button>
              <Button variant="dark" size="sm" onClick={() => handleExportReport("PDF")} disabled={isExporting} icon={<Icon name="download" size={14}/>} iconPosition="left">
                Exportar PDF
              </Button>
            </div>)}

          {activeTab === "products" && (<Button variant="primary" size="md" onClick={() => {
                setProductToEdit(null);
                setIsProductModalOpen(true);
            }} icon={<Icon name="plus" size={16}/>} iconPosition="left">
              Registrar Producto
            </Button>)}

          {activeTab === "users" && (<Button variant="primary" size="md" onClick={() => {
                setUserToEdit(null);
                setIsUserModalOpen(true);
            }} icon={<Icon name="plus" size={16}/>} iconPosition="left">
              Crear Nuevo Usuario
            </Button>)}
        </div>

        {/* Notificación Temporal */}
        {adminNotice && (<div className="admin-dashboard-div-9 animate-fade-in">
            <Icon name="check" size={16}/>
            <span>{adminNotice}</span>
          </div>)}

        {/* PESTAÑA 1: DASHBOARD */}
        {activeTab === "dashboard" && (<div className="admin-dashboard-div-10">
            <div className="admin-dashboard-div-11">
              <MetricCard title="Ventas Totales del Mes" value={formatCOP(summary.total)} subtext={`Pedidos locales · ${summary.period}`} iconName="sparkles"/>
              <MetricCard title="Cantidad de Pedidos" value={String(summary.monthly.length)} subtext="Pedidos registrados este mes en este navegador" iconName="cart"/>
              <MetricCard title="Ticket Promedio por Cliente" value={formatCOP(summary.average)} subtext="Promedio por pedido del mes" iconName="shield"/>
            </div>

            <div className="admin-dashboard-div-12">
              <span className="admin-dashboard-span-6">
                <Icon name="alert-triangle" size={20}/>
              </span>
              <div className="admin-dashboard-div-13">
                <h4 className="admin-dashboard-h4-1">
                  Alertas Operacionales en Tiempo Real:
                </h4>
                <ul className="admin-dashboard-ul-1">
                  <li>
                    <strong>Inventario:</strong> {products.filter((p) => p.stock === 0).length} productos sin existencias.
                  </li>
                </ul>
              </div>
            </div>

            <div className="admin-dashboard-div-14">
              <div className="admin-dashboard-div-15">
                <div>
                  <h3 className="admin-dashboard-h3-1">
                    {salesChartView === "days"
                ? "Ventas diarias del mes"
                : "Ventas mensuales del año"}{" "}
                    (COP)
                  </h3>
                  <p className="admin-dashboard-p-1">
                    Valor de los productos vendidos, sin incluir envío. Datos
                    registrados en este navegador.
                  </p>
                </div>
                <Badge variant="yellow">Datos locales</Badge>
              </div>

              <div className="admin-dashboard-div-16">
                <label className="admin-dashboard-label-1">
                  Vista temporal
                  <select value={salesChartView} onChange={(event) => setSalesChartView(event.target.value)} className="admin-dashboard-select-1">
                    <option value="days">Todos los días del mes</option>
                    <option value="months">Todos los meses del año</option>
                  </select>
                </label>
                <label className="admin-dashboard-label-1">
                  Año
                  <select value={salesChartYear} onChange={(event) => setSalesChartYear(Number(event.target.value))} className="admin-dashboard-select-1">
                    {salesYears.map((year) => (<option key={year} value={year}>
                        {year}
                      </option>))}
                  </select>
                </label>
                <label className="admin-dashboard-label-1">
                  Mes
                  <select value={salesChartMonth} onChange={(event) => setSalesChartMonth(Number(event.target.value))} disabled={salesChartView === "months"} className="admin-dashboard-select-2">
                    {monthOptions.map((month) => (<option key={month.value} value={month.value}>
                        {month.label}
                      </option>))}
                  </select>
                </label>
                <label className="admin-dashboard-label-1">
                  Categoría de producto
                  <select value={salesCategory} onChange={(event) => setSalesCategory(event.target.value)} className="admin-dashboard-select-1">
                    <option value="Todas">Todas las categorías</option>
                    <option value="Bicicletas">Bicicletas</option>
                    <option value="Componentes">Componentes</option>
                    <option value="Accesorios">Accesorios</option>
                  </select>
                </label>
              </div>

              <div className="admin-dashboard-div-17">
                <div className="admin-dashboard-div-18">
                  <strong className="admin-dashboard-strong-1">
                    Eje X · {salesChartView === "days" ? "Día" : "Mes"}:
                  </strong>{" "}
                  {salesChartView === "days"
                ? `todos los días de ${monthOptions[salesChartMonth].label} de ${salesChartYear}.`
                : `todos los meses del año ${salesChartYear}.`}
                </div>
                <div className="admin-dashboard-div-19">
                  <strong className="admin-dashboard-strong-1">Eje Y · Ventas:</strong>{" "}
                  total vendido en pesos colombianos para{" "}
                  {salesCategory === "Todas"
                ? "todas las categorías"
                : salesCategory.toLowerCase()}
                  .
                </div>
              </div>

              <div className="admin-dashboard-div-20">
                <div className={`admin-dashboard-div-21 ${salesChartView === "days"
                ? "admin-dashboard-div-22"
                : "admin-dashboard-div-23"}`}>
                  <div className="admin-dashboard-div-24">
                    <span className="admin-dashboard-span-7">
                      Eje Y · Ventas (COP)
                    </span>
                    <div className="admin-dashboard-div-25">
                      <span>
                        {formatCOP(maxChartSales === 1 ? 0 : maxChartSales)}
                      </span>
                      <span>
                        {formatCOP(maxChartSales === 1 ? 0 : maxChartSales / 2)}
                      </span>
                      <span>{formatCOP(0)}</span>
                    </div>
                  </div>
                  <div className="admin-dashboard-div-26">
                    <div className="admin-dashboard-div-27">
                      {salesChartData.map((bar, index) => (<div key={`${bar.label}-${index}`} className="admin-dashboard-div-28 group" title={`${salesChartView === "days" ? "Día" : "Mes"} ${bar.label}: ${formatCOP(bar.total)}`}>
                          <span className="admin-dashboard-span-8">
                            {formatCOP(bar.total)}
                          </span>
                          <div style={{
                    height: `${(bar.total / maxChartSales) * 156}px`,
                }} className="admin-dashboard-div-29"/>
                          <span className="admin-dashboard-span-9">
                            {bar.label}
                          </span>
                        </div>))}
                    </div>
                    <p className="admin-dashboard-p-2">
                      Eje X ·{" "}
                      {salesChartView === "days"
                ? "Día del mes"
                : "Mes del año"}
                    </p>
                  </div>
                </div>
              </div>
              <p className="admin-dashboard-p-3">
                Usa la barra horizontal inferior para recorrer todos los{" "}
                {salesChartView === "days" ? "días" : "meses"} sin salir del
                contenedor.
              </p>
            </div>

          </div>)}

        {/* PESTAÑA 2: PRODUCTOS */}
        {activeTab === "products" && (<div className="admin-dashboard-div-30">
            <div className="admin-dashboard-div-31">
              <div className="admin-dashboard-div-32">
                <input type="text" placeholder="Buscar producto por nombre o categoría..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className="admin-dashboard-input-1"/>
                <select value={productCategoryFilter} onChange={(e) => setProductCategoryFilter(e.target.value)} className="admin-dashboard-select-3">
                  <option value="Todas">Todas las Secciones</option>
                  <option value="Bicicletas">Bicicletas</option>
                  <option value="Componentes">Componentes</option>
                  <option value="Accesorios">Accesorios</option>
                </select>
              </div>

              <span className="admin-dashboard-span-10">
                Mostrando <strong>{filteredProducts.length}</strong> de{" "}
                {products.length} productos
              </span>
            </div>

            <div className="admin-dashboard-div-33">
              <table className="admin-dashboard-table-1">
                <thead>
                  <tr className="admin-dashboard-tr-1">
                    <th className="admin-dashboard-th-1">Producto</th>
                    <th className="admin-dashboard-th-1">Sección / Categoría</th>
                    <th className="admin-dashboard-th-1">Precio Unitario</th>
                    <th className="admin-dashboard-th-1">Stock</th>
                    <th className="admin-dashboard-th-1">Estado</th>
                    <th className="admin-dashboard-th-2">Acciones</th>
                  </tr>
                </thead>
                <tbody className="admin-dashboard-tbody-1">
                  {filteredProducts.map((p) => (<tr key={p.id} className="admin-dashboard-tr-2">
                      <td className="admin-dashboard-td-1">
                        <img src={asset(p.image)} alt="" className="admin-dashboard-img-1"/>
                        <div>
                          <b className="admin-dashboard-b-1">
                            {p.name}
                          </b>
                          {p.badge && (<span className="admin-dashboard-span-11">
                              {p.badge}
                            </span>)}
                        </div>
                      </td>
                      <td className="admin-dashboard-td-2">
                        {p.section} · {p.category}
                      </td>
                      <td className="admin-dashboard-td-3">
                        {formatCOP(p.price)}
                      </td>
                      <td className="admin-dashboard-th-1">
                        {p.stock === 0 ? (<span className="admin-dashboard-span-12">
                            Agotado (0)
                          </span>) : (<span>{p.stock} unid.</span>)}
                      </td>
                      <td className="admin-dashboard-th-1">
                        <Badge variant={p.status === "Activo" ? "green" : "red"}>
                          {p.status}
                        </Badge>
                      </td>
                      <td className="admin-dashboard-td-4">
                        <button type="button" onClick={() => {
                    setProductToEdit(p);
                    setIsProductModalOpen(true);
                }} className="admin-dashboard-button-6">
                          Editar
                        </button>
                        <span>·</span>
                        {p.status === "Activo" ? (<button type="button" onClick={() => setProductToDeactivate(p)} className="admin-dashboard-button-7">
                            Inactivar
                          </button>) : (<button type="button" onClick={() => {
                        onSaveProduct({ ...p, status: "Activo" });
                        showNotice(`Producto ${p.name} reactivado en catálogo.`);
                    }} className="admin-dashboard-button-8">
                            Reactivar
                          </button>)}
                      </td>
                    </tr>))}
                </tbody>
              </table>
            </div>
          </div>)}

        {/* PESTAÑA 3: USUARIOS */}
        {activeTab === "users" && (<div className="admin-dashboard-div-34">
            <div className="admin-dashboard-div-35">
              <div className="admin-dashboard-div-36">
                <span className="admin-dashboard-span-13">
                  Total Usuarios Registrados
                </span>
                <span className="admin-dashboard-span-14">
                  {safeUsers.length}
                </span>
              </div>
              <div className="admin-dashboard-div-36">
                <span className="admin-dashboard-span-13">
                  Cuentas con Rol Administrador
                </span>
                <span className="admin-dashboard-span-15">
                  {safeUsers.filter((u) => u.role === "admin" && u.status === "Activo").length}
                </span>
              </div>
              <div className="admin-dashboard-div-36">
                <span className="admin-dashboard-span-13">
                  Clientes Activos
                </span>
                <span className="admin-dashboard-span-16">
                  {safeUsers.filter((u) => u.role === "cliente" && u.status === "Activo").length}
                </span>
              </div>
            </div>

            <div className="admin-dashboard-div-30">
              <div className="admin-dashboard-div-31">
                <input type="text" placeholder="Buscar usuarios por nombre, correo o rol..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="admin-dashboard-input-1"/>

                <span className="admin-dashboard-span-10">
                  Total usuarios filtrados:{" "}
                  <strong>{filteredUsers.length}</strong>
                </span>
              </div>

              <div className="admin-dashboard-div-33">
                <table className="admin-dashboard-table-1">
                  <thead>
                    <tr className="admin-dashboard-tr-1">
                      <th className="admin-dashboard-th-1">Nombre Completo</th>
                      <th className="admin-dashboard-th-1">Correo Electrónico</th>
                      <th className="admin-dashboard-th-1">Rol en el Sistema</th>
                      <th className="admin-dashboard-th-1">Estado</th>
                      <th className="admin-dashboard-th-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="admin-dashboard-tbody-1">
                    {filteredUsers.map((u) => (<tr key={u.id} className="admin-dashboard-tr-2">
                        <td className="admin-dashboard-td-3">
                          {u.name}
                        </td>
                        <td className="admin-dashboard-td-5">{u.email}</td>
                        <td className="admin-dashboard-th-1">
                          <span className={`admin-dashboard-span-17 ${u.role === "admin"
                    ? "admin-dashboard-span-18"
                    : "admin-dashboard-span-19"}`}>
                            {u.role === "admin" ? "Administrador" : "Cliente"}
                          </span>
                        </td>
                        <td className="admin-dashboard-th-1">
                          <Badge variant={u.status === "Activo" ? "green" : "red"}>
                            {u.status}
                          </Badge>
                        </td>
                        <td className="admin-dashboard-td-4">
                          <button type="button" onClick={() => {
                    setUserToEdit(u);
                    setIsUserModalOpen(true);
                }} className="admin-dashboard-button-6">
                            Editar Usuario
                          </button>
                          <span>·</span>
                          {u.status === "Activo" ? (<button type="button" onClick={() => {
                        const res = deactivateUser(u.id);
                        if (res && res.success) {
                            showNotice(res.message);
                        }
                        else if (res) {
                            alert(res.message);
                        }
                    }} className="admin-dashboard-button-7">
                              Inactivar Cuenta
                            </button>) : (<button type="button" onClick={() => {
                        updateUser(u.id, { status: "Activo" });
                        showNotice(`Cuenta de ${u.name} activada.`);
                    }} className="admin-dashboard-button-8">
                              Reactivar Cuenta
                            </button>)}
                        </td>
                      </tr>))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>)}
      </main>

      {/* MODALES */}
      <ProductFormModal isOpen={isProductModalOpen} productToEdit={productToEdit} onClose={() => setIsProductModalOpen(false)} onSave={(data) => {
            onSaveProduct(data);
            showNotice(productToEdit
                ? `Producto ${data.name} actualizado exitosamente.`
                : `Producto ${data.name} registrado en catálogo.`);
        }}/>

      <ProductDeactivateModal isOpen={!!productToDeactivate} product={productToDeactivate} onClose={() => setProductToDeactivate(null)} onConfirm={(id, reason) => {
            onDeactivateProduct(id, reason);
            showNotice("Producto retirado del catálogo público con justificación registrada.");
        }}/>

      <UserFormModal isOpen={isUserModalOpen} userToEdit={userToEdit} onClose={() => setIsUserModalOpen(false)} onSave={(data) => {
            if (userToEdit) {
                const res = updateUser(userToEdit.id, data);
                if (res && res.success) {
                    showNotice(res.message);
                }
                else if (res) {
                    alert(res.message);
                }
            }
            else {
                const res = addUser(data);
                if (res && res.success) {
                    showNotice(res.message);
                }
                else if (res) {
                    alert(res.message);
                }
            }
        }}/>
    </div>);
};
export default AdminDashboardPage;
