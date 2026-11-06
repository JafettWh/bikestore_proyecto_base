USE bikestore;

-- Ejecutar una sola vez despues de las migraciones existentes para conservar
-- los carritos guardados mientras se traducen sus columnas.
ALTER TABLE carrito
  RENAME COLUMN created_at TO fecha_creacion,
  RENAME COLUMN updated_at TO fecha_actualizacion;

ALTER TABLE detalle_carrito
  RENAME COLUMN cart_id TO id_carrito,
  RENAME COLUMN selected_size TO talla_seleccionada,
  RENAME COLUMN quantity TO cantidad,
  RENAME COLUMN created_at TO fecha_creacion,
  RENAME COLUMN updated_at TO fecha_actualizacion;
