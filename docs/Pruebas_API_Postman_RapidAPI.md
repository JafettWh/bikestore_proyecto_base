# Pruebas de API BikeStore con Postman o RapidAPI Client

Guía de referencia para probar manualmente la API REST local. Los ejemplos usan JSON, salvo las operaciones de imagen de producto, que usan `multipart/form-data`.

> Ejecuta estas pruebas únicamente contra una instancia local o un entorno para el que tengas autorización. Los pagos son simulados: no envíes datos de tarjetas reales.

## Guía rápida: método y URL

Las URLs ya incluyen `http://localhost:3000/api`; no necesitas crear una variable `baseUrl`. Cuando una URL incluya `{{productId}}` o `{{userId}}`, reemplaza el marcador por el ID real de una respuesta anterior.

| Prueba | Método | URL | Autenticación |
|---|---|---|---|
| Comprobar que la API responde | `GET` | `http://localhost:3000/api/health` | No |
| Iniciar sesión | `POST` | `http://localhost:3000/api/auth/login` | No |
| Registrar un cliente | `POST` | `http://localhost:3000/api/auth/register` | No |
| Ver mi perfil | `GET` | `http://localhost:3000/api/auth/me` | Cliente o admin |
| Actualizar mi perfil | `PATCH` | `http://localhost:3000/api/auth/me` | Cliente o admin |
| Solicitar recuperación de contraseña | `POST` | `http://localhost:3000/api/auth/password/forgot` | No |
| Verificar código de recuperación | `POST` | `http://localhost:3000/api/auth/password/verify` | No |
| Cambiar contraseña | `POST` | `http://localhost:3000/api/auth/password/reset` | No |
| Listar productos | `GET` | `http://localhost:3000/api/products` | No |
| Consultar un producto | `GET` | `http://localhost:3000/api/products/{{productId}}` | No |
| Listar categorías | `GET` | `http://localhost:3000/api/products/categories` | No |
| Ver imágenes disponibles | `GET` | `http://localhost:3000/api/products/images` | Admin |
| Listar productos de administración | `GET` | `http://localhost:3000/api/products/manage?search=bici&status=Activo` | Admin |
| Crear producto | `POST` | `http://localhost:3000/api/products` | Admin |
| Actualizar producto | `PUT` | `http://localhost:3000/api/products/{{productId}}` | Admin |
| Inactivar / reactivar producto | `PATCH` | `http://localhost:3000/api/products/{{productId}}/deactivate` / `http://localhost:3000/api/products/{{productId}}/reactivate` | Admin |
| Crear pedido | `POST` | `http://localhost:3000/api/orders` | Cliente |
| Ver mis pedidos | `GET` | `http://localhost:3000/api/orders/mine` | Cliente o admin |
| Listar todos los envíos | `GET` | `http://localhost:3000/api/admin/envios` | Admin |
| Actualizar estado logístico | `PUT` | `http://localhost:3000/api/admin/envios/{{orderId}}/estado` | Admin |
| Listar usuarios | `GET` | `http://localhost:3000/api/admin/users?search=cliente&status=Activo` | Admin |
| Crear usuario | `POST` | `http://localhost:3000/api/admin/users` | Admin |
| Actualizar usuario | `PUT` | `http://localhost:3000/api/admin/users/{{userId}}` | Admin |
| Inactivar / reactivar usuario | `PATCH` | `http://localhost:3000/api/admin/users/{{userId}}/deactivate` / `http://localhost:3000/api/admin/users/{{userId}}/reactivate` | Admin |
| Consultar dashboard | `GET` | `http://localhost:3000/api/admin/dashboard?year=2026&month=11&view=days` | Admin |
| Exportar dashboard | `GET` | `http://localhost:3000/api/admin/dashboard/export?year=2026&month=11&view=days` | Admin |

Para cualquier ruta protegida, usa `Authorization: Bearer {{token}}`. Guarda en `token` el JWT que devuelve el inicio de sesión del rol requerido. No existe una consulta administrativa de usuario por ID: `GET /api/admin/users` lista usuarios y `GET /api/auth/me` devuelve el perfil del usuario autenticado.

## 1. Preparar el entorno

Si ya tenías creada la base de datos antes de los cambios recientes, ejecuta una sola vez las migraciones pendientes en orden (`sql/migrations/2026-11-08-rename-badge-to-etiqueta.sql` y `sql/migrations/2026-11-13-add-order-logistics-status.sql`) en MySQL Workbench antes de iniciar la API. Una instalación nueva debe usar el esquema actualizado de `sql/bikestore.sql`.

Desde PowerShell, inicia el backend:

```powershell
cd backend
npm run dev
```

Usa las URLs completas de la tabla anterior. En Postman o RapidAPI Client solo necesitas estas variables:

| Variable | Valor inicial |
|---|---|
| `token` | (vacío; pega el JWT del rol que probarás) |
| `productId` | (ID de un producto de prueba) |
| `userId` | (ID de un usuario de prueba) |

Para rutas protegidas, agrega el encabezado:

```http
Authorization: Bearer {{token}}
```

Usa `{{token}}` en rutas administrativas. Para enviar JSON configura `Content-Type: application/json`. En solicitudes multipart, el cliente debe generar automáticamente el `Content-Type` con su boundary.

## 2. Estado y catálogo público

### Comprobar que la API responde

```http
GET http://localhost:3000/api/health
```

No requiere autenticación. Respuesta esperada: `200`.

### Listar productos activos

```http
GET http://localhost:3000/api/products
```

Parámetros de consulta opcionales:

| Parámetro | Ejemplo | Uso |
|---|---|---|
| `search` | `bicicleta` | Busca por nombre, categoría o sección |
| `section` | `Bicicletas` | Filtra por sección |
| `category` | `Montaña` | Filtra por categoría |
| `categoryId` | `1` | Filtra por ID de categoría |
| `sort` | `asc` o `desc` | Ordena por precio; por defecto, productos más recientes |

Ejemplo:

```http
GET http://localhost:3000/api/products?section=Bicicletas&sort=asc
```

### Consultar categorías

```http
GET http://localhost:3000/api/products/categories
```

### Consultar un producto

```http
GET http://localhost:3000/api/products/{{productId}}
```

Las rutas públicas solo devuelven productos activos. Si el ID no existe o está inactivo, la API responde `404`.

## 3. Registro e inicio de sesión

### Registrar un cliente

```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json
```

```json
{
  "name": "Cliente de Pruebas",
  "email": "cliente.pruebas@example.com",
  "phone": "3001234567",
  "password": "PruebasBike2026!",
  "acceptedTerms": true
}
```

`name` también puede enviarse como `nombre`. El registro siempre crea un usuario con rol de cliente. La respuesta exitosa es `201`; el correo duplicado responde `409`.

### Iniciar sesión

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json
```

```json
{
  "email": "cliente.pruebas@example.com",
  "password": "PruebasBike2026!"
}
```

La respuesta contiene `user` y `token`. Guarda el token en la variable `token`. Para iniciar sesión como administrador local, usa las credenciales definidas por `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD` en `backend/.env` (en la configuración de ejemplo son `admin@bikestore.local` y `BikeStoreAdmin2026!`); guarda ese token en `token`.

Errores de autenticación esperados: credenciales incorrectas `401`; cuenta inactiva `403`.

### Consultar y actualizar el perfil propio

```http
GET http://localhost:3000/api/auth/me
Authorization: Bearer {{token}}
```

```http
PATCH http://localhost:3000/api/auth/me
Authorization: Bearer {{token}}
Content-Type: application/json
```

```json
{
  "name": "Cliente de Pruebas Actualizado",
  "email": "cliente.pruebas@example.com",
  "phone": "3001234567",
  "address": "Calle 10 # 20-30",
  "neighborhood": "Centro",
  "city": "Cali",
  "department": "Valle del Cauca"
}
```

## 4. Recuperación de contraseña (opcional)

El envío requiere que SMTP/Gmail esté configurado en `backend/.env`.

1. Solicitar código:

   ```http
   POST http://localhost:3000/api/auth/password/forgot
   Content-Type: application/json
   ```

   ```json
   { "email": "cliente.pruebas@example.com" }
   ```

2. Verificar el código de seis dígitos recibido por correo:

   ```http
   POST http://localhost:3000/api/auth/password/verify
   Content-Type: application/json
   ```

   ```json
   { "email": "cliente.pruebas@example.com", "code": "123456" }
   ```

   Guarda el `resetToken` de la respuesta.

3. Cambiar la contraseña:

   ```http
   POST http://localhost:3000/api/auth/password/reset
   Content-Type: application/json
   ```

   ```json
   { "resetToken": "<resetToken recibido>", "password": "NuevaClaveBike2026!" }
   ```

El código vence a los 15 minutos, permite hasta cinco intentos y el token de cambio vence a los 10 minutos. Si SMTP no está configurado, la solicitud devuelve `503`.

## 5. Productos: lectura y CRUD administrativo

Estas operaciones requieren `token`. No existe una ruta `DELETE` física de productos: el producto se conserva y se inactiva mediante `PATCH`.

### Listar productos de administración

```http
GET http://localhost:3000/api/products/manage?search=bici&section=Bicicletas&status=Activo
Authorization: Bearer {{token}}
```

Los filtros `search`, `section` y `status` son opcionales. `status` puede ser `Activo`/`Inactivo` o `active`/`inactive`.

### Crear producto

Para crear un producto sin subir archivo, envía JSON y una imagen existente (por ejemplo, `/assets/products/img-005.jpg`):

```http
POST http://localhost:3000/api/products
Authorization: Bearer {{token}}
Content-Type: application/json
```

```json
{
  "name": "Bicicleta de prueba",
  "section": "Bicicletas",
  "category": "Montaña",
  "description": "Producto temporal para pruebas de API.",
  "technicalSpecs": "Marco: aluminio\nFrenos: hidráulicos",
  "price": 1250000,
  "stock": 8,
  "image": "/assets/products/img-005.jpg",
  "etiqueta": "Prueba",
  "sizes": ["S", "M", "L"]
}
```

La respuesta exitosa es `201` e incluye el producto creado. Guarda su `data.id` en `productId`.

Para probar carga de imagen, usa `Body > form-data` en Postman (o la opción equivalente en RapidAPI Client), con estos campos:

| Clave | Tipo | Valor de ejemplo |
|---|---|---|
| `name` | Text | `Bicicleta de prueba` |
| `section` | Text | `Bicicletas` |
| `category` | Text | `Montaña` |
| `description` | Text | `Producto temporal para pruebas de API.` |
| `price` | Text | `1250000` |
| `stock` | Text | `8` |
| `sizes` | Text | `["S","M","L"]` |
| `images` | File | Repite la clave para cargar hasta 10 imágenes JPG, PNG o WEBP (máximo 20 MB cada una) |

El campo de archivo debe llamarse exactamente `images`; `image` es la URL de la imagen principal y `gallery` es un arreglo JSON serializado de URLs ya guardadas. Consulta `GET http://localhost:3000/api/products/images` con `token` para obtener las rutas reutilizables de `public/assets/products` y `uploads`.

Los archivos nuevos se escriben en `backend/uploads`. La URL de la imagen principal queda en `producto.imagen_producto`; las URLs adicionales se guardan en la tabla `imagen`. Las imágenes que ya están en `frontend/public/assets/products` se reutilizan por su ruta y no se copian a `uploads`.

### Actualizar producto

```http
PUT http://localhost:3000/api/products/{{productId}}
Authorization: Bearer {{token}}
Content-Type: application/json
```

```json
{
  "name": "Bicicleta de prueba actualizada",
  "section": "Bicicletas",
  "category": "Montaña",
  "description": "Descripción actualizada para pruebas.",
  "technicalSpecs": "Marco: carbono",
  "price": 1300000,
  "stock": 6,
  "image": "/assets/products/img-005.jpg",
  "etiqueta": "Actualizado",
  "sizes": ["M", "L", "XL"]
}
```

El backend conserva los valores existentes cuando no se envían, pero se recomienda incluir los campos principales. La propiedad `sizes`, si se envía, reemplaza las tallas existentes.

### Inactivar producto (baja lógica)

```http
PATCH http://localhost:3000/api/products/{{productId}}/deactivate
Authorization: Bearer {{token}}
Content-Type: application/json
```

```json
{ "reason": "Producto temporal creado para las pruebas." }
```

No se borra físicamente. Después de inactivarlo, comprueba que ya no aparece en `GET /products` y sí aparece en `GET /products/manage?status=Inactivo`.

Para reactivarlo:

```http
PATCH http://localhost:3000/api/products/{{productId}}/reactivate
Authorization: Bearer {{token}}
```

## 6. Carrito

El carrito se guarda en `localStorage` del frontend y no tiene endpoints ni tablas en MySQL. Para probar el checkout directamente con la API, inicia sesión como cliente y envía los IDs, cantidades y tallas en `items`; no necesitas agregar nada al carrito del navegador. El servidor valida disponibilidad y precios desde la base de datos, sin confiar en valores del cliente.

## 7. Pedidos y pago simulado

### Crear pedido y descontar stock

Inicia sesión como cliente. Para esta prueba directa no necesitas usar el carrito de la tienda; envía uno o más productos dentro de `items`:

```http
POST http://localhost:3000/api/orders
Authorization: Bearer {{token}}
Content-Type: application/json
```

Ejemplo de pago simulado con tarjeta (el número de prueba pasa Luhn; no uses una tarjeta real):

```json
{
  "name": "Cliente de Pruebas",
  "email": "cliente.pruebas@example.com",
  "phone": "3001234567",
  "address": "Calle 10 # 20-30",
  "neighborhood": "Centro",
  "city": "Cali",
  "department": "Valle del Cauca",
  "paymentMethod": "card",
  "cardNumber": "4111111111111111",
  "expiry": "12/30",
  "cvv": "123",
  "items": [
    { "productId": {{productId}}, "quantity": 2, "selectedSize": "M" }
  ]
}
```

Alternativa PSE:

```json
{
  "name": "Cliente de Pruebas",
  "email": "cliente.pruebas@example.com",
  "phone": "3001234567",
  "address": "Calle 10 # 20-30",
  "neighborhood": "Centro",
  "city": "Cali",
  "department": "Valle del Cauca",
  "paymentMethod": "pse",
  "bankName": "Bancolombia",
  "items": [
    { "productId": {{productId}}, "quantity": 1 }
  ]
}
```

El pago es simulado. No se guardan el número de tarjeta, vencimiento ni CVV. La tarjeta debe pasar Luhn, el vencimiento debe estar vigente en formato `MM/AA` y el CVV debe tener exactamente tres dígitos. En un checkout correcto la respuesta es `201` y el stock baja dentro de la transacción. Guarda `data.orderNumber` para identificar el pedido. El carrito del navegador solo se vacía cuando la compra se confirma desde la interfaz de la tienda.

### Consultar historial de pedidos

```http
GET http://localhost:3000/api/orders/mine
Authorization: Bearer {{token}}
```

Un administrador también puede consultar su propio historial con su token; la ruta no lista pedidos de todos los usuarios.

### Administrar envíos (solo administrador)

Lista los pedidos pagados con sus datos de entrega y el estado logístico actual:

```http
GET http://localhost:3000/api/admin/envios
Authorization: Bearer {{token}}
```

Actualiza el estado usando el ID numérico `internalId` devuelto por la lista. Los valores permitidos son `empaquetado`, `en camino`, `entregado` y `retornado`:

```http
PUT http://localhost:3000/api/admin/envios/{{orderId}}/estado
Authorization: Bearer {{token}}
Content-Type: application/json
```

```json
{ "status": "en camino" }
```

El cambio se persiste en `pedido.estado_logistico` y la respuesta incluye el pedido actualizado. Los clientes no pueden consultar esta lista administrativa ni actualizar estados; el historial `GET /api/orders/mine` solo devuelve los pedidos del usuario autenticado. `DELETE` no se implementa para pedidos: el historial de compra se conserva y sus estados logístico y de pago son campos separados.

En el perfil, **Historial de Pedidos** lista todas las compras propias en páginas de cuatro. Al seleccionar un pedido, el modal muestra productos, cantidades, precios, totales, dirección y seguimiento logístico; el estado retornado reemplaza la etapa final de entregado.

## 8. Usuarios administrados (solo administrador)

### Listar usuarios

```http
GET http://localhost:3000/api/admin/users?search=cliente&status=Activo
Authorization: Bearer {{token}}
```

Ambos parámetros son opcionales. `status` admite `Activo`/`Inactivo` o `active`/`inactive`.

### Crear usuario (administración)

```http
POST http://localhost:3000/api/admin/users
Authorization: Bearer {{token}}
Content-Type: application/json
```

```json
{
  "name": "Usuario creado por admin",
  "email": "usuario.admin.pruebas@example.com",
  "password": "PruebasBike2026!",
  "role": "cliente"
}
```

`role` debe ser `cliente` o `admin`; la contraseña debe tener al menos ocho caracteres. Al crear un admin (o promover un usuario), agrega `"adminPassword": "admin123"` por defecto local; el valor real del servidor se configura con `ADMIN_CREATION_PASSWORD`. Todas las rutas siguen requiriendo el JWT de un administrador autenticado.

### Actualizar usuario

```http
PUT http://localhost:3000/api/admin/users/{{userId}}
Authorization: Bearer {{token}}
Content-Type: application/json
```

```json
{
  "name": "Usuario actualizado",
  "email": "usuario.admin.pruebas@example.com",
  "role": "cliente"
}
```

La API exige los tres campos. No se cambia la contraseña mediante esta ruta.

### Inactivar usuario (baja lógica)

```http
PATCH http://localhost:3000/api/admin/users/{{userId}}/deactivate
Authorization: Bearer {{token}}
```

No hay borrado físico de usuarios. El sistema impide inactivar o degradar al último administrador activo.

Reactivar una cuenta inactiva:

```http
PATCH http://localhost:3000/api/admin/users/{{userId}}/reactivate
Authorization: Bearer {{token}}
```

## 9. Dashboard administrativo

Requiere `token`.

```http
GET http://localhost:3000/api/admin/dashboard?year=2026&month=11&view=days&section=Bicicletas
Authorization: Bearer {{token}}
```

Parámetros opcionales: `year` (2000–2100), `month` (1–12), `view` (`days` o `months`) y `section` (por ejemplo, `Bicicletas`, `Componentes`, `Accesorios` o `Todas`). La vista mensual resume el año; la diaria puede filtrar un mes.

Para obtener las filas del informe:

```http
GET http://localhost:3000/api/admin/dashboard/export?year=2026&month=11&view=days
Authorization: Bearer {{token}}
```

## 10. Casos negativos y controles de acceso

Prueba también estas respuestas esperadas para verificar validaciones y permisos:

| Prueba | Resultado esperado |
|---|---|
| Usar un token de cliente en `/products/manage` o `/admin/users` | `403` |
| Enviar token inválido o expirado | `401` |
| Registrar un correo ya existente | `409` |
| Registrar sin aceptar términos o con contraseña menor de 8 caracteres | `400` |
| Crear producto con precio no positivo, stock negativo o categoría inexistente | `400` |
| Crear producto sin imagen | `400` |
| Enviar archivo distinto de JPG/PNG/WEBP o mayor de 20 MB | `400` |
| Crear o promover admin sin `adminPassword` correcta | `403` |
| Comprar sin `items`, con talla no configurada o sin stock suficiente | `400` o `409` |
| Enviar tarjeta que no pasa Luhn, vencida o CVV que no tenga 3 dígitos | `400` |
| Enviar motivo vacío al inactivar un producto | `400` |

Las respuestas de error usan el formato `{ "ok": false, "message": "..." }`. El carrito solo existe en el navegador; no hay rutas API para consultarlo, modificarlo o borrarlo. Para productos y usuarios la API utiliza baja lógica por `PATCH`, no borrado físico. Las rutas implementadas se definen en `backend/src/routes`.

## 11. Secuencia recomendada de prueba integral

1. Ejecuta `GET http://localhost:3000/api/health` y confirma `200`.
2. Ejecuta `POST http://localhost:3000/api/auth/login` con credenciales de administrador y guarda su JWT en `token`.
3. Consulta `GET http://localhost:3000/api/products/categories`; crea un producto con nombre único y guarda `data.id` como `productId`.
4. Inicia sesión como cliente con `POST http://localhost:3000/api/auth/login` y reemplaza `token` por el JWT del cliente.
5. Ejecuta `POST http://localhost:3000/api/orders` con los datos de envío y `items` del ejemplo; la API valida stock y precio.
6. Consulta `GET http://localhost:3000/api/orders/mine` para verificar el pedido.
7. Vuelve a iniciar sesión como admin, reemplaza `token` y consulta `GET http://localhost:3000/api/products/{{productId}}` para revisar el stock.
8. Inactiva el producto con `PATCH http://localhost:3000/api/products/{{productId}}/deactivate` y comprueba que ya no aparece en el catálogo público.
