USE bikestore;

-- Ejecutar una sola vez sobre el esquema anterior al modelo actual.
ALTER TABLE roles
  ADD COLUMN crud_create BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN crud_read BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN crud_update BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN crud_delete BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE roles
SET crud_create = (name = 'admin'),
    crud_read = TRUE,
    crud_update = (name = 'admin'),
    crud_delete = (name = 'admin');

ALTER TABLE categories
  ADD UNIQUE KEY uq_categories_id_section (id, section_id);

ALTER TABLE products
  ADD COLUMN section_id INT UNSIGNED NULL AFTER category_id;

UPDATE products p
JOIN categories c ON c.id = p.category_id
SET p.section_id = c.section_id;

ALTER TABLE products
  MODIFY section_id INT UNSIGNED NOT NULL,
  ADD CONSTRAINT fk_products_section
    FOREIGN KEY (section_id) REFERENCES sections(id),
  ADD CONSTRAINT fk_products_category_section
    FOREIGN KEY (category_id, section_id) REFERENCES categories(id, section_id);
