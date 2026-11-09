# HU12 - Actualización de productos

**Prioridad:** Alta. Mantiene al día precios y existencias, que afectan directamente la venta. El CU-11 la califica como *Vital*.

**Referencias:** RF-18; RNF-01, RNF-02, RNF-04, RNF-06, RNF-10; CU-11 (Actualizar producto); CU-10 (Buscar y filtrar productos).

| **Como** | **Quiero** | **Para** |
| --- | --- | --- |
| Administrador de BikeStore | modificar la información de un producto existente, incluido su precio y sus existencias | mantener el catálogo con datos correctos y actualizados |

#### **INVEST**

| **I** | **N** | **V** | **E** | **S** | **T** |
| --- | --- | --- | --- | --- | --- |
| Independiente en su alcance; se apoya en la ubicación del producto (HU12) y en productos registrados (HU11) | Negociable: la forma de editar (ventana o página) y los mensajes pueden ajustarse | Valiosa: evita vender con precios o existencias desactualizados | Estimable: el flujo y las validaciones están definidos en el CU-11 | Pequeña: se limita a modificar datos; el cambio de estado se hace en la HU14 | Testeable: se verifica con cambios válidos, validaciones fallidas y cancelación |

#### **Criterios de Aceptación**

**Selección y formulario** *(RF-18, RNF-04; CU-11 pasos 1-2; CU-10)*

* Solo el administrador debe poder actualizar productos.
* El administrador debe ubicar el producto desde el listado (HU12) y seleccionar la opción de actualizar.
* El sistema debe mostrar un formulario con los datos actuales del producto.

**Datos modificables** *(RF-18; CU-11 paso 3)*

* El administrador debe poder modificar el nombre, la categoría, el precio, las existencias, la descripción y la imagen.

**Validaciones** *(RNF-06; CU-11 pasos 4-5 y flujos alternos 4.1, 4.2 y 4.3)*

* El sistema debe verificar que los campos obligatorios (nombre, categoría, precio y existencias) no queden vacíos; de lo contrario, debe resaltar el campo y mostrar "Debe completar todos los campos obligatorios".
* El precio debe ser un número mayor a cero y las existencias un entero mayor o igual a cero; de lo contrario, el sistema debe mostrar "El precio debe ser un número mayor a cero y las existencias deben ser un entero no negativo".
* Si se selecciona una nueva imagen, el sistema debe validar su formato y tamaño; si no es válida, debe mostrar "Formato de imagen no válido".
* Si hay errores, el sistema no debe guardar y debe permitir corregirlos.

**Guardado** *(CU-11 paso 6; RNF-10)*

* Al guardar, el sistema debe actualizar el producto en la base de datos y reflejar el cambio en el catálogo.
* El sistema debe mostrar el mensaje "Producto actualizado exitosamente".
* La actualización no debe cambiar el estado del producto; la inactivación se realiza desde la HU14.

**Cancelación** *(CU-11 flujo alterno 3.1)*

* Si el administrador cancela, el sistema debe descartar los cambios, no modificar la base de datos y volver al listado.

#### Escenarios Gherkin

**Característica:** Actualización de productos en el panel de administración de BikeStore

| **Escenario 1** | **Actualización exitosa** |
| --- | --- |
| **Dado que** | el administrador seleccionó un producto del listado |
| **Cuando** | modifica datos válidos y guarda |
| **Entonces** | el sistema actualiza el producto, refleja el cambio en el catálogo y muestra "Producto actualizado exitosamente" |

| **Escenario 2** | **Campo obligatorio vacío** |
| --- | --- |
| **Dado que** | el administrador está editando un producto |
| **Cuando** | deja vacío el nombre, la categoría, el precio o las existencias y guarda |
| **Entonces** | el sistema resalta el campo, muestra "Debe completar todos los campos obligatorios" y no guarda |

| **Escenario 3** | **Precio o existencias inválidos** |
| --- | --- |
| **Dado que** | el administrador está editando un producto |
| **Cuando** | ingresa un precio igual o menor a cero, no numérico, o existencias negativas o decimales |
| **Entonces** | el sistema muestra el mensaje de valor no válido y no guarda |

| **Escenario 4** | **Imagen con formato inválido** |
| --- | --- |
| **Dado que** | el administrador está editando un producto |
| **Cuando** | adjunta una imagen con formato o tamaño no permitido |
| **Entonces** | el sistema muestra "Formato de imagen no válido" y no guarda |

| **Escenario 5** | **El estado no cambia al actualizar** |
| --- | --- |
| **Dado que** | el administrador edita un producto inactivo |
| **Cuando** | guarda los cambios |
| **Entonces** | el producto conserva su estado Inactivo |

| **Escenario 6** | **Cancelación de la actualización** |
| --- | --- |
| **Dado que** | el administrador está editando un producto |
| **Cuando** | presiona cancelar |
| **Entonces** | el sistema descarta los cambios y vuelve al listado sin modificar la base de datos |

#### Definition of Done (DoD)

* [ ] Formulario de edición con los datos actuales del producto
* [ ] Validación de campos obligatorios con campo resaltado y mensaje
* [ ] Validación de precio mayor a cero y existencias enteras mayores o iguales a cero
* [ ] Validación de formato y tamaño de la nueva imagen
* [ ] Actualización registrada en la base de datos y reflejada en el catálogo
* [ ] Mensaje "Producto actualizado exitosamente"
* [ ] La actualización no modifica el estado del producto
* [ ] Opción de cancelar sin modificar datos
* [ ] Endpoint protegido para el rol administrador
* [ ] La interfaz se adapta a computador, tableta y móvil
* [ ] Pruebas funcionales de los escenarios Gherkin ejecutadas y aprobadas
* [ ] Código versionado en GitHub y revisado

#### Aprobación del Product Owner

* [ ] Sí
* [ ] No
