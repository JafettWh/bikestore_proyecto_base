# HU10 - Registro de productos

**Prioridad:** Alta. Sin productos registrados no hay catálogo que vender. El CU-09 la califica como *Vital*.

**Referencias:** RF-17; RNF-01, RNF-02, RNF-04, RNF-06, RNF-10; CU-09 (Registrar producto); CU-11 (reglas de validación de precio, existencias e imagen).

| **Como** | **Quiero** | **Para** |
| --- | --- | --- |
| Administrador de BikeStore | registrar nuevos productos con su información comercial | mantener el catálogo actualizado y ponerlos a disposición de los clientes |

#### **INVEST**

| **I** | **N** | **V** | **E** | **S** | **T** |
| --- | --- | --- | --- | --- | --- |
| Independiente en su alcance; requiere sesión de administrador (HU04 y HU06) | Negociable: la distribución del formulario y la forma de cargar la imagen pueden ajustarse durante el desarrollo | Valiosa: alimenta el catálogo que ven los clientes y es la base de las ventas | Estimable: el flujo y las validaciones están definidos en el CU-09 | Pequeña: se limita a registrar; buscar, actualizar e inactivar son las HU12, HU13 y HU14 | Testeable: se verifica con registros exitosos y con cada validación fallida |

#### **Criterios de Aceptación**

**Acceso y formulario** *(RF-17, RNF-04; CU-09 pasos 1-2)*

* Solo el administrador con sesión iniciada debe poder registrar productos.
* El sistema debe mostrar un formulario con los campos obligatorios: nombre, descripción, precio, categoría (sección y categoría específica), imagen y existencias.
* La categoría debe seleccionarse de una lista definida por el sistema, para que el filtro del catálogo (HU01) sea consistente.

**Validaciones** *(RNF-06; CU-09 paso 4 y flujos alternos 4.1 y 4.2; CU-11 paso 4)*

* El sistema debe validar que todos los campos obligatorios estén completos; si faltan, debe mostrar un mensaje indicando los campos pendientes.
* El precio debe ser un número mayor a cero y las existencias un número entero mayor o igual a cero; de lo contrario, el sistema debe mostrar un mensaje de que el valor ingresado no es válido.
* La imagen debe cumplir el formato (por ejemplo, JPG o PNG) y el tamaño permitidos; de lo contrario, el sistema debe notificarlo.

**Registro y publicación** *(RF-17, RNF-10; CU-09 paso 5)*

* Al confirmar, el sistema debe registrar el producto en la base de datos en estado Activo y publicarlo en el catálogo.
* El sistema debe asignar un identificador único al producto.
* El sistema debe mostrar una confirmación comprensible del registro.
* El administrador debe poder cancelar el registro sin guardar cambios.

**Requisitos no funcionales aplicables**

* La interfaz debe ser clara y consistente (RNF-01) y adaptarse a computadores, tabletas y móviles (RNF-02).

#### Escenarios Gherkin

**Característica:** Registro de productos en el panel de administración de BikeStore

| **Escenario 1** | **Registro exitoso de un producto** |
| --- | --- |
| **Dado que** | el administrador se encuentra en el formulario de registro de producto |
| **Cuando** | diligencia todos los campos con datos válidos y confirma |
| **Entonces** | el sistema registra el producto en estado Activo, lo publica en el catálogo y muestra una confirmación |

| **Escenario 2** | **Campos obligatorios pendientes** |
| --- | --- |
| **Dado que** | el administrador se encuentra en el formulario de registro de producto |
| **Cuando** | deja campos obligatorios sin diligenciar y confirma |
| **Entonces** | el sistema muestra un mensaje indicando los campos pendientes |

| **Escenario 3** | **Precio inválido** |
| --- | --- |
| **Dado que** | el administrador se encuentra en el formulario de registro de producto |
| **Cuando** | ingresa un precio igual o menor a cero o no numérico |
| **Entonces** | el sistema muestra un mensaje de que el valor ingresado no es válido |

| **Escenario 4** | **Existencias inválidas** |
| --- | --- |
| **Dado que** | el administrador se encuentra en el formulario de registro de producto |
| **Cuando** | ingresa existencias negativas, decimales o no numéricas |
| **Entonces** | el sistema muestra un mensaje de que el valor ingresado no es válido |

| **Escenario 5** | **Imagen con formato inválido** |
| --- | --- |
| **Dado que** | el administrador selecciona una imagen que no cumple el formato o tamaño permitidos |
| **Cuando** | intenta registrar el producto |
| **Entonces** | el sistema notifica que la imagen no es válida |

| **Escenario 6** | **Cancelación del registro** |
| --- | --- |
| **Dado que** | el administrador se encuentra en el formulario de registro de producto |
| **Cuando** | cancela |
| **Entonces** | el sistema cierra el formulario sin registrar el producto |

#### Definition of Done (DoD)

* [ ] Formulario de registro con nombre, descripción, precio, categoría, imagen y existencias
* [ ] Categoría seleccionable desde una lista definida por el sistema
* [ ] Validación de campos obligatorios con mensaje de campos pendientes
* [ ] Validación de precio mayor a cero y existencias enteras mayores o iguales a cero
* [ ] Validación de formato y tamaño de la imagen
* [ ] Producto registrado en la base de datos en estado Activo con identificador único
* [ ] Producto visible en el catálogo público tras el registro
* [ ] Confirmación comprensible al registrar
* [ ] Opción de cancelar el registro
* [ ] Endpoint protegido para el rol administrador
* [ ] La interfaz se adapta a computador, tableta y móvil
* [ ] Pruebas funcionales de los escenarios Gherkin ejecutadas y aprobadas
* [ ] Código versionado en GitHub y revisado

#### Aprobación del Product Owner

* [ ] Sí
* [ ] No
