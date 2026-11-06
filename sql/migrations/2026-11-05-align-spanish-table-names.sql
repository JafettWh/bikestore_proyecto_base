USE bikestore;

-- Ejecutar una sola vez despues de las migraciones align-role-product-model
-- y align-model-attributes para renombrar las tablas del esquema existente.
RENAME TABLE
  roles TO rol,
  users TO usuario,
  sections TO seccion,
  categories TO categoria,
  products TO producto,
  product_images TO imagen,
  product_sizes TO talla,
  carts TO carrito,
  cart_items TO detalle_carrito,
  orders TO pedido,
  order_items TO detalle_pedido,
  payments TO pago,
  password_reset_codes TO codigo_recuperacion_contrasena;
