USE bikestore;

-- Prevents a retried guest-cart import from merging the same items twice.
ALTER TABLE usuario
  ADD COLUMN ultimo_carrito_importado_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL;
