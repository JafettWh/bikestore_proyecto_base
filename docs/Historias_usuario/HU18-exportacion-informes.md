# HU18 - Exportación de informes en Excel o PDF

**Prioridad:** Alta. Permite llevar la información del dashboard fuera del sistema para analizarla o presentarla. El CU-14 la califica con importancia *Alta*.

**Referencias:** RF-26; RNF-01, RNF-04, RNF-10; CU-14 (Exportar informes); CU-13 (incluido por el CU-14).

| **Como** | **Quiero** | **Para** |
| --- | --- | --- |
| Administrador de BikeStore | exportar el informe del dashboard en formato Excel o PDF | analizar la información o presentarla en reuniones sin depender del sistema |

#### **INVEST**

| **I** | **N** | **V** | **E** | **S** | **T** |
| --- | --- | --- | --- | --- | --- |
| Independiente en su alcance, aunque parte del dashboard (HU18), que el CU-14 incluye | Negociable: el diseño y las hojas o secciones del informe pueden ajustarse | Valiosa: facilita el análisis, el respaldo y la presentación de resultados | Estimable: el flujo está definido en el CU-14 y hay bibliotecas para generar ambos formatos | Pequeña: se limita a generar y descargar el archivo | Testeable: se verifica descargando cada formato, con y sin datos |

#### **Criterios de Aceptación**

**Punto de partida** *(RNF-04; CU-14 paso 1 y precondición)*

* Solo el administrador con sesión iniciada debe poder exportar, y solo desde el dashboard de métricas.

**Selección del formato** *(RF-26; CU-14 pasos 2-3)*

* El sistema debe permitir elegir entre los formatos Excel y PDF.

**Contenido del informe** *(RF-26)*

* El informe debe corresponder a lo que se ve en el dashboard: respetar el periodo y la categoría filtrados e incluir las ventas totales, la cantidad de pedidos, el valor promedio por pedido, los productos más vendidos y las ventas por día o mes.
* El informe debe identificar a BikeStore con su logo, indicar el periodo y mostrar la fecha y hora de generación.
* El archivo Excel debe incluir además el detalle de los pedidos del periodo.

**Generación y descarga** *(RNF-10; CU-14 pasos 4-5)*

* El sistema debe generar el archivo en el formato elegido y ponerlo a disposición para su descarga, con un nombre que incluya la fecha.
* Mientras se genera, el sistema no debe permitir solicitar otra exportación.
* El sistema debe mostrar una confirmación comprensible al iniciar la descarga y, si la generación falla, un mensaje claro que permita intentarlo de nuevo.

**Sin datos** *(CU-14 flujo alterno sin datos)*

* Si no hay datos para exportar en el periodo seleccionado, el sistema debe informarlo y no generar ningún archivo.

**Cancelación** *(CU-14 flujo alterno 3.1)*

* Si el administrador cancela la exportación, el sistema no debe generar ningún archivo.

#### Escenarios Gherkin

**Característica:** Exportación de informes en el panel de administración de BikeStore

| **Escenario 1** | **Exportación en PDF** |
| --- | --- |
| **Dado que** | el administrador consulta el dashboard con ventas en el periodo |
| **Cuando** | solicita exportar el informe en PDF |
| **Entonces** | el sistema genera el archivo PDF con las métricas del periodo y lo deja disponible para su descarga |

| **Escenario 2** | **Exportación en Excel** |
| --- | --- |
| **Dado que** | el administrador consulta el dashboard con ventas en el periodo |
| **Cuando** | solicita exportar el informe en Excel |
| **Entonces** | el sistema genera el archivo Excel con las métricas, las ventas por día o mes y el detalle de los pedidos, y lo deja disponible para su descarga |

| **Escenario 3** | **El informe respeta los filtros** |
| --- | --- |
| **Dado que** | el administrador aplicó un filtro de periodo y categoría en el dashboard |
| **Cuando** | exporta el informe |
| **Entonces** | el archivo contiene solo la información del periodo y la categoría filtrados |

| **Escenario 4** | **Exportación sin datos** |
| --- | --- |
| **Dado que** | no existen pedidos en el periodo seleccionado |
| **Cuando** | el administrador solicita exportar |
| **Entonces** | el sistema informa que no hay datos para exportar y no genera ningún archivo |

| **Escenario 5** | **Cancelación de la exportación** |
| --- | --- |
| **Dado que** | el administrador está eligiendo el formato de exportación |
| **Cuando** | cancela |
| **Entonces** | el sistema no genera ningún archivo |

| **Escenario 6** | **Error al generar el informe** |
| --- | --- |
| **Dado que** | el administrador solicitó exportar |
| **Cuando** | la generación del archivo falla |
| **Entonces** | el sistema muestra un mensaje claro y permite intentarlo de nuevo |

| **Escenario 7** | **Acceso no autorizado** |
| --- | --- |
| **Dado que** | el usuario no tiene rol de administrador |
| **Cuando** | intenta exportar un informe |
| **Entonces** | el sistema deniega la operación |

#### Definition of Done (DoD)

* [ ] Opciones de exportar en Excel y en PDF disponibles desde el dashboard
* [ ] Informe con logo, periodo, fecha y hora de generación
* [ ] Informe con ventas totales, cantidad de pedidos, valor promedio, productos más vendidos y ventas por día o mes
* [ ] Excel con hojas de resumen, ventas por día o mes y detalle de pedidos
* [ ] El informe respeta el periodo y la categoría filtrados
* [ ] Aviso cuando no hay datos y no se genera archivo
* [ ] Confirmación al iniciar la descarga y mensaje claro si falla
* [ ] Opciones inhabilitadas mientras se genera el archivo
* [ ] Endpoint o servicio protegido para el rol administrador
* [ ] Pruebas funcionales de los escenarios Gherkin ejecutadas y aprobadas
* [ ] Código versionado en GitHub y revisado

#### Aprobación del Product Owner

* [ ] Sí
* [ ] No
