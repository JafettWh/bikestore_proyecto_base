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

Si ya importaste el esquema anterior y conservas datos, ejecuta una sola vez `sql/migrations/2026-11-05-align-role-product-model.sql` desde MySQL Workbench. Es una migración aditiva: agrega los permisos CRUD de rol y la relación producto-sección del modelo, y rellena la nueva clave de sección a partir de la categoría existente.

Configura el backend:

```powershell
cd backend
Copy-Item .env.example .env
npm install
npm run dev
```

Edita `backend/.env` con el usuario/contraseña MySQL y reemplaza `JWT_SECRET` con una cadena aleatoria de al menos 32 caracteres. El archivo `.env` está ignorado por Git. En el primer inicio se crean los usuarios de prueba indicados por `SEED_*`; cambiar esas variables no altera las contraseñas de usuarios que ya existan en la base.

La API escucha en `http://localhost:3000`; comprueba su estado en `GET /api/health`. En desarrollo acepta puertos locales de Vite (por ejemplo, `5173` y `5174`); en producción solo acepta los orígenes definidos en `CORS_ORIGIN`.

### Cuentas locales de prueba

Las credenciales de desarrollo están en `backend/.env.example`:

- Administrador: `admin@bikestore.local` / `BikeStoreAdmin2026!`
- Cliente: `cliente@bikestore.local` / `BikeStoreCliente2026!`

Son solo para desarrollo local. Cámbialas antes de compartir el entorno. El seed crea contraseñas con bcrypt y no las devuelve en respuestas.

## Recuperación de contraseña con Gmail

La API envía códigos de 6 dígitos por SMTP de Gmail; almacena únicamente su hash y vencen en 15 minutos. El código tiene límite de intentos, se valida una sola vez y el token temporal de restablecimiento también vence. Configuración:

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
| PATCH | `/api/products/:id/deactivate` | Admin | Inactivar producto con motivo |
| GET/POST | `/api/admin/users` | Admin | Consultar y crear usuarios |
| PUT/PATCH | `/api/admin/users/:id` | Admin | Actualizar o inactivar cuentas |
| GET/POST/PATCH/DELETE | `/api/cart` y `/api/cart/items` | Público/sesión | Carrito por visitante o cliente |
| GET/POST | `/api/orders/mine`, `/api/orders` | Cliente | Historial y compra con pago simulado |
| GET | `/api/admin/dashboard`, `/api/admin/dashboard/export` | Admin | Métricas e información para informes |

El pago es simulado: no se almacenan números de tarjeta ni CVV. Las rutas administrativas comprueban JWT y rol en el servidor; las cuentas inactivas pierden acceso de inmediato. Se conserva al menos un administrador activo.

## Modelo y trazabilidad documental

El esquema implementa usuarios/roles, secciones/categorías, productos, imágenes/tallas, carritos, pedidos/detalles/pagos y códigos de recuperación. Las claves foráneas, restricciones `UNIQUE`, `CHECK`, estados y transacciones protegen unicidad, stock, saldos y relaciones. `users.password_hash` y los códigos hash de recuperación atienden RNF-05; las claves foráneas y las operaciones transaccionales preservan RNF-06. RF-08 se implementa con carritos persistidos; RF-30 con JWT y middleware; RF-29 solo permite inactivar cuentas, conforme a la restricción del instructor.

| Flujo e historias según los archivos HU | CU / RF | Datos y API | Superficie React |
|---|---|---|---|
| Catálogo y detalle (HU01–HU02) | CU-01–02; RF-01–04 | `sections`, `categories`, `products`, `product_images`, `product_sizes`; `GET /api/products` | `HomePage`, `ProductDetailPage` |
| Carrito (HU02, HU07–HU08) y persistencia | CU-06–07; RF-05–08 | `carts`, `cart_items`; `/api/cart` y `/api/cart/items/*` | `CartContext`, catálogo y `CartPage` |
| Registro, sesión, recuperación y roles (HU03–HU06) | CU-03–05; RF-13–16, RF-30 | `users`, `roles`, `password_reset_codes`; `/api/auth/*` | `AuthPage`, `perfilpage` |
| Compra y pago simulado (HU09) | CU-08; RF-09–12 | `orders`, `order_items`, `payments`; `POST /api/orders` | `CheckoutPage` y confirmación de compra |
| CRUD y búsqueda de productos (HU10–HU13) | CU-09–12; RF-17–20 | `products` se relaciona con `sections` y `categories`; `product_images`, `product_sizes`; `/api/products/*` | `ProductFormModal`, `AdminDashboardPage` |
| Dashboard y alertas (HU17) | CU-13; RF-21–25 | Pedidos/detalles, productos y categorías; `GET /api/admin/dashboard` | `AdminDashboardPage` |
| Exportación de informes (HU18) | CU-14; RF-26 | Datos agregados del dashboard; `GET /api/admin/dashboard/export` | `documents.js`, `AdminDashboardPage` |
| Gestión de usuarios (HU14–HU16) | CU-15–17; RF-27–29, RF-31 | `users`, `roles`; `/api/admin/users/*` | `UserFormModal`, `AdminDashboardPage` |

Hay diferencias de numeración entre los renglones de trazabilidad de `Requerimientos_BikeStore.md` y los nombres/contenido de algunas HU: la tabla asocia RF-08 a HU09 aunque el archivo HU09 es compra; RF-09–12 apunta a HU10 aunque el flujo de compra está en HU09; RF-17 apunta a HU11 aunque CU-09 y la HU de registro de productos lo asocian a HU10; CU-13/RF-21–25 corresponde a HU17 y CU-14/RF-26 a HU18 (la tabla de RF indica HU18/HU19). La gestión de usuarios también tiene desplazamientos en algunas referencias HU de la tabla. La implementación sigue los flujos y criterios de aceptación escritos en los CU y archivos HU, y conserva intactos los documentos fuente.
