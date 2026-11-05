# HU17 - Consulta del dashboard de métricas

**Prioridad:** Alta. Da al administrador una visión del desempeño comercial para decidir. El CU-13 la califica como *Vital*.

**Referencias:** RF-21, RF-22, RF-23, RF-24, RF-25; RNF-01, RNF-02, RNF-03, RNF-04, RNF-06; CU-13 (Consultar dashboard de métricas).

| **Como** | **Quiero** | **Para** |
| --- | --- | --- |
| Administrador de BikeStore | consultar un tablero con las ventas totales, los productos más vendidos, la cantidad de pedidos y las alertas de la operación, y filtrarlo por fechas y categorías | conocer el desempeño de la tienda y tomar decisiones informadas para hacer crecer el negocio |

#### **INVEST**

| **I** | **N** | **V** | **E** | **S** | **T** |
| --- | --- | --- | --- | --- | --- |
| Independiente en su alcance; requiere sesión de administrador (HU04 y HU06) y pedidos registrados (HU10) | Negociable: el tipo de gráfica, la disposición de las tarjetas y el listado de alertas pueden ajustarse | Valiosa: convierte los pedidos en información para decidir qué vender, cuánto y cuándo reponer | Estimable: el flujo está definido en el CU-13 y las consultas se basan en pedidos y su detalle | Pequeña: se limita a consultar y filtrar; la exportación es la HU19. Si resulta extensa para un Sprint, las alertas pueden pasar a una historia propia | Testeable: se verifica con pedidos de prueba, cambiando filtros y con periodos sin ventas |

#### **Criterios de Aceptación**

**Acceso** *(RNF-04; CU-13 precondición)*

* Solo el administrador con sesión iniciada debe poder acceder al dashboard.

**Métricas** *(RF-21, RF-22, RF-23, RF-24; CU-13 pasos 1-3)*

* Al ingresar, el sistema debe consultar la base de datos y calcular, para el mes en curso, las ventas totales, los productos más vendidos y la cantidad de pedidos.
* El sistema debe mostrar las ventas totales y la cantidad de pedidos en tarjetas, y los productos más vendidos como un ranking ordenado por unidades vendidas.
* El sistema debe mostrar el valor promedio por pedido como métrica complementaria.
* Solo deben contarse los pedidos pagados, tomados de la base de datos (RNF-06).
* Las ventas totales deben calcularse de la misma forma en las tarjetas, en la gráfica y en los informes exportados (HU19).

**Alertas** *(RF-21)*

* El sistema debe mostrar alertas de la operación comercial, entre ellas la cantidad de productos activos sin existencias.

**Evolución de las ventas** *(RF-22, RF-25)*

* El sistema debe presentar las ventas en una gráfica por días del mes o por meses del año, con los ejes rotulados y el valor visible al señalar cada barra.

**Filtros** *(RF-25; CU-13 pasos 4-5)*

* El sistema debe permitir filtrar por fecha (año y mes, con vista diaria o mensual) y por categoría de producto.
* Al aplicar un filtro, el sistema debe recalcular y actualizar todas las métricas (ventas totales, productos más vendidos y cantidad de pedidos) y la gráfica.

**Periodo sin datos** *(CU-13 flujo alterno 5.1)*

* Si el periodo seleccionado no tiene ventas, el sistema debe mostrar los valores en cero o indicar que no hay datos para ese periodo, y permitir cambiar el filtro.

**Requisitos no funcionales aplicables**

* La interfaz debe ser clara y consistente (RNF-01) y adaptarse a computadores, tabletas y móviles (RNF-02).
* El dashboard debe responder en un tiempo adecuado (RNF-03).

#### Escenarios Gherkin

**Característica:** Consulta del dashboard de métricas en el panel de administración de BikeStore

| **Escenario 1** | **Consulta del dashboard con ventas** |
| --- | --- |
| **Dado que** | existen pedidos pagados en el mes en curso y el administrador tiene sesión iniciada |
| **Cuando** | accede al dashboard |
| **Entonces** | el sistema muestra las ventas totales, el ranking de productos más vendidos y la cantidad de pedidos del mes |

| **Escenario 2** | **Filtro por fecha** |
| --- | --- |
| **Dado que** | el administrador se encuentra en el dashboard |
| **Cuando** | selecciona otro mes o año |
| **Entonces** | el sistema recalcula las métricas y la gráfica con los pedidos de ese periodo |

| **Escenario 3** | **Filtro por categoría** |
| --- | --- |
| **Dado que** | el administrador se encuentra en el dashboard |
| **Cuando** | selecciona una categoría de producto |
| **Entonces** | el sistema recalcula las métricas y la gráfica considerando solo los productos de esa categoría |

| **Escenario 4** | **Vista mensual del año** |
| --- | --- |
| **Dado que** | el administrador se encuentra en el dashboard |
| **Cuando** | cambia la vista a meses del año |
| **Entonces** | la gráfica muestra las ventas de cada mes del año seleccionado |

| **Escenario 5** | **Periodo sin datos** |
| --- | --- |
| **Dado que** | no existen pedidos en el periodo seleccionado |
| **Cuando** | el administrador aplica el filtro |
| **Entonces** | el sistema muestra los valores en cero o indica que no hay datos para ese periodo |

| **Escenario 6** | **Alerta de productos sin existencias** |
| --- | --- |
| **Dado que** | existen productos activos con existencias en cero |
| **Cuando** | el administrador consulta el dashboard |
| **Entonces** | el sistema muestra una alerta con la cantidad de productos sin existencias |

| **Escenario 7** | **Acceso no autorizado** |
| --- | --- |
| **Dado que** | el usuario no tiene rol de administrador |
| **Cuando** | intenta acceder al dashboard |
| **Entonces** | el sistema deniega el acceso |

#### Definition of Done (DoD)

* [ ] Tarjetas de ventas totales, cantidad de pedidos y valor promedio por pedido
* [ ] Ranking de productos más vendidos por unidades
* [ ] Alerta de productos activos sin existencias
* [ ] Gráfica de ventas por días del mes y por meses del año, con ejes rotulados
* [ ] Filtros por fecha y por categoría que recalculan métricas, ranking y gráfica
* [ ] Mensaje o valores en cero cuando el periodo no tiene datos
* [ ] Solo se cuentan pedidos pagados, con una definición única de ventas totales
* [ ] Consultas agregadas sobre pedidos y detalle de pedidos en la base de datos
* [ ] Endpoint protegido para el rol administrador
* [ ] La interfaz se adapta a computador, tableta y móvil
* [ ] Pruebas funcionales de los escenarios Gherkin ejecutadas y aprobadas
* [ ] Código versionado en GitHub y revisado

#### Aprobación del Product Owner

* [ ] Sí
* [ ] No
