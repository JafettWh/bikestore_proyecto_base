# BikeStore - Frontend

Tienda virtual de bicicletas y accesorios construida con React 19 + Vite. El catálogo, las cuentas, los carritos, pedidos, métricas e informes se consultan mediante la API Node/Express y MySQL; el navegador ya no admite contraseñas ni pedidos ficticios como fuente de verdad.

## Ejecutar localmente

Requiere Node.js 20.19 o superior y MySQL con el esquema importado (ver [backend/README.md](../backend/README.md)).

```powershell
cd backend
Copy-Item .env.example .env
npm install
npm run dev
```

En otra terminal:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Abre `http://localhost:5173`. La URL del API se configura en `frontend/.env` con `VITE_API_URL`. `iniciar.bat` también inicia ambas aplicaciones una vez preparados MySQL y los `.env`.

### Usuarios locales

El backend crea las cuentas de prueba configuradas en `backend/.env.example` la primera vez que inicia:

- Administrador: `admin@bikestore.local` / `BikeStoreAdmin2026!`
- Cliente: `cliente@bikestore.local` / `BikeStoreCliente2026!`

Cambia esas claves antes de compartir el entorno y no publiques un archivo `.env`.

## Funcionalidades conectadas

- Catálogo público activo, búsqueda, filtro combinado por sección/categoría, precio ascendente/descendente y detalle.
- Registro con nombre, correo, teléfono, contraseña, términos y condiciones; ingreso con JWT; perfil editable sin documento de identidad.
- Código de recuperación de un solo uso enviado por Gmail (requiere la configuración SMTP descrita en el README del backend).
- Carrito persistente por visitante/usuario; stock verificado en servidor.
- Compra de cliente con resumen, envío y pago simulado; las credenciales de tarjeta nunca se almacenan.
- CRUD administrativo de productos y usuarios, con inactivación lógica y restricción del último administrador activo.
- Dashboard e informes Excel/PDF que usan los mismos filtros y métricas calculadas sobre pedidos pagados.
- Campos de formularios sin datos de ejemplo precargados y bordes de campos/tarjetas con radio sutil de 5 px.

## Estructura

`src/api` y los contextos conectan React con la API; `src/pages` contiene las vistas; `src/components` los elementos reutilizables; `src/assets/styles.css` mantiene los estilos; `public/assets` contiene imágenes estáticas.

## Compilar

```powershell
npm run build
```

El resultado se genera en `dist/`. Las imágenes cargadas por administradores se sirven desde el backend bajo `/uploads`.
