import React, { useState, useMemo, useEffect } from "react";
import { exportReport } from "../utils/documents";
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
import { apiRequest } from "../utils/api";
import "../assets/styles.css";
export const AdminDashboardPage = ({ products = [], orders = [], onNavigate, onSaveProduct, onDeactivateProduct, }) => {
    const { currentUser, logout, token, addUser, updateUser, deactivateUser, } = useAuth();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [productSearch, setProductSearch] = useState("");
    const [productCategoryFilter, setProductCategoryFilter] = useState("Todas");
    const [productStatusFilter, setProductStatusFilter] = useState("Todos");
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
    const [dashboardData, setDashboardData] = useState(null);
    const [dashboardError, setDashboardError] = useState("");
    const [managedProducts, setManagedProducts] = useState(products);
    const [managedUsers, setManagedUsers] = useState([]);
    const [userCount, setUserCount] = useState(0);
    const monthOptions = useMemo(() => Array.from({ length: 12 }, (_, month) => ({
        value: month,
        label: new Intl.DateTimeFormat("es-CO", { month: "long" }).format(new Date(2024, month, 1)),
        shortLabel: new Intl.DateTimeFormat("es-CO", {
            month: "short",
        })
            .format(new Date(2024, month, 1))
            .replace(".", ""),
    })), []);
    const salesYears = [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2];
    const salesChartData = (dashboardData?.salesSeries || []).map((point) => ({
        label: salesChartView === "months" ? monthOptions[Number(point.label) - 1]?.shortLabel || point.label : point.label,
        total: point.sales,
    }));
    const maxChartSales = Math.max(1, ...salesChartData.map((point) => point.total));
    const showNotice = (msg) => {
        setAdminNotice(msg);
        setTimeout(() => setAdminNotice(""), 3500);
    };
    const refreshAdminUsers = async () => {
        const { data } = await apiRequest("/admin/users", { token });
        setManagedUsers(data);
        setUserCount(data.length);
        return data;
    };
    const handleLogout = () => {
        logout();
        onNavigate("home");
    };
    const summary = {
        total: dashboardData?.sales || 0,
        orderCount: dashboardData?.orderCount || 0,
        average: dashboardData?.averageOrder || 0,
        period: dashboardData?.period?.month
            ? `${monthOptions[dashboardData.period.month - 1].label} ${dashboardData.period.year}`
            : String(dashboardData?.period?.year || salesChartYear),
    };
    const filteredProducts = managedProducts;
    const filteredUsers = managedUsers;
    const safeUsers = managedUsers;

    useEffect(() => {
        const query = new URLSearchParams({
            year: String(salesChartYear),
            view: salesChartView,
            section: salesCategory,
            ...(salesChartView === "days" ? { month: String(salesChartMonth + 1) } : {}),
        });
        apiRequest(`/admin/dashboard?${query}`, { token })
            .then(({ data }) => {
                setDashboardData(data);
                setDashboardError("");
            })
            .catch((error) => setDashboardError(error.message));
    }, [token, salesChartYear, salesChartMonth, salesChartView, salesCategory]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const query = new URLSearchParams();
            if (productSearch.trim()) query.set("search", productSearch.trim());
            if (productCategoryFilter !== "Todas") query.set("section", productCategoryFilter);
            if (productStatusFilter !== "Todos") query.set("status", productStatusFilter);
            apiRequest(`/products/manage${query.size ? `?${query}` : ""}`, { token })
                .then(({ data }) => setManagedProducts(data))
                .catch((error) => showNotice(error.message));
        }, 250);
        return () => clearTimeout(timer);
    }, [token, productSearch, productCategoryFilter, productStatusFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const query = new URLSearchParams();
            if (userSearch.trim()) query.set("search", userSearch.trim());
            apiRequest(`/admin/users${query.size ? `?${query}` : ""}`, { token })
                .then(({ data }) => {
                    setManagedUsers(data);
                    if (!userSearch.trim()) setUserCount(data.length);
                })
                .catch((error) => showNotice(error.message));
        }, 250);
        return () => clearTimeout(timer);
    }, [token, userSearch]);

    const handleExportReport = async (format) => {
        setIsExporting(true);
        try {
            const query = new URLSearchParams({
                year: String(salesChartYear),
                view: salesChartView,
                section: salesCategory,
                ...(salesChartView === "days" ? { month: String(salesChartMonth + 1) } : {}),
            });
            const { data } = await apiRequest(`/admin/dashboard/export?${query}`, { token });
            if (!data.sales && !data.orderCount) {
                throw new Error("No hay ventas para exportar en el periodo seleccionado.");
            }
            await exportReport(format, data);
            showNotice(`Informe ${format} generado. Descarga iniciada.`);
        } catch (error) {
            showNotice(error.message || "No se pudo generar el informe. Intenta nuevamente.");
        }
        finally {
            setIsExporting(false);
        }
    };
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
              <MetricCard title="Ventas Totales del Periodo" value={formatCOP(summary.total)} subtext={`Pedidos pagados · ${summary.period}`} iconName="sparkles"/>
              <MetricCard title="Cantidad de Pedidos" value={String(summary.orderCount)} subtext="Pedidos pagados en MySQL" iconName="cart"/>
              <MetricCard title="Ticket Promedio por Pedido" value={formatCOP(summary.average)} subtext="Promedio de ventas del periodo" iconName="shield"/>
            </div>

            {dashboardError && <p className="admin-dashboard-error" role="alert">{dashboardError}</p>}

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
                    <strong>Inventario:</strong> {dashboardData?.outOfStockCount ?? 0} productos activos sin existencias.
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
                  <p className="admin-dashboard-p-1">Valor de productos vendidos, sin incluir envío, consultado desde MySQL.</p>
                </div>
                <Badge variant="yellow">Datos de MySQL</Badge>
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

            <section className="admin-dashboard-top-products">
              <h3>Productos más vendidos</h3>
              {dashboardData?.topProducts?.length ? (
                <ol>
                  {dashboardData.topProducts.map((product) => (
                    <li key={product.id}>
                      <span>{product.name}</span>
                      <strong>{product.quantity} unidades · {formatCOP(product.sales)}</strong>
                    </li>
                  ))}
                </ol>
              ) : <p>No hay ventas para el periodo seleccionado.</p>}
            </section>

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
                <select value={productStatusFilter} onChange={(e) => setProductStatusFilter(e.target.value)} className="admin-dashboard-select-3" aria-label="Filtrar por estado">
                  <option value="Todos">Todos los estados</option>
                  <option value="Activo">Activos</option>
                  <option value="Inactivo">Inactivos</option>
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
                          </button>) : <span className="admin-dashboard-button-8">Sin reactivación</span>}
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
                  {userCount}
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
                          {u.status === "Activo" ? (<button type="button" onClick={async () => {
                        if (!window.confirm(`¿Inactivar la cuenta de ${u.name}?`)) return;
                        const res = await deactivateUser(u.id);
                        if (res.success) {
                            showNotice(res.message);
                            setManagedUsers((previous) => previous.map((user) => user.id === u.id ? { ...user, status: "Inactivo" } : user));
                        } else {
                            showNotice(res.message);
                        }
                    }} className="admin-dashboard-button-7">
                              Inactivar Cuenta
                            </button>) : <span className="admin-dashboard-button-8">Cuenta inactiva</span>}
                        </td>
                      </tr>))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>)}
      </main>

      {/* MODALES */}
      <ProductFormModal isOpen={isProductModalOpen} productToEdit={productToEdit} onClose={() => setIsProductModalOpen(false)} onSave={async (data) => {
            await onSaveProduct(data);
            setManagedProducts((previous) => {
                const exists = previous.some((product) => product.id === data.id);
                return exists ? previous.map((product) => product.id === data.id ? { ...product, ...data } : product) : [{ ...data, status: "Activo" }, ...previous];
            });
            showNotice(productToEdit
                ? `Producto ${data.name} actualizado exitosamente.`
                : `Producto ${data.name} registrado en catálogo.`);
        }}/>

      <ProductDeactivateModal isOpen={!!productToDeactivate} product={productToDeactivate} onClose={() => setProductToDeactivate(null)} onConfirm={async (id, reason) => {
            await onDeactivateProduct(id, reason);
            setManagedProducts((previous) => previous.map((product) => product.id === id ? { ...product, status: "Inactivo", inactivationReason: reason } : product));
            showNotice("Producto retirado del catálogo público con justificación registrada.");
        }}/>

      <UserFormModal isOpen={isUserModalOpen} userToEdit={userToEdit} onClose={() => setIsUserModalOpen(false)} onSave={async (data) => {
            if (userToEdit) {
                const res = await updateUser(userToEdit.id, data);
                if (res && res.success) {
                    showNotice(res.message);
                    await refreshAdminUsers();
                    return true;
                }
                else if (res) {
                    return res;
                }
            }
            else {
                const res = await addUser(data);
                if (res && res.success) {
                    showNotice(res.message);
                    await refreshAdminUsers();
                    return true;
                }
                else if (res) {
                    return res;
                }
            }
        }}/>
    </div>);
};
export default AdminDashboardPage;
