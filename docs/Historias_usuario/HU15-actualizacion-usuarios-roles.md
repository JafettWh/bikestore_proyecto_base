# HU15 - Actualización de usuarios y asignación de roles

**Prioridad:** Alta. Permite mantener correctos los datos y permisos de los usuarios. El CU-16 la califica con importancia *Alta*.

**Referencias:** RF-27, RF-28, RF-31; RNF-01, RNF-02, RNF-04, RNF-06, RNF-10; CU-16 (Actualizar usuario).

| **Como** | **Quiero** | **Para** |
| --- | --- | --- |
| Administrador de BikeStore | consultar el listado de usuarios, buscar uno y modificar sus datos o su rol | mantener actualizada la información de las cuentas y los permisos de cada persona |

#### **INVEST**

| **I** | **N** | **V** | **E** | **S** | **T** |
| --- | --- | --- | --- | --- | --- |
| Independiente en su alcance; requiere sesión de administrador y usuarios registrados | Negociable: las columnas del listado, el formulario de edición y los mensajes pueden ajustarse | Valiosa: garantiza que cada usuario tenga los datos y permisos correctos | Estimable: el flujo y sus alternos están definidos en el CU-16 | Pequeña: se limita a consultar, buscar y modificar datos y rol; inactivar es la HU17 | Testeable: se verifica con búsquedas, cambios válidos y la regla del último administrador |

#### **Criterios de Aceptación**

**Listado de usuarios** *(RF-27, RNF-04; CU-16 pasos 1-2)*

* Solo el administrador con sesión iniciada debe poder acceder al panel de usuarios.
* El sistema debe consultar la base de datos y mostrar el listado de usuarios registrados con su nombre, correo electrónico, rol y estado.
* El sistema debe indicar cuántos usuarios se muestran.

**Búsqueda** *(RF-31; CU-16 paso 3 y flujo alterno 4.1)*

* El sistema debe permitir buscar usuarios por nombre, correo electrónico o rol.
* Si ningún usuario cumple el criterio, el sistema debe mostrar un mensaje indicando que no se encontraron usuarios con esos criterios de búsqueda y permitir otra búsqueda.

**Edición** *(RF-28; CU-16 pasos 3-5)*

* El administrador debe poder seleccionar un usuario y ver un formulario con sus datos actuales.
* El administrador debe poder modificar el nombre, el correo electrónico y el rol (Cliente o Administrador).
* La edición no incluye el estado de la cuenta (HU17) ni la contraseña, que el usuario recupera por su cuenta (HU05).

**Validación y guardado** *(RNF-06, RNF-10; CU-16 pasos 6-7)*

* El sistema debe validar que los campos estén completos, que el correo tenga un formato válido y que no pertenezca a otro usuario.
* Si los cambios son válidos, el sistema debe guardarlos en la base de datos, actualizar el listado y mostrar una confirmación comprensible.

**Regla del administrador activo** *(CU-16 comentarios)*

* El sistema debe impedir quitar el rol de Administrador al último administrador activo y mostrar un mensaje claro de que siempre debe existir al menos un administrador activo.

**Cancelación** *(CU-16 flujo alterno 5.1 y 7.1)*

* Si el administrador cancela, el sistema no debe guardar cambios en el usuario ni en la base de datos.

**Requisitos no funcionales aplicables**

* La interfaz debe ser clara y consistente (RNF-01) y adaptarse a computadores, tabletas y móviles (RNF-02).

#### Escenarios Gherkin

**Característica:** Actualización de usuarios en el panel de administración de BikeStore

| **Escenario 1** | **Consulta del listado de usuarios** |
| --- | --- |
| **Dado que** | existen usuarios registrados y el administrador tiene sesión iniciada |
| **Cuando** | accede al panel de usuarios |
| **Entonces** | el sistema muestra el listado con nombre, correo, rol y estado de cada usuario |

| **Escenario 2** | **Búsqueda de un usuario** |
| --- | --- |
| **Dado que** | el administrador se encuentra en el listado de usuarios |
| **Cuando** | ingresa un criterio de búsqueda |
| **Entonces** | el sistema muestra únicamente los usuarios que lo cumplen |

| **Escenario 3** | **Búsqueda sin resultados** |
| --- | --- |
| **Dado que** | el administrador se encuentra en el listado de usuarios |
| **Cuando** | ingresa un criterio que ningún usuario cumple |
| **Entonces** | el sistema muestra un mensaje indicando que no se encontraron usuarios con esos criterios |

| **Escenario 4** | **Actualización exitosa de datos** |
| --- | --- |
| **Dado que** | el administrador seleccionó un usuario |
| **Cuando** | modifica su nombre o correo con datos válidos y confirma |
| **Entonces** | el sistema guarda los cambios, actualiza el listado y muestra una confirmación |

| **Escenario 5** | **Cambio de rol** |
| --- | --- |
| **Dado que** | el administrador seleccionó un usuario cliente |
| **Cuando** | le asigna el rol Administrador y confirma |
| **Entonces** | el sistema guarda el cambio y, desde su siguiente inicio de sesión, el usuario accede a las funciones administrativas |

| **Escenario 6** | **Correo perteneciente a otro usuario** |
| --- | --- |
| **Dado que** | el correo ingresado ya pertenece a otro usuario |
| **Cuando** | el administrador confirma la actualización |
| **Entonces** | el sistema muestra un mensaje de error indicando que el correo ya está registrado y no guarda |

| **Escenario 7** | **Último administrador activo** |
| --- | --- |
| **Dado que** | el usuario seleccionado es el único administrador activo |
| **Cuando** | el administrador intenta cambiar su rol a Cliente |
| **Entonces** | el sistema impide el cambio e informa que debe existir al menos un administrador activo |

| **Escenario 8** | **Cancelación de la actualización** |
| --- | --- |
| **Dado que** | el administrador está editando un usuario |
| **Cuando** | cancela |
| **Entonces** | el sistema no guarda los cambios y cierra el formulario |

#### Definition of Done (DoD)

* [ ] Listado de usuarios con nombre, correo, rol y estado
* [ ] Contador de usuarios mostrados
* [ ] Búsqueda por nombre, correo o rol
* [ ] Mensaje cuando la búsqueda no tiene resultados
* [ ] Formulario de edición con los datos actuales del usuario
* [ ] Edición de nombre, correo y rol
* [ ] Validación de campos completos, formato de correo y correo no usado por otro usuario
* [ ] Cambios guardados en la base de datos y reflejados en el listado
* [ ] Regla del último administrador activo implementada en el backend
* [ ] Confirmación comprensible al guardar
* [ ] Opción de cancelar sin guardar cambios
* [ ] Endpoints protegidos para el rol administrador
* [ ] La interfaz se adapta a computador, tableta y móvil
* [ ] Pruebas funcionales de los escenarios Gherkin ejecutadas y aprobadas
* [ ] Código versionado en GitHub y revisado

#### Aprobación del Product Owner

* [ ] Sí
* [ ] No
