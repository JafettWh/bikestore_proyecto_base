# BikeStore – Frontend

Tienda virtual de bicicletas deportivas y accesorios. React 19 + Vite + Tailwind CSS 4.

## Estructura

```
Frontend/
├── public/assets/        Imágenes (logo y productos). Se copian tal cual a dist/
├── src/
│   ├── assets/styles.css Todos los estilos: globales y los de cada componente/página
│   ├── components/       Componentes reutilizables (Header, Footer, ProductCard, modales, Button...)
│   ├── config/env.js     Variables de entorno y helper asset() para rutas de imágenes
│   ├── context/          AuthContext y CartContext (estado global)
│   ├── data/             Catálogo y datos de ejemplo
│   ├── hooks/            useAuth y useCart
│   ├── pages/            Vistas: Home, detalle, carrito, checkout, éxito, acceso, administración
│   ├── utils/            Formateo de moneda y exportación a Excel/PDF
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── index.html
├── package.json
└── vite.config.js
```

## Ejecutar en desarrollo

Requiere Node.js 20.19 o superior.

```bash
cd Frontend
cp .env.example .env     # en Windows: copy .env.example .env
npm install
npm run dev              # http://localhost:5173
```

En Windows también puedes hacer doble clic en `iniciar.bat` (en la raíz del proyecto).

## Publicar en cualquier servidor

```bash
npm run build
```

Se genera la carpeta `dist/` con HTML, CSS y JS estáticos. Sube su contenido a cualquier
servidor web (Apache/XAMPP, Nginx, IIS, hosting compartido, Netlify, GitHub Pages...).
Funciona en la raíz del dominio o dentro de una subcarpeta (`https://sitio.com/bikestore/`)
porque `vite.config.js` usa `base: "./"` y las imágenes se resuelven con `asset()`.
La navegación es interna (sin rutas en la URL), por lo que no necesita reglas de reescritura.

Para probar el resultado compilado en local: `npm run preview` (http://localhost:4173).

## Notas del prototipo

- Los datos (usuarios, catálogo, carrito, pedidos) se guardan en `localStorage`; no hay backend aún.
- El inicio de sesión es simulado: acepta cualquier contraseña. Usuarios de ejemplo: `a.silva@bikestore.com` y
  `jafet.h@bikestore.com` (administradores), `beatriz.m@gmail.com` (cliente).
- La vista de administración está protegida con `ProtectedRoute` y solo abre para el rol `admin`.
- Las fuentes (Inter y Barlow Condensed) se cargan desde Google Fonts; sin internet se usa una fuente del sistema.

## Estilos

Todo el CSS vive en `src/assets/styles.css`, y cada componente y página lo importa
(`import "../assets/styles.css"`). Cada elemento tiene su propia clase (por ejemplo
`product-card-button-3`, `header-nav-1`) definida en la sección "Estilos de componentes y páginas",
agrupada por archivo. Las reglas usan `@apply` de Tailwind 4, así que para cambiar un color, tamaño o
espaciado se edita esa clase en `styles.css`, no el JSX. Los antiguos `style={{ }}` en línea están
al final del archivo.
