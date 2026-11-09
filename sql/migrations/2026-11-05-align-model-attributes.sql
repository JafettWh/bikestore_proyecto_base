USE bikestore;

-- Ejecutar una sola vez sobre el esquema anterior, despues de la migracion
-- align-role-product-model si la base aun no tiene la relacion producto-seccion.
ALTER TABLE roles RENAME COLUMN id TO id_rol;
ALTER TABLE roles RENAME COLUMN name TO nombre_rol;

ALTER TABLE users RENAME COLUMN id TO id_usuario;
ALTER TABLE users RENAME COLUMN role_id TO id_rol;
ALTER TABLE users RENAME COLUMN name TO nombre_usuario;
ALTER TABLE users RENAME COLUMN email TO correo_usuario;
ALTER TABLE users RENAME COLUMN password_hash TO contraseña_hash;
ALTER TABLE users RENAME COLUMN phone TO telefono_usuario;
ALTER TABLE users RENAME COLUMN address TO direccion_detallada;
ALTER TABLE users RENAME COLUMN neighborhood TO barrio;
ALTER TABLE users RENAME COLUMN city TO ciudad;
ALTER TABLE users RENAME COLUMN department TO departamento;
ALTER TABLE users RENAME COLUMN status TO estado_usuario;

ALTER TABLE sections RENAME COLUMN id TO id_seccion;
ALTER TABLE sections RENAME COLUMN name TO nombre_seccion;

ALTER TABLE categories RENAME COLUMN id TO id_categoria;
ALTER TABLE categories RENAME COLUMN section_id TO id_seccion;
ALTER TABLE categories RENAME COLUMN name TO nombre_categoria;

ALTER TABLE products RENAME COLUMN id TO id_producto;
ALTER TABLE products RENAME COLUMN section_id TO id_seccion;
ALTER TABLE products RENAME COLUMN category_id TO id_categoria;
ALTER TABLE products RENAME COLUMN name TO nombre_producto;
ALTER TABLE products RENAME COLUMN description TO descripcion_general;
ALTER TABLE products RENAME COLUMN technical_specs TO especificaciones_tecnicas;
ALTER TABLE products RENAME COLUMN price TO precio_producto;
ALTER TABLE products RENAME COLUMN image_url TO imagen_producto;
ALTER TABLE products RENAME COLUMN status TO estado_producto;
ALTER TABLE products RENAME COLUMN inactivation_reason TO motivo_inactivacion;

ALTER TABLE product_images RENAME COLUMN id TO id_imagen;
ALTER TABLE product_images RENAME COLUMN product_id TO id_producto;
ALTER TABLE product_images RENAME COLUMN image_url TO url_imagen;

ALTER TABLE product_sizes RENAME COLUMN id TO id_talla;
ALTER TABLE product_sizes RENAME COLUMN product_id TO id_producto;
ALTER TABLE product_sizes RENAME COLUMN name TO nombre_talla;

ALTER TABLE carts RENAME COLUMN user_id TO id_usuario;
ALTER TABLE cart_items RENAME COLUMN product_id TO id_producto;

ALTER TABLE orders RENAME COLUMN id TO id_pedido;
ALTER TABLE orders RENAME COLUMN user_id TO id_usuario;
ALTER TABLE orders RENAME COLUMN status TO estado_pedido;
ALTER TABLE orders RENAME COLUMN recipient_name TO nombre_destinatario;
ALTER TABLE orders RENAME COLUMN recipient_email TO correo_destinatario;
ALTER TABLE orders RENAME COLUMN recipient_phone TO telefono_destinatario;
ALTER TABLE orders RENAME COLUMN address TO dp_direccion_detallada;
ALTER TABLE orders RENAME COLUMN neighborhood TO dp_barrio;
ALTER TABLE orders RENAME COLUMN city TO dp_ciudad;
ALTER TABLE orders RENAME COLUMN department TO dp_departamento;
ALTER TABLE orders RENAME COLUMN payment_method TO metodo_pago;
ALTER TABLE orders RENAME COLUMN created_at TO fecha_pedido;

ALTER TABLE order_items RENAME COLUMN id TO id_detalle_pedido;
ALTER TABLE order_items RENAME COLUMN order_id TO id_pedido;
ALTER TABLE order_items RENAME COLUMN product_id TO id_producto;
ALTER TABLE order_items RENAME COLUMN product_name TO nombre_producto;
ALTER TABLE order_items RENAME COLUMN quantity TO cantidad;
ALTER TABLE order_items RENAME COLUMN unit_price TO precio_unitario;

ALTER TABLE payments RENAME COLUMN id TO id_pago;
ALTER TABLE payments RENAME COLUMN order_id TO id_pedido;
ALTER TABLE payments RENAME COLUMN amount TO valor_pago;
ALTER TABLE payments RENAME COLUMN method TO metodo_pago;
ALTER TABLE payments RENAME COLUMN status TO estado_pago;
ALTER TABLE payments RENAME COLUMN bank_name TO banco_origen;
ALTER TABLE payments RENAME COLUMN paid_at TO fecha_pago;
