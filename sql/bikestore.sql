CREATE DATABASE IF NOT EXISTS bikestore
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE bikestore;

CREATE TABLE IF NOT EXISTS roles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name ENUM('admin', 'cliente') NOT NULL UNIQUE,
  crud_create BOOLEAN NOT NULL DEFAULT FALSE,
  crud_read BOOLEAN NOT NULL DEFAULT TRUE,
  crud_update BOOLEAN NOT NULL DEFAULT FALSE,
  crud_delete BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO roles (name, crud_create, crud_read, crud_update, crud_delete)
VALUES
  ('admin', TRUE, TRUE, TRUE, TRUE),
  ('cliente', FALSE, TRUE, FALSE, FALSE)
ON DUPLICATE KEY UPDATE
  crud_create = VALUES(crud_create),
  crud_read = VALUES(crud_read),
  crud_update = VALUES(crud_update),
  crud_delete = VALUES(crud_delete);

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_id INT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(254) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(32) NULL,
  address VARCHAR(255) NULL,
  neighborhood VARCHAR(120) NULL,
  city VARCHAR(100) NULL,
  department VARCHAR(100) NULL,
  terms_accepted_at DATETIME NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id),
  INDEX idx_users_status_role (status, role_id)
);

CREATE TABLE IF NOT EXISTS sections (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  section_id INT UNSIGNED NOT NULL,
  name VARCHAR(80) NOT NULL,
  UNIQUE KEY uq_category_section_name (section_id, name),
  UNIQUE KEY uq_categories_id_section (id, section_id),
  CONSTRAINT fk_categories_section FOREIGN KEY (section_id) REFERENCES sections(id)
);

INSERT INTO sections (name)
VALUES ('Bicicletas'), ('Componentes'), ('Accesorios')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO categories (section_id, name)
SELECT s.id, c.name
FROM sections s
JOIN (
  SELECT 'Bicicletas' AS section_name, 'Montaña' AS name UNION ALL
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
) c ON c.section_name = s.name
ON DUPLICATE KEY UPDATE name = VALUES(name);

CREATE TABLE IF NOT EXISTS products (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  section_id INT UNSIGNED NOT NULL,
  category_id INT UNSIGNED NOT NULL,
  name VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  technical_specs JSON NULL,
  price DECIMAL(12, 2) NOT NULL,
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  image_url VARCHAR(500) NULL,
  badge VARCHAR(40) NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  inactivation_reason VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_section FOREIGN KEY (section_id) REFERENCES sections(id),
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id),
  CONSTRAINT fk_products_category_section
    FOREIGN KEY (category_id, section_id) REFERENCES categories(id, section_id),
  CONSTRAINT chk_products_price CHECK (price > 0),
  CONSTRAINT chk_products_stock CHECK (stock >= 0),
  INDEX idx_products_status_category (status, category_id),
  FULLTEXT INDEX idx_products_search (name, description)
);

CREATE TABLE IF NOT EXISTS product_images (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT UNSIGNED NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  position SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_sizes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(40) NOT NULL,
  UNIQUE KEY uq_product_size (product_id, name),
  CONSTRAINT fk_product_sizes_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS carts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL UNIQUE,
  guest_key CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_cart_owner CHECK (
    (user_id IS NOT NULL AND guest_key IS NULL) OR
    (user_id IS NULL AND guest_key IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS cart_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cart_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  selected_size VARCHAR(40) NOT NULL DEFAULT '',
  quantity INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_cart_product_size (cart_id, product_id, selected_size),
  CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT chk_cart_item_quantity CHECK (quantity > 0)
);

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(32) NOT NULL UNIQUE,
  user_id BIGINT UNSIGNED NOT NULL,
  status ENUM('paid', 'cancelled') NOT NULL DEFAULT 'paid',
  subtotal DECIMAL(12, 2) NOT NULL,
  shipping DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL,
  recipient_name VARCHAR(120) NOT NULL,
  recipient_email VARCHAR(254) NOT NULL,
  recipient_phone VARCHAR(32) NOT NULL,
  address VARCHAR(255) NOT NULL,
  neighborhood VARCHAR(120) NULL,
  city VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  payment_method ENUM('card', 'pse') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_orders_date_status (created_at, status),
  INDEX idx_orders_user_date (user_id, created_at)
);

CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  product_name VARCHAR(160) NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  selected_size VARCHAR(40) NULL,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT chk_order_item_quantity CHECK (quantity > 0),
  INDEX idx_order_items_product (product_id)
);

CREATE TABLE IF NOT EXISTS payments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL UNIQUE,
  amount DECIMAL(12, 2) NOT NULL,
  method ENUM('card', 'pse') NOT NULL,
  status ENUM('approved', 'rejected') NOT NULL,
  bank_name VARCHAR(100) NULL,
  is_simulated BOOLEAN NOT NULL DEFAULT TRUE,
  paid_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id)
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
  CONSTRAINT fk_reset_codes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_reset_user_expiry (user_id, expires_at)
);

INSERT INTO products (section_id, category_id, name, description, technical_specs, price, stock, image_url, badge)
SELECT s.id, c.id, seed.name, seed.description, seed.specs, seed.price, seed.stock, seed.image, seed.badge
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
JOIN sections s ON s.name = seed.section_name
JOIN categories c ON c.section_id = s.id AND c.name = seed.category_name
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

INSERT INTO product_sizes (product_id, name)
SELECT p.id, sizes.name
FROM products p
JOIN (
  SELECT 'Specialized Stumpjumper Pro Carbon Trail' AS product_name, 'S' AS name UNION ALL
  SELECT 'Specialized Stumpjumper Pro Carbon Trail', 'M' UNION ALL
  SELECT 'Specialized Stumpjumper Pro Carbon Trail', 'L' UNION ALL
  SELECT 'Specialized Stumpjumper Pro Carbon Trail', 'XL' UNION ALL
  SELECT 'Trek Émonda SLR 7 Disc Di2', '54 cm' UNION ALL
  SELECT 'Trek Émonda SLR 7 Disc Di2', '56 cm'
) sizes ON sizes.product_name = p.name
ON DUPLICATE KEY UPDATE name = VALUES(name);
