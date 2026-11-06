# BikeStore API

API REST CRUD con Node.js, Express, MySQL, bcrypt, JWT y React/Vite en el frontend. La base está normalizada a partir del ER/MER de `docs/Diagramas_BD`; conserva productos, pedidos y usuarios mediante estados en vez de borrado físico.

## Requisitos

- Node.js 20 o superior.
- MySQL 8 (o MariaDB compatible con `CHECK`, JSON y FULLTEXT).
- Gmail con verificación en dos pasos si se habilita recuperación por correo.

## Preparar MySQL y el backend

Desde la raíz del repositorio importa el esquema:

```powershell
mysql -u root -p < sql\bikestore.sql
```

Si ya importaste el esquema anterior y conservas datos, ejecuta en orden las migraciones `2026-11-05-*`, luego `2026-11-06-*` y finalmente `sql/migrations/2026-11-07-remove-database-cart.sql`. La última elimina definitivamente `detalle_carrito`, `carrito` y la marca de importación; los carritos pasan a guardarse solo en el navegador y el checkout valida el stock en una transacción. No ejecutes migraciones históricas sobre una base creada con el SQL actual.

Configura el backend:

```powershell
cd backend
Copy-Item .env.example .env
npm install
npm run dev
```

Edita `backend/.env` con el usuario/contraseña MySQL y reemplaza `JWT_SECRET` con una cadena aleatoria de al menos 32 caracteres. El archivo `.env` está ignorado por Git. `ADMIN_CREATION_PASSWORD` (valor solicitado para desarrollo: `admin123`) autoriza crear o promover usuarios a administrador; cámbiala antes de compartir o desplegar el entorno. En el primer inicio se crean los usuarios de prueba indicados por `SEED_*`; cambiar esas variables no altera las contraseñas de usuarios que ya existan en la base.

La API escucha en `http://localhost:3000`; comprueba su estado en `GET /api/health`. En desarrollo acepta puertos locales de Vite (por ejemplo, `5173` y `5174`); en producción solo acepta los orígenes definidos en `CORS_ORIGIN`.

Para probar los endpoints con Postman o RapidAPI Client, consulta la guía [Pruebas de API](../docs/Pruebas_API_Postman_RapidAPI.md), con ejemplos de autenticación, CRUD, carrito, compras y validaciones.

### Cuentas locales de prueba

Las credenciales de desarrollo están en `backend/.env.example`:

- Administrador: `admin@bikestore.local` / `BikeStoreAdmin2026!`
- Cliente: `cliente@bikestore.local` / `BikeStoreCliente2026!`

Son solo para desarrollo local. Cámbialas antes de compartir el entorno. El seed crea contraseñas con bcrypt y no las devuelve en respuestas.

## Recuperación de contraseña con Gmail

La API envía códigos de 6 dígitos por SMTP de Gmail; guarda como máximo un hash vigente en la fila del usuario y vence en 15 minutos. Un nuevo código reemplaza al anterior; hay límite de intentos, el código se valida una sola vez y los campos temporales se limpian al restablecer la contraseña. No se conserva un historial de códigos. El token temporal de restablecimiento también vence. Configuración:

1. Activa la verificación en dos pasos de la cuenta remitente de Google.
2. En la configuración de seguridad de Google crea una **Contraseña de aplicación** para BikeStore. No uses la contraseña normal de Gmail.
3. En `backend/.env`, configura `GMAIL_USER` con esa cuenta y `GMAIL_APP_PASSWORD` con la contraseña de aplicación (sin espacios). Opcionalmente configura `MAIL_FROM`; por defecto se usa `GMAIL_USER`.
4. Conserva `SMTP_HOST=smtp.gmail.com` y `SMTP_PORT=465` (TLS). Si Google Workspace bloquea SMTP, el administrador del dominio debe habilitarlo.
5. Reinicia `npm run dev` y prueba el recorrido **Olvidé mi contraseña**. El backend reporta explícitamente cuando falta configuración o Gmail rechaza el envío.

Endpoints del flujo: `POST /api/auth/password/forgot`, `POST /api/auth/password/verify` y `POST /api/auth/password/reset`.

## API principal

| Método | Ruta | Acceso | Función |
|---|---|---|---|
| POST | `/api/auth/register` | Público | Registro con bcrypt y aceptación de términos |
| POST | `/api/auth/login` | Público | Autenticación y JWT |
| GET/PATCH | `/api/auth/me` | Sesión | Consultar/actualizar el perfil |
| GET | `/api/products`, `/api/products/:id` | Público | Catálogo activo, búsqueda, filtro y detalle |
| GET | `/api/products/manage` | Admin | Buscar/filtrar todos los productos |
| POST/PUT | `/api/products`, `/api/products/:id` | Admin | Crear/actualizar producto |
| PATCH | `/api/products/:id/deactivate`, `/api/products/:id/reactivate` | Admin | Inactivar o reactivar producto |
| GET | `/api/products/images` | Admin | Listar imágenes guardadas para asignarlas a productos |
| GET/POST | `/api/admin/users` | Admin | Consultar y crear usuarios |
| PUT/PATCH | `/api/admin/users/:id` | Admin | Actualizar, inactivar o reactivar cuentas |
| GET/POST | `/api/orders/mine`, `/api/orders` | Cliente | Historial y compra con pago simulado |
| GET | `/api/admin/dashboard`, `/api/admin/dashboard/export` | Admin | Métricas e información para informes |

El pago es simulado: no se almacenan números de tarjeta ni CVV. Las rutas administrativas comprueban JWT y rol en el servidor; las cuentas inactivas pierden acceso de inmediato. Se conserva al menos un administrador activo.

## Modelo y trazabilidad documental

El esquema implementa usuarios/roles, secciones/categorías, productos, imágenes/tallas, pedidos/detalles y pagos. Los carritos viven en `localStorage` (separados por cuenta) y no reservan existencias; el checkout recibe cantidades, bloquea filas de productos, valida precios/tallas/stock y crea pedido, pago y descuento de stock en una sola transacción. Las claves foráneas, restricciones `UNIQUE`, `CHECK`, estados y transacciones protegen relaciones y stock. Las rutas administrativas siempre requieren JWT de administrador; la contraseña de autorización para asignar el rol admin se valida en el backend.

| Flujo e historias según los archivos HU | CU / RF | Datos y API | Superficie React |
|---|---|---|---|
| Catálogo y detalle (HU01–HU02) | CU-01–02; RF-01–04 | `seccion`, `categoria`, `producto`, `imagen`, `talla`; `GET /api/products` | `HomePage`, `ProductDetailPage` |
| Carrito (HU02, HU07–HU08) y persistencia | CU-06–07; RF-05–08 | `localStorage` por cuenta; sin tablas ni endpoints de carrito | `CartContext`, catálogo y `CartPage` |
| Registro, sesión, recuperación y roles (HU03–HU06) | CU-03–05; RF-13–16, RF-30 | `usuario` (un hash temporal de recuperación), `rol`; `/api/auth/*` | `AuthPage`, `perfilpage` |
| Compra y pago simulado (HU09) | CU-08; RF-09–12 | `pedido`, `detalle_pedido`, `pago`; `POST /api/orders` | `CheckoutPage` y confirmación de compra |
| CRUD y búsqueda de productos (HU10–HU13) | CU-09–12; RF-17–20 | `producto` se relaciona con `seccion` y `categoria`; `imagen`, `talla`; `/api/products/*` | `ProductFormModal`, `AdminDashboardPage` |
| Dashboard y alertas (HU17) | CU-13; RF-21–25 | Pedidos/detalles, productos y categorías; `GET /api/admin/dashboard` | `AdminDashboardPage` |
| Exportación de informes (HU18) | CU-14; RF-26 | Datos agregados del dashboard; `GET /api/admin/dashboard/export` | `documents.js`, `AdminDashboardPage` |
| Gestión de usuarios (HU14–HU16) | CU-15–17; RF-27–29, RF-31 | `usuario`, `rol`; `/api/admin/users/*` | `UserFormModal`, `AdminDashboardPage` |

Hay diferencias de numeración entre los renglones de trazabilidad de `Requerimientos_BikeStore.md` y los nombres/contenido de algunas HU: la tabla asocia RF-08 a HU09 aunque el archivo HU09 es compra; RF-09–12 apunta a HU10 aunque el flujo de compra está en HU09; RF-17 apunta a HU11 aunque CU-09 y la HU de registro de productos lo asocian a HU10; CU-13/RF-21–25 corresponde a HU17 y CU-14/RF-26 a HU18 (la tabla de RF indica HU18/HU19). La gestión de usuarios también tiene desplazamientos en algunas referencias HU de la tabla. La implementación sigue los flujos y criterios de aceptación escritos en los CU y archivos HU, y conserva intactos los documentos fuente.
