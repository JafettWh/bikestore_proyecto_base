USE bikestore;

DROP TABLE IF EXISTS detalle_carrito;
DROP TABLE IF EXISTS carrito;

SET @drop_cart_import_column_sql = (
  SELECT IF(
    COUNT(*) > 0,
    'ALTER TABLE usuario DROP COLUMN ultimo_carrito_importado_id',
    'SELECT 1'
  )
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'usuario'
    AND column_name = 'ultimo_carrito_importado_id'
);
PREPARE drop_cart_import_column_stmt FROM @drop_cart_import_column_sql;
EXECUTE drop_cart_import_column_stmt;
DEALLOCATE PREPARE drop_cart_import_column_stmt;