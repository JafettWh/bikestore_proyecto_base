USE bikestore;

ALTER TABLE pedido
  ADD COLUMN estado_logistico ENUM('empaquetado', 'en camino', 'entregado', 'retornado')
  NOT NULL DEFAULT 'empaquetado'
  AFTER estado_pedido;
