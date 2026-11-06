# Pruebas de API BikeStore con Postman o RapidAPI Client

Guía de referencia para probar manualmente la API REST local. Los ejemplos usan JSON, salvo las operaciones de imagen de producto, que usan `multipart/form-data`.

> Ejecuta estas pruebas únicamente contra una instancia local o un entorno para el que tengas autorización. Los pagos son simulados: no envíes datos de tarjetas reales.

## 1. Preparar el entorno

Desde PowerShell, inicia el backend:

```powershell
cd backend
npm run dev
```

La URL base local es `http://localhost:3000`. Crea un entorno en Postman o RapidAPI Client con estas variables:

| Variable | Valor inicial |
|---|---|
| `baseUrl` | `http://localhost:3000/api` |
| `adminToken` | (vacío; se guarda al iniciar sesión como administrador) |
| `clientToken` | (vacío; se guarda al iniciar sesión como cliente) |
| `productId` | (ID de un producto de prueba) |
| `cartItemId` | (ID devuelto al agregar un producto al carrito) |
| `userId` | (ID de un usuario de prueba) |

Para rutas protegidas, agrega el encabezado:

```http
Authorization: Bearer {{clientToken}}
```

Usa `{{adminToken}}` en rutas administrativas. Para enviar JSON configura `Content-Type: application/json`. En solicitudes multipart, el cliente debe generar automáticamente el `Content-Type` con su boundary.

## 2. Estado y catálogo público

### Comprobar que la API responde

```http
GET {{baseUrl}}/health
```

No requiere autenticación. Respuesta esperada: `200`.

### Listar productos activos

```http
GET {{baseUrl}}/products
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
GET {{baseUrl}}/products?section=Bicicletas&sort=asc
```

### Consultar categorías

```http
GET {{baseUrl}}/products/categories
```

### Consultar un producto

```http
GET {{baseUrl}}/products/{{productId}}
```

Las rutas públicas solo devuelven productos activos. Si el ID no existe o está inactivo, la API responde `404`.

## 3. Registro e inicio de sesión

### Registrar un cliente

```http
POST {{baseUrl}}/auth/register
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
POST {{baseUrl}}/auth/login
Content-Type: application/json
```

```json
{
  "email": "cliente.pruebas@example.com",
  "password": "PruebasBike2026!"
}
```

La respuesta contiene `user` y `token`. Guarda el token en la variable `clientToken`. Para iniciar sesión como administrador local, usa las credenciales definidas por `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD` en `backend/.env` (en la configuración de ejemplo son `admin@bikestore.local` y `BikeStoreAdmin2026!`); guarda ese token en `adminToken`.

Errores de autenticación esperados: credenciales incorrectas `401`; cuenta inactiva `403`.

### Consultar y actualizar el perfil propio

```http
GET {{baseUrl}}/auth/me
Authorization: Bearer {{clientToken}}
```

```http
PATCH {{baseUrl}}/auth/me
Authorization: Bearer {{clientToken}}
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
   POST {{baseUrl}}/auth/password/forgot
   Content-Type: application/json
   ```

   ```json
   { "email": "cliente.pruebas@example.com" }
   ```

2. Verificar el código de seis dígitos recibido por correo:

   ```http
   POST {{baseUrl}}/auth/password/verify
   Content-Type: application/json
   ```

   ```json
   { "email": "cliente.pruebas@example.com", "code": "123456" }
   ```

   Guarda el `resetToken` de la respuesta.

3. Cambiar la contraseña:

   ```http
   POST {{baseUrl}}/auth/password/reset
   Content-Type: application/json
   ```

   ```json
   { "resetToken": "<resetToken recibido>", "password": "NuevaClaveBike2026!" }
   ```

El código vence a los 15 minutos, permite hasta cinco intentos y el token de cambio vence a los 10 minutos. Si SMTP no está configurado, la solicitud devuelve `503`.

## 5. Productos: lectura y CRUD administrativo

Estas operaciones requieren `adminToken`. No existe una ruta `DELETE` física de productos: el producto se conserva y se inactiva mediante `PATCH`.

### Listar productos de administración

```http
GET {{baseUrl}}/products/manage?search=bici&section=Bicicletas&status=Activo
Authorization: Bearer {{adminToken}}
```

Los filtros `search`, `section` y `status` son opcionales. `status` puede ser `Activo`/`Inactivo` o `active`/`inactive`.

### Crear producto

Para crear un producto sin subir archivo, envía JSON y una imagen existente (por ejemplo, `/assets/products/img-005.jpg`):

```http
POST {{baseUrl}}/products
Authorization: Bearer {{adminToken}}
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
  "badge": "Prueba",
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
| `image` | File | Selecciona una imagen JPG, PNG o WEBP (máximo 20 MB) |

El campo de archivo debe llamarse exactamente `image`. Para las tallas, envía un arreglo JSON serializado como texto.

### Actualizar producto

```http
PUT {{baseUrl}}/products/{{productId}}
Authorization: Bearer {{adminToken}}
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
  "badge": "Actualizado",
  "sizes": ["M", "L", "XL"]
}
```

El backend conserva los valores existentes cuando no se envían, pero se recomienda incluir los campos principales. La propiedad `sizes`, si se envía, reemplaza las tallas existentes.

### Inactivar producto (baja lógica)

```http
PATCH {{baseUrl}}/products/{{productId}}/deactivate
Authorization: Bearer {{adminToken}}
Content-Type: application/json
```

```json
{ "reason": "Producto temporal creado para las pruebas." }
```

No se borra físicamente. Después de inactivarlo, comprueba que ya no aparece en `GET /products` y sí aparece en `GET /products/manage?status=Inactivo`.

## 6. Carrito (cliente autenticado)

Todas estas operaciones requieren `clientToken`.

### Consultar carrito

```http
GET {{baseUrl}}/cart
Authorization: Bearer {{clientToken}}
```

### Agregar producto

```http
POST {{baseUrl}}/cart/items
Authorization: Bearer {{clientToken}}
Content-Type: application/json
```

```json
{
  "productId": {{productId}},
  "quantity": 2,
  "selectedSize": "M"
}
```

`selectedSize` debe coincidir con una talla configurada para el producto. Si el producto no tiene tallas, puede omitirse. La respuesta incluye el carrito en `data`; guarda el `cartItemId` del elemento para las siguientes pruebas. Si la cantidad solicitada supera el stock, puede ajustarse al stock y la respuesta incluye `adjusted: true`.

### Actualizar cantidad

```http
PATCH {{baseUrl}}/cart/items/{{cartItemId}}
Authorization: Bearer {{clientToken}}
Content-Type: application/json
```

```json
{ "quantity": 1 }
```

La cantidad debe ser un entero positivo y no superar el stock disponible.

### Quitar un producto del carrito

```http
DELETE {{baseUrl}}/cart/items/{{cartItemId}}
Authorization: Bearer {{clientToken}}
```

El carrito de visitantes del frontend se guarda localmente; esta API de carrito solo acepta usuarios autenticados con rol de cliente.

## 7. Pedidos y pago simulado

### Crear pedido y descontar stock

Primero inicia sesión como cliente y agrega uno o más productos al carrito. Luego envía:

```http
POST {{baseUrl}}/orders
Authorization: Bearer {{clientToken}}
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
  "cvv": "123"
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
  "bankName": "Bancolombia"
}
```

El pago es simulado. No se guardan el número de tarjeta, vencimiento ni CVV. La tarjeta debe pasar Luhn, el vencimiento debe estar vigente en formato `MM/AA` y el CVV debe tener exactamente tres dígitos. En un checkout correcto la respuesta es `201`, el stock baja dentro de la transacción y el carrito se vacía. Guarda `data.orderNumber` para identificar el pedido.

### Consultar historial de pedidos

```http
GET {{baseUrl}}/orders/mine
Authorization: Bearer {{clientToken}}
```

Un administrador también puede consultar su propio historial con su token; la ruta no lista pedidos de todos los usuarios.

## 8. Usuarios administrados (solo administrador)

### Listar usuarios

```http
GET {{baseUrl}}/admin/users?search=cliente&status=Activo
Authorization: Bearer {{adminToken}}
```

Ambos parámetros son opcionales. `status` admite `Activo`/`Inactivo` o `active`/`inactive`.

### Crear usuario (administración)

```http
POST {{baseUrl}}/admin/users
Authorization: Bearer {{adminToken}}
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

`role` debe ser `cliente` o `admin`; la contraseña debe tener al menos ocho caracteres.

### Actualizar usuario

```http
PUT {{baseUrl}}/admin/users/{{userId}}
Authorization: Bearer {{adminToken}}
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
PATCH {{baseUrl}}/admin/users/{{userId}}/deactivate
Authorization: Bearer {{adminToken}}
```

No hay borrado físico de usuarios. El sistema impide inactivar o degradar al último administrador activo.

## 9. Dashboard administrativo

Requiere `adminToken`.

```http
GET {{baseUrl}}/admin/dashboard?year=2026&month=11&view=days&section=Bicicletas
Authorization: Bearer {{adminToken}}
```

Parámetros opcionales: `year` (2000–2100), `month` (1–12), `view` (`days` o `months`) y `section` (por ejemplo, `Bicicletas`, `Componentes`, `Accesorios` o `Todas`). La vista mensual resume el año; la diaria puede filtrar un mes.

Para obtener las filas del informe:

```http
GET {{baseUrl}}/admin/dashboard/export?year=2026&month=11&view=days
Authorization: Bearer {{adminToken}}
```

## 10. Casos negativos y controles de acceso

Prueba también estas respuestas esperadas para verificar validaciones y permisos:

| Prueba | Resultado esperado |
|---|---|
| Llamar a `/cart` sin token | `401` |
| Usar un token de cliente en `/products/manage` o `/admin/users` | `403` |
| Enviar token inválido o expirado | `401` |
| Registrar un correo ya existente | `409` |
| Registrar sin aceptar términos o con contraseña menor de 8 caracteres | `400` |
| Crear producto con precio no positivo, stock negativo o categoría inexistente | `400` |
| Crear producto sin imagen | `400` |
| Enviar archivo distinto de JPG/PNG/WEBP o mayor de 20 MB | `400` |
| Agregar cantidad no entera o mayor que el stock al carrito | Rechazo o ajuste explícito al stock |
| Comprar con carrito vacío o sin stock suficiente | `400` o `409` |
| Enviar tarjeta que no pasa Luhn, vencida o CVV que no tenga 3 dígitos | `400` |
| Enviar motivo vacío al inactivar un producto | `400` |

Las respuestas de error usan el formato `{ "ok": false, "message": "..." }`. Un verbo `DELETE` está disponible para quitar un ítem del carrito; para productos y usuarios la API utiliza baja lógica por `PATCH`, no borrado físico. Las rutas implementadas se definen en `backend/src/routes`.

## 11. Secuencia recomendada de prueba integral

1. `GET /health` y confirma `200`.
2. Inicia sesión como administrador y guarda `adminToken`.
3. Consulta `GET /products/categories`; crea un producto con nombre único y guarda `productId`.
4. Registra o inicia sesión como cliente y guarda `clientToken`.
5. Agrega el producto al carrito; guarda `cartItemId`.
6. Cambia la cantidad con `PATCH`, vuelve a consultar el carrito y comprueba el stock máximo.
7. Completa un pedido con datos simulados y comprueba `GET /orders/mine`.
8. Consulta el producto con el token de administrador para verificar que el stock disminuyó y que el carrito quedó vacío.
9. Inactiva el producto con motivo y comprueba su ausencia del catálogo público.

