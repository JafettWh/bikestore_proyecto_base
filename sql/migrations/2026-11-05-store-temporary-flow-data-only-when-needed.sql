USE bikestore;

-- Ejecutar una sola vez despues de align-spanish-table-names.
-- Los carritos de visitantes ya viven en el navegador; elimina cualquier
-- carrito temporal antiguo antes de exigir un usuario registrado.
DELETE FROM carrito WHERE id_usuario IS NULL;

ALTER TABLE carrito
  DROP CHECK chk_cart_owner,
  DROP INDEX guest_key,
  DROP COLUMN guest_key,
  MODIFY id_usuario BIGINT UNSIGNED NOT NULL;

-- Mantiene, como maximo, el ultimo codigo de recuperacion vigente por usuario.
ALTER TABLE usuario
  ADD COLUMN codigo_recuperacion_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NULL,
  ADD COLUMN codigo_recuperacion_vence DATETIME NULL,
  ADD COLUMN intentos_recuperacion TINYINT UNSIGNED NOT NULL DEFAULT 0,
  ADD COLUMN codigo_recuperacion_verificado_en DATETIME NULL;

UPDATE usuario u
JOIN codigo_recuperacion_contrasena c ON c.user_id = u.id_usuario
SET u.codigo_recuperacion_hash = c.code_hash,
    u.codigo_recuperacion_vence = c.expires_at,
    u.intentos_recuperacion = c.attempts,
    u.codigo_recuperacion_verificado_en = c.verified_at
WHERE c.id = (
  SELECT MAX(c2.id)
  FROM codigo_recuperacion_contrasena c2
  WHERE c2.user_id = u.id_usuario
    AND c2.used_at IS NULL
    AND c2.expires_at > NOW()
    AND c2.attempts < 5
);

DROP TABLE codigo_recuperacion_contrasena;

-- Solo se registra un pago simulado exitoso dentro de la transaccion del pedido.
ALTER TABLE pago
  DROP COLUMN estado_pago,
  DROP COLUMN is_simulated;
