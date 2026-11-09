# HU08 - Consulta y modificación del carrito de compras

**Prioridad:** Alta. Permite al usuario revisar y ajustar lo que va a comprar antes de pagar. El CU-07 la califica con importancia *Alta*.

**Referencias:** RF-06, RF-07; RNF-01, RNF-02, RNF-10; CU-07 (Ver y modificar carrito).

| **Como** | **Quiero** | **Para** |
| --- | --- | --- |
| Visitante o cliente de BikeStore | consultar mi carrito y modificar las cantidades o eliminar productos | tener claro qué voy a comprar y cuánto voy a pagar antes de finalizar el pedido |

#### **INVEST**

| **I** | **N** | **V** | **E** | **S** | **T** |
| --- | --- | --- | --- | --- | --- |
| Independiente en su alcance; requiere que existan productos en el carrito (HU07) | Negociable: la disposición de los productos, los controles de cantidad y los mensajes pueden ajustarse | Valiosa: da control y transparencia sobre los valores antes del pago | Estimable: el flujo normal y los alternos están definidos en el CU-07 | Pequeña: se limita a consultar, cambiar cantidades y eliminar; el pago se trata en la HU10 y la conservación en la HU09 | Testeable: se verifica con cambios de cantidad, límites de stock y eliminaciones confirmadas o canceladas |

#### **Criterios de Aceptación**

**Visualización del carrito** *(RF-06; CU-07 pasos 1-2)*

* El sistema debe permitir consultar el carrito sin necesidad de iniciar sesión.
* Por cada producto, el sistema debe mostrar su imagen, nombre, precio unitario, cantidad, stock disponible y valor parcial.
* El sistema debe mostrar el valor total de los productos del carrito.

**Modificación de cantidades** *(RF-07; CU-07 pasos 3-5)*

* El sistema debe permitir aumentar o disminuir la cantidad de un producto, con un mínimo de 1 unidad.
* El sistema debe validar la disponibilidad y restringir que la cantidad supere el stock disponible.
* Tras cada cambio, el sistema debe actualizar el carrito, recalcular los valores parciales y el total, y registrar el cambio.

**Eliminación de productos** *(CU-07 flujos alternos 3.1, 3.2 y 3.3)*

* Si el usuario reduce la cantidad a cero o presiona "Eliminar", el sistema debe pedir confirmación antes de retirar el producto.
* Si el usuario confirma, el sistema debe retirar el producto, recalcular el total y actualizar el carrito.
* Si el usuario cancela, el sistema debe mantener el producto con la cantidad anterior.

**Carrito vacío y navegación**

* Si el carrito no tiene productos, el sistema debe informarlo y ofrecer volver al catálogo.
* El carrito debe ofrecer la opción de seguir comprando y la de continuar con la compra (HU10).

**Requisitos no funcionales aplicables**

* La interfaz debe ser clara y consistente (RNF-01), adaptarse a computadores, tabletas y móviles (RNF-02) y mostrar mensajes y confirmaciones comprensibles (RNF-10).

#### Escenarios Gherkin

**Característica:** Consulta y modificación del carrito de compras en el aplicativo web BikeStore

| **Escenario 1** | **Consulta del carrito con productos** |
| --- | --- |
| **Dado que** | el usuario tiene productos en el carrito |
| **Cuando** | accede a la vista del carrito |
| **Entonces** | el sistema muestra cada producto con su cantidad y valor parcial, y el valor total |

| **Escenario 2** | **Aumento de cantidad dentro del stock** |
| --- | --- |
| **Dado que** | el producto tiene existencias adicionales disponibles |
| **Cuando** | el usuario aumenta su cantidad |
| **Entonces** | el sistema actualiza la cantidad, el valor parcial y el total |

| **Escenario 3** | **Cantidad que supera el stock** |
| --- | --- |
| **Dado que** | la cantidad del producto en el carrito ya es igual al stock disponible |
| **Cuando** | el usuario intenta aumentarla |
| **Entonces** | el sistema no lo permite y mantiene la cantidad máxima disponible |

| **Escenario 4** | **Disminución de cantidad** |
| --- | --- |
| **Dado que** | el producto tiene una cantidad mayor a 1 en el carrito |
| **Cuando** | el usuario disminuye su cantidad |
| **Entonces** | el sistema actualiza la cantidad, el valor parcial y el total |

| **Escenario 5** | **Eliminación de un producto con confirmación** |
| --- | --- |
| **Dado que** | el usuario presiona "Eliminar" en un producto o reduce su cantidad a cero |
| **Cuando** | confirma la eliminación |
| **Entonces** | el sistema retira el producto, recalcula el total y actualiza el carrito |

| **Escenario 6** | **Cancelación de la eliminación** |
| --- | --- |
| **Dado que** | el sistema solicitó confirmar la eliminación de un producto |
| **Cuando** | el usuario cancela |
| **Entonces** | el sistema mantiene el producto con la cantidad anterior |

| **Escenario 7** | **Carrito vacío** |
| --- | --- |
| **Dado que** | el carrito no tiene productos |
| **Cuando** | el usuario accede a la vista del carrito |
| **Entonces** | el sistema informa que no hay productos y ofrece volver al catálogo |

#### Definition of Done (DoD)

* [ ] Vista del carrito implementada con imagen, nombre, precio unitario, cantidad, stock disponible y valor parcial por producto
* [ ] Valor total visible y actualizado en cada cambio
* [ ] Control para aumentar y disminuir cantidades con mínimo de 1 unidad
* [ ] Restricción de la cantidad al stock disponible
* [ ] Confirmación antes de eliminar un producto o reducir su cantidad a cero
* [ ] Cancelación de la eliminación mantiene la cantidad anterior
* [ ] Mensaje y acceso al catálogo cuando el carrito está vacío
* [ ] Opciones de seguir comprando y de continuar con la compra
* [ ] Los datos del carrito se consultan con la información vigente del catálogo
* [ ] La interfaz se adapta a computador, tableta y móvil
* [ ] Pruebas funcionales de los escenarios Gherkin ejecutadas y aprobadas
* [ ] Código versionado en GitHub y revisado

#### Aprobación del Product Owner

* [ ] Sí
* [ ] No
