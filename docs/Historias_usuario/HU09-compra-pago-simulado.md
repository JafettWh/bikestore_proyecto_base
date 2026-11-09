# HU09 - Realización de la compra con pago simulado

**Prioridad:** Alta. Es el flujo que convierte el carrito en un pedido. El CU-08 la califica como *Vital*.

**Referencias:** RF-09, RF-10, RF-11, RF-12; RNF-01, RNF-02, RNF-06, RNF-10; CU-08 (Realizar compra); CU-04 (Iniciar sesión); documento del proyecto, producto mínimo viable de la fase de compras (generación de factura para pago).

| **Como** | **Quiero** | **Para** |
| --- | --- | --- |
| Cliente de BikeStore | revisar el resumen de mi pedido, indicar mi dirección de envío y realizar el pago simulado | formalizar mi compra y recibir la confirmación de mi pedido |

#### **INVEST**

| **I** | **N** | **V** | **E** | **S** | **T** |
| --- | --- | --- | --- | --- | --- |
| Independiente en su alcance, aunque requiere sesión iniciada (HU04) y productos en el carrito (HU07) | Negociable: los métodos de pago simulados, la distribución de los formularios y el contenido del comprobante pueden ajustarse | Valiosa: concreta la venta y deja el pedido registrado para el dashboard (HU18) | Estimable: el flujo está definido en el CU-08, con 8 pasos y 3 flujos alternos | Pequeña: abarca la compra y el pago simulado; el seguimiento posterior del pedido no está incluido. Si resulta muy extensa para un Sprint, puede dividirse al planificar | Testeable: se verifica con compras exitosas y con cada validación fallida |

#### **Criterios de Aceptación**

**Inicio del proceso** *(CU-08 paso 1 y precondición; CU-04)*

* El cliente debe poder iniciar la compra desde "Finalizar compra" en el carrito, o desde la opción de comprar en el detalle del producto.
* El proceso solo debe iniciarse si hay sesión iniciada y al menos un producto en el carrito; si no hay productos, el sistema debe informarlo y ofrecer volver al catálogo.
* Si el usuario no ha iniciado sesión, el sistema debe llevarlo al inicio de sesión y, al autenticarse, regresarlo a la compra (HU04).

**Resumen del pedido** *(RF-09; CU-08 paso 2)*

* Antes de pagar, el sistema debe mostrar el resumen del pedido con los productos, las cantidades y el valor total.

**Dirección de envío** *(RF-11; CU-08 pasos 3-4 y flujo alterno 4.1)*

* El sistema debe solicitar la dirección de envío: nombre, correo, departamento, ciudad o municipio, dirección detallada y teléfono de contacto.
* El sistema puede solicitar barrio, apartamento o indicaciones de entrega como información complementaria opcional y debe incluirla en el pedido.
* El sistema debe validar que la dirección esté completa y, si faltan campos, mostrar un mensaje indicando los campos pendientes.

**Pago simulado** *(RF-11; CU-08 pasos 4-6 y flujos alternos 6.1 y 6.2)*

* El sistema debe mostrar un formulario de pago simulado, con datos de tarjeta débito o crédito o de transferencia PSE.
* El sistema debe validar que todos los campos estén diligenciados y que su formato sea válido.
* Si el formato es inválido, el sistema debe solicitar corregir los datos; si faltan campos, debe indicar los pendientes.
* El pago es simulado: no se realiza ningún cobro real.

**Generación del pedido** *(RF-10, RNF-06; CU-08 pasos 6-7)*

* El sistema debe generar un número único para cada pedido.
* Al procesar el pago simulado, el sistema debe registrar el pedido con su detalle (productos, cantidades y precios) y marcarlo como pagado.
* Mientras se procesa el pago, el sistema no debe permitir enviarlo de nuevo.
* Al finalizar, el carrito del cliente debe quedar sin los productos comprados.

**Confirmación** *(RF-12; CU-08 paso 8)*

* El sistema debe mostrar un aviso de pago exitoso con la confirmación del pedido, incluyendo su número único.
* El cliente debe poder descargar un comprobante del pedido.

**Requisitos no funcionales aplicables**

* La interfaz debe ser clara, consistente y adaptarse a computadores, tabletas y móviles (RNF-01, RNF-02); los mensajes de error y confirmación deben ser comprensibles (RNF-10).

#### Escenarios Gherkin

**Característica:** Realización de la compra con pago simulado en el aplicativo web BikeStore

| **Escenario 1** | **Compra exitosa** |
| --- | --- |
| **Dado que** | el cliente tiene sesión iniciada y productos en el carrito |
| **Cuando** | revisa el resumen, ingresa una dirección completa y datos de pago válidos, y confirma |
| **Entonces** | el sistema genera un número único de pedido, lo registra como pagado y muestra el aviso de pago exitoso con la confirmación |

| **Escenario 2** | **Compra sin haber iniciado sesión** |
| --- | --- |
| **Dado que** | el visitante tiene productos en el carrito y no ha iniciado sesión |
| **Cuando** | presiona "Finalizar compra" |
| **Entonces** | el sistema lo lleva al inicio de sesión y, al autenticarse, lo regresa al proceso de compra |

| **Escenario 3** | **Carrito sin productos** |
| --- | --- |
| **Dado que** | el cliente no tiene productos en el carrito |
| **Cuando** | intenta iniciar el proceso de compra |
| **Entonces** | el sistema informa que no hay productos y ofrece volver al catálogo |

| **Escenario 4** | **Dirección de envío incompleta** |
| --- | --- |
| **Dado que** | el cliente se encuentra en el paso de la dirección de envío |
| **Cuando** | deja campos obligatorios sin diligenciar y confirma |
| **Entonces** | el sistema muestra un mensaje indicando los campos pendientes |

| **Escenario 5** | **Datos de pago con formato inválido** |
| --- | --- |
| **Dado que** | el cliente se encuentra en el formulario de pago simulado |
| **Cuando** | ingresa datos con formato inválido |
| **Entonces** | el sistema muestra un mensaje de formato inválido y solicita corregirlos |

| **Escenario 6** | **Datos de pago incompletos** |
| --- | --- |
| **Dado que** | el cliente se encuentra en el formulario de pago simulado |
| **Cuando** | deja campos sin diligenciar y confirma |
| **Entonces** | el sistema muestra un mensaje indicando los campos pendientes |

| **Escenario 7** | **Descarga del comprobante** |
| --- | --- |
| **Dado que** | el cliente completó una compra exitosa |
| **Cuando** | solicita descargar el comprobante |
| **Entonces** | el sistema genera un documento con el detalle del pedido |

| **Escenario 8** | **Compra iniciada desde el detalle del producto** |
| --- | --- |
| **Dado que** | el cliente consulta un producto con stock |
| **Cuando** | selecciona la opción de comprar |
| **Entonces** | el sistema agrega el producto al carrito y lo lleva al proceso de compra |

#### Definition of Done (DoD)

* [ ] Resumen del pedido con productos, cantidades y valor total
* [ ] Formulario de dirección de envío con validación de campos completos
* [ ] Campo opcional para barrio, apartamento o indicaciones complementarias asociado al pedido
* [ ] Formulario de pago simulado con validación de formato y campos completos
* [ ] Opciones de pago simulado con tarjeta y con PSE
* [ ] Número de pedido único generado por el sistema
* [ ] Pedido y detalle de pedido registrados en la base de datos con estado pagado
* [ ] Los datos de pago simulados no se almacenan
* [ ] Botón de pago inhabilitado mientras se procesa
* [ ] Aviso de pago exitoso y confirmación del pedido con su número
* [ ] Carrito del cliente vaciado tras la compra
* [ ] Comprobante del pedido descargable
* [ ] Inicio de sesión y retorno a la compra cuando no hay sesión
* [ ] La interfaz se adapta a computador, tableta y móvil
* [ ] Pruebas funcionales de los escenarios Gherkin ejecutadas y aprobadas
* [ ] Código versionado en GitHub y revisado

#### Aprobación del Product Owner

* [ ] Sí
* [ ] No
