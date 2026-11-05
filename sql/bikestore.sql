CREATE DATABASE IF NOT EXISTS bikestore
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE bikestore;

CREATE TABLE IF NOT EXISTS roles (
  id_rol INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre_rol ENUM('admin', 'cliente') NOT NULL UNIQUE,
  crud_create BOOLEAN NOT NULL DEFAULT FALSE,
  crud_read BOOLEAN NOT NULL DEFAULT TRUE,
  crud_update BOOLEAN NOT NULL DEFAULT FALSE,
  crud_delete BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO roles (nombre_rol, crud_create, crud_read, crud_update, crud_delete)
VALUES
  ('admin', TRUE, TRUE, TRUE, TRUE),
  ('cliente', FALSE, TRUE, FALSE, FALSE)
ON DUPLICATE KEY UPDATE
  crud_create = VALUES(crud_create),
  crud_read = VALUES(crud_read),
  crud_update = VALUES(crud_update),
  crud_delete = VALUES(crud_delete);

CREATE TABLE IF NOT EXISTS users (
  id_usuario BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_rol INT UNSIGNED NOT NULL,
  nombre_usuario VARCHAR(120) NOT NULL,
  correo_usuario VARCHAR(254) NOT NULL UNIQUE,
  `contraseña_hash` VARCHAR(255) NOT NULL,
  telefono_usuario VARCHAR(32) NULL,
  direccion_detallada VARCHAR(255) NULL,
  barrio VARCHAR(120) NULL,
  ciudad VARCHAR(100) NULL,
  departamento VARCHAR(100) NULL,
  terms_accepted_at DATETIME NULL,
  estado_usuario ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_role FOREIGN KEY (id_rol) REFERENCES roles(id_rol),
  INDEX idx_users_status_role (estado_usuario, id_rol)
);

CREATE TABLE IF NOT EXISTS sections (
  id_seccion INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre_seccion VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS categories (
  id_categoria INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_seccion INT UNSIGNED NOT NULL,
  nombre_categoria VARCHAR(80) NOT NULL,
  UNIQUE KEY uq_category_section_name (id_seccion, nombre_categoria),
  UNIQUE KEY uq_categories_id_section (id_categoria, id_seccion),
  CONSTRAINT fk_categories_section FOREIGN KEY (id_seccion) REFERENCES sections(id_seccion)
);

INSERT INTO sections (nombre_seccion)
VALUES ('Bicicletas'), ('Componentes'), ('Accesorios')
ON DUPLICATE KEY UPDATE nombre_seccion = VALUES(nombre_seccion);

INSERT INTO categories (id_seccion, nombre_categoria)
SELECT s.id_seccion, c.nombre_categoria
FROM sections s
JOIN (
  SELECT 'Bicicletas' AS section_name, 'Montaña' AS nombre_categoria UNION ALL
  SELECT 'Bicicletas', 'Carretera / Ruta' UNION ALL
  SELECT 'Bicicletas', 'Carretera / Endurance' UNION ALL
  SELECT 'Bicicletas', 'Gravel' UNION ALL
  SELECT 'Bicicletas', 'E-Bike' UNION ALL
  SELECT 'Componentes', 'Transmisión' UNION ALL
  SELECT 'Componentes', 'Bielas' UNION ALL
  SELECT 'Componentes', 'Ruedas' UNION ALL
  SELECT 'Componentes', 'Asiento' UNION ALL
  SELECT 'Componentes', 'Manubrio' UNION ALL
  SELECT 'Componentes', 'Cassette' UNION ALL
  SELECT 'Accesorios', 'Iluminación' UNION ALL
  SELECT 'Accesorios', 'Protección' UNION ALL
  SELECT 'Accesorios', 'Hidratación' UNION ALL
  SELECT 'Accesorios', 'Tecnología' UNION ALL
  SELECT 'Accesorios', 'Herramientas' UNION ALL
  SELECT 'Accesorios', 'Sensores'
) c ON c.section_name = s.nombre_seccion
ON DUPLICATE KEY UPDATE nombre_categoria = VALUES(nombre_categoria);

CREATE TABLE IF NOT EXISTS products (
  id_producto BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_seccion INT UNSIGNED NOT NULL,
  id_categoria INT UNSIGNED NOT NULL,
  nombre_producto VARCHAR(160) NOT NULL,
  descripcion_general TEXT NOT NULL,
  especificaciones_tecnicas JSON NULL,
  precio_producto DECIMAL(12, 2) NOT NULL,
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  imagen_producto VARCHAR(500) NULL,
  badge VARCHAR(40) NULL,
  estado_producto ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  motivo_inactivacion VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_section FOREIGN KEY (id_seccion) REFERENCES sections(id_seccion),
  CONSTRAINT fk_products_category FOREIGN KEY (id_categoria) REFERENCES categories(id_categoria),
  CONSTRAINT fk_products_category_section
    FOREIGN KEY (id_categoria, id_seccion) REFERENCES categories(id_categoria, id_seccion),
  CONSTRAINT chk_products_price CHECK (precio_producto > 0),
  CONSTRAINT chk_products_stock CHECK (stock >= 0),
  INDEX idx_products_status_category (estado_producto, id_categoria),
  FULLTEXT INDEX idx_products_search (nombre_producto, descripcion_general)
);

CREATE TABLE IF NOT EXISTS product_images (
  id_imagen BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_producto BIGINT UNSIGNED NOT NULL,
  url_imagen VARCHAR(500) NOT NULL,
  position SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT fk_product_images_product FOREIGN KEY (id_producto) REFERENCES products(id_producto) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_sizes (
  id_talla BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_producto BIGINT UNSIGNED NOT NULL,
  nombre_talla VARCHAR(40) NOT NULL,
  UNIQUE KEY uq_product_size (id_producto, nombre_talla),
  CONSTRAINT fk_product_sizes_product FOREIGN KEY (id_producto) REFERENCES products(id_producto) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS carts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_usuario BIGINT UNSIGNED NULL UNIQUE,
  guest_key CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_carts_user FOREIGN KEY (id_usuario) REFERENCES users(id_usuario) ON DELETE CASCADE,
  CONSTRAINT chk_cart_owner CHECK (
    (id_usuario IS NOT NULL AND guest_key IS NULL) OR
    (id_usuario IS NULL AND guest_key IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS cart_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cart_id BIGINT UNSIGNED NOT NULL,
  id_producto BIGINT UNSIGNED NOT NULL,
  selected_size VARCHAR(40) NOT NULL DEFAULT '',
  quantity INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_cart_product_size (cart_id, id_producto, selected_size),
  CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_product FOREIGN KEY (id_producto) REFERENCES products(id_producto),
  CONSTRAINT chk_cart_item_quantity CHECK (quantity > 0)
);

CREATE TABLE IF NOT EXISTS orders (
  id_pedido BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(32) NOT NULL UNIQUE,
  id_usuario BIGINT UNSIGNED NOT NULL,
  estado_pedido ENUM('paid', 'cancelled') NOT NULL DEFAULT 'paid',
  subtotal DECIMAL(12, 2) NOT NULL,
  shipping DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL,
  nombre_destinatario VARCHAR(120) NOT NULL,
  correo_destinatario VARCHAR(254) NOT NULL,
  telefono_destinatario VARCHAR(32) NOT NULL,
  dp_direccion_detallada VARCHAR(255) NOT NULL,
  dp_barrio VARCHAR(120) NULL,
  dp_ciudad VARCHAR(100) NOT NULL,
  dp_departamento VARCHAR(100) NOT NULL,
  metodo_pago ENUM('card', 'pse') NOT NULL,
  fecha_pedido TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (id_usuario) REFERENCES users(id_usuario),
  INDEX idx_orders_date_status (fecha_pedido, estado_pedido),
  INDEX idx_orders_user_date (id_usuario, fecha_pedido)
);

CREATE TABLE IF NOT EXISTS order_items (
  id_detalle_pedido BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_pedido BIGINT UNSIGNED NOT NULL,
  id_producto BIGINT UNSIGNED NOT NULL,
  nombre_producto VARCHAR(160) NOT NULL,
  cantidad INT UNSIGNED NOT NULL,
  precio_unitario DECIMAL(12, 2) NOT NULL,
  selected_size VARCHAR(40) NULL,
  CONSTRAINT fk_order_items_order FOREIGN KEY (id_pedido) REFERENCES orders(id_pedido) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (id_producto) REFERENCES products(id_producto),
  CONSTRAINT chk_order_item_quantity CHECK (cantidad > 0),
  INDEX idx_order_items_product (id_producto)
);

CREATE TABLE IF NOT EXISTS payments (
  id_pago BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_pedido BIGINT UNSIGNED NOT NULL UNIQUE,
  valor_pago DECIMAL(12, 2) NOT NULL,
  metodo_pago ENUM('card', 'pse') NOT NULL,
  estado_pago ENUM('approved', 'rejected') NOT NULL,
  banco_origen VARCHAR(100) NULL,
  is_simulated BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_pago TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_order FOREIGN KEY (id_pedido) REFERENCES orders(id_pedido)
);

CREATE TABLE IF NOT EXISTS password_reset_codes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  code_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  expires_at DATETIME NOT NULL,
  attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  verified_at DATETIME NULL,
  used_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reset_codes_user FOREIGN KEY (user_id) REFERENCES users(id_usuario) ON DELETE CASCADE,
  INDEX idx_reset_user_expiry (user_id, expires_at)
);

INSERT INTO products (id_seccion, id_categoria, nombre_producto, descripcion_general, especificaciones_tecnicas, precio_producto, stock, imagen_producto, badge)
SELECT s.id_seccion, c.id_categoria, seed.name, seed.description, seed.specs, seed.price, seed.stock, seed.image, seed.badge
FROM (
  SELECT 'Bicicletas' AS section_name, 'Montaña' AS category_name,
    'Bicicleta de montaña con cuadro de carbono y suspensión para rutas exigentes.' AS name,
    'Bicicleta de montaña con cuadro de carbono y suspensión para rutas exigentes.' AS description,
    JSON_OBJECT('cuadro', 'Carbono', 'suspension', 'Delantera') AS specs,
    4599000 AS price, 5 AS stock, '/assets/products/img-030.jpg' AS image, 'Nuevo' AS badge
  UNION ALL
  SELECT 'Bicicletas', 'Carretera / Ruta', 'Bicicleta de ruta de alto rendimiento',
    'Bicicleta de ruta ligera para entrenamiento y competencia.',
    JSON_OBJECT('cuadro', 'Carbono', 'transmision', '12 velocidades'),
    5200000, 3, '/assets/products/img-031.jpg', 'Más Vendido'
  UNION ALL
  SELECT 'Bicicletas', 'Gravel', 'Bicicleta gravel para aventura',
    'Bicicleta versátil para carretera y caminos destapados.',
    JSON_OBJECT('cuadro', 'Carbono', 'uso', 'Gravel'),
    2899000, 7, '/assets/products/img-033.jpg', 'Aventura'
  UNION ALL
  SELECT 'Componentes', 'Ruedas', 'Ruedas de carbono para bicicleta',
    'Juego de ruedas tubeless ready.',
    JSON_OBJECT('material', 'Carbono', 'tipo', 'Tubeless'),
    2450000, 4, '/assets/products/img-013.jpg', NULL
  UNION ALL
  SELECT 'Accesorios', 'Protección', 'Casco de ciclismo con sistema MIPS',
    'Casco liviano con ventilación optimizada y protección MIPS.',
    JSON_OBJECT('proteccion', 'MIPS'),
    620000, 10, '/assets/products/img-018.jpg', 'Seguridad'
) seed
JOIN sections s ON s.nombre_seccion = seed.section_name
JOIN categories c ON c.id_seccion = s.id_seccion AND c.nombre_categoria = seed.category_name
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

INSERT INTO product_sizes (id_producto, nombre_talla)
SELECT p.id_producto, sizes.name
FROM products p
JOIN (
  SELECT 'Specialized Stumpjumper Pro Carbon Trail' AS product_name, 'S' AS name UNION ALL
  SELECT 'Specialized Stumpjumper Pro Carbon Trail', 'M' UNION ALL
  SELECT 'Specialized Stumpjumper Pro Carbon Trail', 'L' UNION ALL
  SELECT 'Specialized Stumpjumper Pro Carbon Trail', 'XL' UNION ALL
  SELECT 'Trek Émonda SLR 7 Disc Di2', '54 cm' UNION ALL
  SELECT 'Trek Émonda SLR 7 Disc Di2', '56 cm'
) sizes ON sizes.product_name = p.nombre_producto
ON DUPLICATE KEY UPDATE nombre_talla = VALUES(nombre_talla);
