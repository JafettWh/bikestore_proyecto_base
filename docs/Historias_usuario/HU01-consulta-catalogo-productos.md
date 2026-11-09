# HU01 - Consulta del catálogo de productos en BikeStore

**Prioridad:** Alta. Es la puerta de entrada de la tienda: sin catálogo visible no hay compra posible. El CU-01 la califica con importancia *Vital*.

**Referencias:** RF-01, RF-02, RF-03, RF-04; RNF-01, RNF-02, RNF-03; CU-01 (Consultar catálogo de productos).

| **Como** | **Quiero** | **Para** |
| --- | --- | --- |
| Visitante o cliente de BikeStore | consultar el catálogo de productos, filtrarlos por categoría y ordenarlos por precio | encontrar fácilmente la bicicleta o el accesorio que me interesa sin necesidad de iniciar sesión |

#### **INVEST**

| **I** | **N** | **V** | **E** | **S** | **T** |
| --- | --- | --- | --- | --- | --- |
| Independiente: no requiere inicio de sesión ni otra funcionalidad del aplicativo para consultarse; solo necesita que existan productos en la base de datos | Negociable: la presentación visual del catálogo (tarjetas, cuadrícula, número de productos por fila) puede ajustarse durante el desarrollo sin cambiar el alcance | Valiosa: permite que cualquier persona conozca la oferta de la tienda y facilita la decisión de compra | Estimable: el alcance está definido en el CU-01 y en los RF-01 a RF-04, por lo que el equipo puede dimensionar el trabajo de interfaz, API y consulta a la BD | Pequeña: abarca solo la consulta, el filtro y la ordenación; el detalle del producto se trata aparte en la HU02 | Testeable: se verifica comprobando que el catálogo se muestra sin autenticación y que el filtro y la ordenación producen los resultados esperados |

#### **Criterios de Aceptación**

**Acceso sin autenticación** *(RF-01; CU-01 pasos 1-2)*

* El sistema debe permitir consultar el catálogo sin que el usuario haya iniciado sesión.
* Al ingresar a la página principal, el sistema debe consultar la base de datos y mostrar los productos activos organizados por secciones: Bicicletas, Componentes y Accesorios.

**Información mostrada por producto** *(RF-02; CU-01 paso 2)*

* Cada producto debe mostrar su imagen, nombre, precio y disponibilidad.
* La disponibilidad se expresa como la cantidad de unidades en stock; si no hay existencias, el producto se identifica como "Sin Stock".

**Filtro por categoría** *(RF-03; CU-01 pasos 3-4)*

* El sistema debe permitir filtrar los productos por categoría en todas las secciones del catálogo, con una opción "Todas" que quita el filtro.
* Al seleccionar una categoría, el sistema debe mostrar únicamente los productos que pertenecen a ella.
* Si ningún producto cumple el filtro, el sistema debe informarlo y ofrecer la opción de restablecer los filtros.

**Ordenación por precio** *(RF-04; CU-01 pasos 5-6)*

* El sistema debe permitir ordenar los productos por precio ascendente o descendente; por defecto, los productos se muestran sin ordenar por precio.
* Al seleccionar un criterio de ordenación, el sistema debe reordenar los productos mostrados, respetando el filtro de categoría si hay uno aplicado.

**Productos inactivos y catálogo vacío** *(CU-01 flujos alternos 2.1 y 2.2)*

* El sistema no debe mostrar en el catálogo público los productos en estado Inactivo.
* Si no existen productos activos o la consulta falla, el sistema debe mostrar el mensaje "No hay productos disponibles por el momento".

**Requisitos no funcionales aplicables**

* La interfaz debe ser clara y consistente, y permitir consultar, filtrar y ordenar de forma intuitiva (RNF-01).
* La interfaz debe adaptarse a computadores, tabletas y dispositivos móviles (RNF-02).
* La consulta del catálogo debe responder en un tiempo adecuado bajo las condiciones de carga definidas para el proyecto (RNF-03).

#### Escenarios Gherkin

**Característica:** Consulta del catálogo de productos en el aplicativo web BikeStore

| **Escenario 1** | **Consulta exitosa del catálogo sin iniciar sesión** |
| --- | --- |
| **Dado que** | existen productos activos registrados y el usuario no ha iniciado sesión |
| **Cuando** | ingresa a la página principal de BikeStore |
| **Entonces** | el sistema muestra el catálogo por secciones con la imagen, el nombre, el precio y la disponibilidad (unidades en stock o "Sin Stock") de cada producto |

| **Escenario 2** | **Filtrado de productos por categoría** |
| --- | --- |
| **Dado que** | el usuario se encuentra en el catálogo con productos de varias categorías |
| **Cuando** | selecciona una categoría |
| **Entonces** | el sistema muestra únicamente los productos de la categoría seleccionada |

| **Escenario 3** | **Ordenación de productos por precio ascendente** |
| --- | --- |
| **Dado que** | el usuario se encuentra en el catálogo con productos visibles |
| **Cuando** | selecciona ordenar por precio ascendente |
| **Entonces** | el sistema muestra los productos del menor al mayor precio |

| **Escenario 4** | **Ordenación de productos por precio descendente** |
| --- | --- |
| **Dado que** | el usuario se encuentra en el catálogo con productos visibles |
| **Cuando** | selecciona ordenar por precio descendente |
| **Entonces** | el sistema muestra los productos del mayor al menor precio |

| **Escenario 5** | **Combinación de filtro por categoría y ordenación** |
| --- | --- |
| **Dado que** | el usuario ha filtrado el catálogo por una categoría |
| **Cuando** | selecciona un criterio de ordenación por precio |
| **Entonces** | el sistema reordena únicamente los productos de esa categoría según el criterio elegido |

| **Escenario 6** | **Producto inactivo no visible en el catálogo** |
| --- | --- |
| **Dado que** | el administrador ha inactivado un producto |
| **Cuando** | el usuario consulta el catálogo |
| **Entonces** | el sistema no muestra ese producto en el catálogo público |

| **Escenario 7** | **Catálogo sin productos disponibles** |
| --- | --- |
| **Dado que** | no existen productos activos o la consulta a la base de datos falla |
| **Cuando** | el usuario ingresa a la página principal |
| **Entonces** | el sistema muestra el mensaje "No hay productos disponibles por el momento" |

| **Escenario 8** | **Filtro sin resultados** |
| --- | --- |
| **Dado que** | el usuario selecciona una categoría en la que no hay productos activos |
| **Cuando** | el sistema aplica el filtro |
| **Entonces** | muestra un mensaje indicando que no hay productos en esa categoría y ofrece restablecer los filtros |

#### Definition of Done (DoD)

* [ ] Interfaz del catálogo implementada
* [ ] Cada producto muestra imagen, nombre, precio y disponibilidad
* [ ] La disponibilidad se muestra en unidades en stock o "Sin Stock"
* [ ] El catálogo es accesible sin iniciar sesión
* [ ] Filtro por categoría implementado
* [ ] Ordenación por precio ascendente y descendente implementada
* [ ] El filtro y la ordenación están disponibles en todas las secciones del catálogo
* [ ] El filtro y la ordenación funcionan de forma combinada
* [ ] Mensaje y opción para restablecer filtros cuando no hay resultados
* [ ] Los productos inactivos no se muestran en el catálogo
* [ ] Se muestra el mensaje "No hay productos disponibles por el momento" cuando no hay productos activos o la consulta falla
* [ ] API de consulta de productos implementada y conectada a la base de datos
* [ ] La interfaz se adapta a computador, tableta y móvil
* [ ] Pruebas funcionales de los escenarios Gherkin ejecutadas y aprobadas
* [ ] Código versionado en GitHub y revisado

#### Aprobación del Product Owner

* [ ] Sí
* [ ] No
