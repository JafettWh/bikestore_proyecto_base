# HU07 - Agregar productos al carrito de compras

**Prioridad:** Alta. Es el primer paso del proceso de compra. El CU-06 la califica como *Vital*.

**Referencias:** RF-05, RF-06; RNF-01, RNF-10; CU-06 (Agregar producto al carrito); CU-02 (flujo alterno 4.1).

| **Como** | **Quiero** | **Para** |
| --- | --- | --- |
| Visitante o cliente de BikeStore | agregar productos al carrito indicando la cantidad que deseo, desde el catálogo o desde el detalle del producto | reunir los productos que quiero comprar antes de finalizar mi pedido |

#### **INVEST**

| **I** | **N** | **V** | **E** | **S** | **T** |
| --- | --- | --- | --- | --- | --- |
| Independiente: no requiere inicio de sesión; solo necesita productos activos con existencias | Negociable: el tipo de control para elegir la cantidad y el mensaje de confirmación pueden ajustarse | Valiosa: permite armar el pedido y es la base del proceso de compra | Estimable: el flujo y las validaciones están definidos en el CU-06 | Pequeña: se limita a agregar productos; ver y modificar el carrito es la HU08 y su conservación la HU09 | Testeable: se verifica con cantidades válidas, inválidas y superiores al stock |

#### **Criterios de Aceptación**

**Punto de entrada** *(RF-05; CU-06 paso 1)*

* El sistema debe permitir agregar un producto al carrito desde el catálogo y desde el detalle del producto.
* Agregar productos no debe requerir iniciar sesión.

**Cantidad** *(CU-06 pasos 2-3 y flujo alterno 4.1)*

* El sistema debe permitir indicar la cantidad deseada, con un mínimo de 1 unidad, tanto desde el catálogo como desde el detalle.
* Si la cantidad no es válida, el sistema debe mostrar un mensaje de error indicando que debe ingresar una cantidad válida.

**Validación de existencias** *(CU-06 paso 4 y flujo alterno 4.2)*

* El sistema debe validar que la cantidad solicitada no supere las existencias del producto.
* Si la supera, el sistema debe informar la cantidad máxima disponible y ajustar la solicitud a ese máximo.

**Agregado y confirmación** *(RF-06; RNF-10; CU-06 paso 5)*

* Al confirmar, el sistema debe añadir el producto al carrito y actualizar el valor total y la cantidad de productos que muestra el carrito.
* El sistema debe mostrar una confirmación comprensible, con acceso directo al carrito.
* Si el producto ya está en el carrito, el sistema debe sumar la cantidad sin superar las existencias.

**Producto sin stock** *(CU-06 precondición; CU-02 flujo alterno 4.1)*

* El sistema no debe permitir agregar al carrito productos sin existencias; la opción debe aparecer inhabilitada.

#### Escenarios Gherkin

**Característica:** Agregar productos al carrito en el aplicativo web BikeStore

| **Escenario 1** | **Agregar un producto con cantidad válida** |
| --- | --- |
| **Dado que** | el usuario consulta un producto activo con existencias |
| **Cuando** | indica una cantidad válida y confirma |
| **Entonces** | el sistema añade el producto al carrito, actualiza el total y muestra una confirmación con acceso al carrito |

| **Escenario 2** | **Cantidad inválida** |
| --- | --- |
| **Dado que** | el usuario va a agregar un producto al carrito |
| **Cuando** | ingresa una cantidad menor a 1 o no numérica |
| **Entonces** | el sistema muestra un mensaje indicando que debe ingresar una cantidad válida |

| **Escenario 3** | **Cantidad superior a las existencias** |
| --- | --- |
| **Dado que** | el producto tiene un número limitado de existencias |
| **Cuando** | el usuario solicita una cantidad mayor a la disponible |
| **Entonces** | el sistema informa la cantidad máxima disponible y ajusta la solicitud a ese máximo |

| **Escenario 4** | **Producto que ya estaba en el carrito** |
| --- | --- |
| **Dado que** | el producto ya se encuentra en el carrito |
| **Cuando** | el usuario lo agrega de nuevo |
| **Entonces** | el sistema suma la cantidad sin superar las existencias |

| **Escenario 5** | **Producto sin stock** |
| --- | --- |
| **Dado que** | el producto no tiene existencias |
| **Cuando** | el usuario lo consulta en el catálogo o en el detalle |
| **Entonces** | la opción de agregar al carrito aparece inhabilitada |

#### Definition of Done (DoD)

* [ ] Opción de agregar al carrito disponible en el catálogo y en el detalle del producto
* [ ] Selección de cantidad con mínimo de 1 unidad
* [ ] Validación de cantidad inválida con mensaje de error
* [ ] Validación de existencias y ajuste al máximo disponible
* [ ] El valor total y la cantidad de productos del carrito se actualizan al agregar
* [ ] Confirmación al usuario con acceso al carrito
* [ ] Suma de cantidades cuando el producto ya está en el carrito
* [ ] Opción inhabilitada para productos sin stock
* [ ] Agregar al carrito funciona sin iniciar sesión
* [ ] Pruebas funcionales de los escenarios Gherkin ejecutadas y aprobadas
* [ ] Código versionado en GitHub y revisado

#### Aprobación del Product Owner

* [ ] Sí
* [ ] No
