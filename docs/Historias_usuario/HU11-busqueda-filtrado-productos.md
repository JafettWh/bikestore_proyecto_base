# HU11 - Búsqueda y filtrado de productos (administrador)

**Prioridad:** Alta. Es el punto de partida para actualizar o inactivar productos. El CU-10 la califica con importancia *Alta*.

**Referencias:** RF-20; RNF-01, RNF-02, RNF-04; CU-10 (Buscar y filtrar productos).

| **Como** | **Quiero** | **Para** |
| --- | --- | --- |
| Administrador de BikeStore | consultar el listado de productos, buscarlos y filtrarlos por categoría y estado | ubicar rápidamente un producto específico para revisarlo, actualizarlo o inactivarlo |

#### **INVEST**

| **I** | **N** | **V** | **E** | **S** | **T** |
| --- | --- | --- | --- | --- | --- |
| Independiente en su alcance; requiere sesión de administrador y productos registrados | Negociable: las columnas del listado y los criterios de búsqueda pueden ajustarse | Valiosa: ahorra tiempo en la gestión del catálogo | Estimable: el flujo está definido en el CU-10 | Pequeña: se limita a consultar, buscar y filtrar | Testeable: se verifica con búsquedas con y sin resultados y con cada filtro |

#### **Criterios de Aceptación**

**Listado de productos** *(RF-20, RNF-04; CU-10 pasos 1-2)*

* Solo el administrador con sesión iniciada debe poder acceder al módulo de gestión de productos.
* Al ingresar, el sistema debe mostrar el listado completo de productos registrados, activos e inactivos, con imagen, nombre, categoría, precio, existencias y estado.
* El sistema debe indicar cuántos productos se muestran del total registrado.

**Búsqueda y filtros** *(RF-20; CU-10 pasos 3-4)*

* El sistema debe permitir buscar productos por nombre o categoría.
* El sistema debe permitir filtrar por categoría (sección y categoría específica) y por estado (Activo o Inactivo).
* La búsqueda y los filtros deben poder combinarse.
* Al aplicar un criterio, el sistema debe consultar la base de datos y mostrar los productos que lo cumplen.

**Sin resultados** *(CU-10 flujo alterno 4.1)*

* Si ningún producto cumple el criterio, el sistema debe mostrar un mensaje indicando que no se encontraron resultados y permitir ingresar otro criterio.

**Acciones sobre un producto** *(CU-10; CU-11 y CU-12 que lo citan)*

* Desde el listado, el administrador debe poder seleccionar un producto para actualizarlo (HU13) o inactivarlo (HU14).

**Requisitos no funcionales aplicables**

* La interfaz debe ser clara y consistente (RNF-01) y adaptarse a computadores, tabletas y móviles (RNF-02).

#### Escenarios Gherkin

**Característica:** Búsqueda y filtrado de productos en el panel de administración de BikeStore

| **Escenario 1** | **Listado completo de productos** |
| --- | --- |
| **Dado que** | existen productos registrados y el administrador tiene sesión iniciada |
| **Cuando** | accede al módulo de gestión de productos |
| **Entonces** | el sistema muestra el listado completo con su información y el total de productos |

| **Escenario 2** | **Búsqueda por nombre o categoría** |
| --- | --- |
| **Dado que** | el administrador se encuentra en el listado de productos |
| **Cuando** | ingresa un criterio de búsqueda |
| **Entonces** | el sistema muestra únicamente los productos que lo cumplen |

| **Escenario 3** | **Filtro por categoría** |
| --- | --- |
| **Dado que** | el administrador se encuentra en el listado de productos |
| **Cuando** | selecciona una categoría |
| **Entonces** | el sistema muestra únicamente los productos de esa categoría |

| **Escenario 4** | **Filtro por estado** |
| --- | --- |
| **Dado que** | existen productos activos e inactivos |
| **Cuando** | el administrador filtra por estado Inactivo |
| **Entonces** | el sistema muestra únicamente los productos inactivos |

| **Escenario 5** | **Búsqueda sin resultados** |
| --- | --- |
| **Dado que** | el administrador se encuentra en el listado de productos |
| **Cuando** | ingresa un criterio que ningún producto cumple |
| **Entonces** | el sistema muestra un mensaje indicando que no se encontraron resultados |

#### Definition of Done (DoD)

* [ ] Listado de productos con imagen, nombre, categoría, precio, existencias y estado
* [ ] Contador de productos mostrados sobre el total
* [ ] Búsqueda por nombre o categoría
* [ ] Filtro por categoría
* [ ] Filtro por estado (Activo o Inactivo)
* [ ] Búsqueda y filtros combinables
* [ ] Mensaje cuando no hay resultados
* [ ] Acceso a las acciones de actualizar e inactivar desde el listado
* [ ] Endpoint de consulta protegido para el rol administrador
* [ ] La interfaz se adapta a computador, tableta y móvil
* [ ] Pruebas funcionales de los escenarios Gherkin ejecutadas y aprobadas
* [ ] Código versionado en GitHub y revisado

#### Aprobación del Product Owner

* [ ] Sí
* [ ] No
