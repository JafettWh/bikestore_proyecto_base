# HU02 - Consulta del detalle de un producto

**Prioridad:** Alta. Permite conocer a fondo un producto antes de decidir comprarlo.

**Referencias:** RF-02, RF-05; RNF-01, RNF-02; CU-02 (Ver detalle del producto).

| **Como** | **Quiero** | **Para** |
| --- | --- | --- |
| Visitante o cliente de BikeStore | consultar la información detallada de un producto del catálogo | conocer sus características, precio y disponibilidad antes de decidir agregarlo al carrito |

#### **INVEST**

| **I** | **N** | **V** | **E** | **S** | **T** |
| --- | --- | --- | --- | --- | --- |
| Independiente: solo requiere que existan productos activos; no depende del inicio de sesión | Negociable: la distribución de la información (imágenes, descripción, ficha técnica) puede ajustarse durante el desarrollo | Valiosa: ofrece al usuario la información necesaria para decidir su compra | Estimable: el flujo está definido en el CU-02 y requiere una vista de detalle y una consulta por producto | Pequeña: se limita a mostrar el detalle de un producto; el agregado al carrito se desarrolla en la HU07 | Testeable: se verifica al seleccionar un producto con stock, sin stock, inactivo o inexistente |

#### **Criterios de Aceptación**

**Visualización del detalle** *(RF-02; CU-02 pasos 3-5)*

* Al seleccionar un producto del catálogo, el sistema debe validar en la base de datos que esté disponible.
* El sistema debe mostrar la página de detalle con imagen (y galería si existe), nombre, descripción, especificaciones técnicas (ficha técnica), precio y disponibilidad en unidades en stock.

**Producto con stock** *(RF-05; CU-02 paso 4)*

* Si el producto tiene stock, el sistema debe ofrecer las opciones de agregarlo al carrito y de comprarlo (desarrolladas en las HU07 y HU10).

**Producto sin stock** *(CU-02 flujo alterno 4.1)*

* Si el producto no tiene stock, el sistema debe indicarlo en el detalle e inhabilitar las opciones de comprar y añadir al carrito.

**Producto no disponible o inexistente** *(CU-02 flujos alternos 2.1 y 2.2)*

* El sistema no debe mostrar los productos que no estén disponibles.
* Si se consulta un producto inexistente, el sistema debe mostrar un mensaje de error indicando que el producto consultado no existe.

**Requisitos no funcionales aplicables**

* La interfaz debe ser clara y consistente (RNF-01) y adaptarse a computadores, tabletas y dispositivos móviles (RNF-02).

#### Escenarios Gherkin

**Característica:** Consulta del detalle de un producto en el aplicativo web BikeStore

| **Escenario 1** | **Consulta exitosa del detalle de un producto** |
| --- | --- |
| **Dado que** | el usuario se encuentra en el catálogo y el producto está activo y con stock |
| **Cuando** | selecciona el producto |
| **Entonces** | el sistema muestra sus imágenes, nombre, descripción, ficha técnica, precio y la disponibilidad en unidades |

| **Escenario 2** | **Producto sin stock** |
| --- | --- |
| **Dado que** | el usuario selecciona un producto activo sin existencias |
| **Cuando** | el sistema muestra el detalle |
| **Entonces** | indica que el producto no tiene stock e inhabilita las opciones de comprar y añadir al carrito |

| **Escenario 3** | **Producto no disponible** |
| --- | --- |
| **Dado que** | un producto no se encuentra disponible |
| **Cuando** | el usuario intenta consultarlo |
| **Entonces** | el sistema no lo muestra y el usuario regresa a la consulta del catálogo |

| **Escenario 4** | **Producto inexistente** |
| --- | --- |
| **Dado que** | el usuario intenta acceder a un producto que no existe |
| **Cuando** | el sistema realiza la consulta |
| **Entonces** | muestra un mensaje de error indicando que el producto consultado no existe |

#### Definition of Done (DoD)

* [ ] Vista de detalle del producto implementada
* [ ] El detalle muestra imágenes, nombre, descripción, ficha técnica, precio y disponibilidad en unidades
* [ ] Se inhabilitan comprar y añadir al carrito cuando el producto no tiene stock
* [ ] Se muestra mensaje de error cuando el producto no existe
* [ ] Los productos no disponibles no se muestran
* [ ] Cada producto se consulta mediante una ruta con su identificador
* [ ] API de consulta de un producto por identificador implementada
* [ ] La interfaz se adapta a computador, tableta y móvil
* [ ] Pruebas funcionales de los escenarios Gherkin ejecutadas y aprobadas
* [ ] Código versionado en GitHub y revisado

#### Aprobación del Product Owner

* [ ] Sí
* [ ] No
