# HU13 - Inactivación de productos

**Prioridad:** Alta. Permite retirar del catálogo productos que ya no se venden, sin perder su información. El CU-12 la califica con importancia *Alta*.

**Referencias:** RF-19; RNF-01, RNF-04, RNF-06, RNF-10; CU-12 (Inactivar producto); CU-10 (Buscar y filtrar productos); CU-01 (flujo alterno 2.2).

| **Como** | **Quiero** | **Para** |
| --- | --- | --- |
| Administrador de BikeStore | inactivar un producto registrando el motivo | retirarlo del catálogo público sin eliminarlo y dejar constancia de la razón |

#### **INVEST**

| **I** | **N** | **V** | **E** | **S** | **T** |
| --- | --- | --- | --- | --- | --- |
| Independiente en su alcance; se apoya en la ubicación del producto (HU12) y su efecto se ve en el catálogo (HU01) | Negociable: la forma de pedir la confirmación y el texto de los mensajes pueden ajustarse | Valiosa: evita ofrecer productos descontinuados sin perder el historial | Estimable: el flujo está definido en el CU-12 | Pequeña: se limita a inactivar con motivo | Testeable: se verifica con motivo válido, motivo vacío y cancelación |

#### **Criterios de Aceptación**

**Selección del producto** *(RF-19, RNF-04; CU-12 paso 1; CU-10)*

* Solo el administrador debe poder inactivar productos.
* El administrador debe ubicar un producto activo desde el listado (HU12) y seleccionar la opción de inactivar; esta opción solo debe estar disponible para productos activos.

**Confirmación y motivo** *(CU-12 pasos 2-3)*

* El sistema debe pedir confirmación y mostrar un campo obligatorio para el motivo de la inactivación.

**Inactivación** *(RF-19, RNF-06, RNF-10; CU-12 paso 4)*

* El sistema debe validar que el motivo no esté vacío, guardarlo, cambiar el estado del producto a Inactivo y retirarlo del catálogo público, de su detalle y de la búsqueda (CU-01 flujo alterno 2.2).
* La inactivación no debe eliminar el producto ni su información.
* El sistema debe mostrar una confirmación comprensible.
* El estado Inactivo es distinto de "Sin Stock": un producto sin existencias sigue activo, y un producto inactivo no se muestra aunque tenga existencias.

**Motivo vacío** *(CU-12 flujo alterno 4.1)*

* Si el motivo está vacío, el sistema debe mostrar un mensaje exigiendo la razón y permitir ingresarla.

**Cancelación** *(CU-12 flujo alterno 3.1 y 4.2)*

* Si el administrador cancela, el sistema debe cerrar el aviso sin realizar cambios.

#### Escenarios Gherkin

**Característica:** Inactivación de productos en el panel de administración de BikeStore

| **Escenario 1** | **Inactivación exitosa** |
| --- | --- |
| **Dado que** | el administrador seleccionó un producto activo |
| **Cuando** | ingresa el motivo y confirma la inactivación |
| **Entonces** | el sistema guarda el motivo, cambia el estado a Inactivo y lo retira del catálogo público |

| **Escenario 2** | **Motivo vacío** |
| --- | --- |
| **Dado que** | el sistema solicita el motivo de la inactivación |
| **Cuando** | el administrador lo deja vacío y confirma |
| **Entonces** | el sistema muestra un mensaje exigiendo la razón y no inactiva el producto |

| **Escenario 3** | **Cancelación de la inactivación** |
| --- | --- |
| **Dado que** | el sistema solicita confirmar la inactivación |
| **Cuando** | el administrador cancela |
| **Entonces** | el sistema cierra el aviso sin realizar cambios |

| **Escenario 4** | **Producto inactivo no visible para los usuarios** |
| --- | --- |
| **Dado que** | un producto fue inactivado |
| **Cuando** | un visitante o cliente consulta el catálogo o busca el producto |
| **Entonces** | el producto no aparece |

| **Escenario 5** | **Diferencia entre inactivo y sin stock** |
| --- | --- |
| **Dado que** | un producto activo se quedó sin existencias |
| **Cuando** | un usuario consulta el catálogo |
| **Entonces** | el producto sigue visible identificado como "Sin Stock" y no se considera inactivo |

#### Definition of Done (DoD)

* [ ] Opción de inactivar disponible solo para productos activos
* [ ] Ventana de confirmación con motivo obligatorio
* [ ] Validación de motivo no vacío con mensaje
* [ ] Motivo guardado en la base de datos junto con el estado Inactivo
* [ ] Producto retirado del catálogo público, del detalle y de la búsqueda
* [ ] El producto y su información no se eliminan
* [ ] Confirmación comprensible al inactivar
* [ ] Opción de cancelar sin cambios
* [ ] Endpoint protegido para el rol administrador
* [ ] Pruebas funcionales de los escenarios Gherkin ejecutadas y aprobadas
* [ ] Código versionado en GitHub y revisado

#### Aprobación del Product Owner

* [ ] Sí
* [ ] No
