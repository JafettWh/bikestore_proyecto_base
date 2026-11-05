# HU14 - Creación de usuarios desde el panel administrativo

**Prioridad:** Alta. Permite al administrador dar de alta cuentas con el rol que corresponde sin depender del registro público. El CU-15 la califica con importancia *Alta*.

**Referencias:** RF-27, RF-28; RNF-01, RNF-02, RNF-04, RNF-05, RNF-06, RNF-10; CU-15 (Crear usuario); CU-03 (reglas de contraseña y correo).

| **Como** | **Quiero** | **Para** |
| --- | --- | --- |
| Administrador de BikeStore | crear cuentas de usuario desde el panel de administración, asignándoles un rol | dar acceso a nuevas personas con los permisos que les corresponden |

#### **INVEST**

| **I** | **N** | **V** | **E** | **S** | **T** |
| --- | --- | --- | --- | --- | --- |
| Independiente en su alcance; requiere sesión de administrador (HU04 y HU06) | Negociable: la forma del formulario (ventana o página) y los mensajes pueden ajustarse | Valiosa: permite administrar quién accede al sistema y con qué rol | Estimable: el flujo y las validaciones están definidos en el CU-15 | Pequeña: se limita a crear usuarios; consultar, editar e inactivar son las HU16 y HU17 | Testeable: se verifica con creaciones exitosas y con cada validación fallida |

#### **Criterios de Aceptación**

**Acceso y formulario** *(RF-27, RF-28, RNF-04; CU-15 pasos 1-2)*

* Solo el administrador con sesión iniciada debe poder crear usuarios desde el panel de administración.
* El sistema debe mostrar un formulario con los campos obligatorios: nombre, correo electrónico, contraseña y rol.
* El rol debe seleccionarse entre Cliente y Administrador.
* El campo de contraseña debe indicar el mínimo de 8 caracteres y permitir mostrar u ocultar lo digitado (RNF-01).

**Validaciones** *(RNF-06; CU-15 paso 4 y flujos alternos 4.1 y 4.2)*

* El sistema debe validar que los campos estén completos; si faltan, debe mostrar un mensaje indicando los campos pendientes.
* El correo electrónico debe tener un formato válido y no estar registrado previamente; si ya existe, el sistema debe mostrar un mensaje de error indicándolo.
* La contraseña debe tener mínimo 8 caracteres, igual que en el registro (CU-03).
* Si hay errores, el sistema debe volver al formulario conservando los datos ingresados para corregirlos.

**Creación** *(RF-27, RF-28, RNF-05, RNF-10; CU-15 paso 5)*

* Al confirmar, el sistema debe cifrar la contraseña con bcrypt, registrar el usuario con el rol asignado y en estado Activo, y actualizar el listado de usuarios.
* El sistema debe mostrar una confirmación comprensible de la creación.

**Cancelación** *(CU-15 flujo alterno 3.1 y 5.1)*

* Si el administrador cancela, el sistema no debe registrar al usuario ni actualizar el listado.

**Requisitos no funcionales aplicables**

* La interfaz debe ser clara y consistente (RNF-01) y adaptarse a computadores, tabletas y móviles (RNF-02).

#### Escenarios Gherkin

**Característica:** Creación de usuarios en el panel de administración de BikeStore

| **Escenario 1** | **Creación exitosa de un usuario** |
| --- | --- |
| **Dado que** | el administrador se encuentra en el formulario de creación de usuario |
| **Cuando** | diligencia todos los campos con datos válidos, asigna un rol y confirma |
| **Entonces** | el sistema cifra la contraseña, registra el usuario activo con el rol asignado, actualiza el listado y muestra una confirmación |

| **Escenario 2** | **Campos pendientes** |
| --- | --- |
| **Dado que** | el administrador se encuentra en el formulario de creación de usuario |
| **Cuando** | deja campos obligatorios sin diligenciar y confirma |
| **Entonces** | el sistema muestra un mensaje indicando los campos pendientes y conserva los datos ingresados |

| **Escenario 3** | **Correo con formato inválido** |
| --- | --- |
| **Dado que** | el administrador se encuentra en el formulario de creación de usuario |
| **Cuando** | ingresa un correo con formato incorrecto |
| **Entonces** | el sistema muestra un mensaje de error de formato y le pide corregirlo |

| **Escenario 4** | **Correo ya registrado** |
| --- | --- |
| **Dado que** | ya existe un usuario con el correo ingresado |
| **Cuando** | el administrador confirma la creación |
| **Entonces** | el sistema muestra un mensaje indicando que el correo ya está registrado |

| **Escenario 5** | **Contraseña inválida** |
| --- | --- |
| **Dado que** | el administrador se encuentra en el formulario de creación de usuario |
| **Cuando** | ingresa una contraseña de menos de 8 caracteres |
| **Entonces** | el sistema muestra un mensaje de error de formato de contraseña |

| **Escenario 6** | **Creación de un usuario administrador** |
| --- | --- |
| **Dado que** | el administrador crea un usuario con rol Administrador |
| **Cuando** | ese usuario inicia sesión |
| **Entonces** | el sistema le permite acceder a las funcionalidades administrativas |

| **Escenario 7** | **Cancelación de la creación** |
| --- | --- |
| **Dado que** | el administrador se encuentra en el formulario de creación de usuario |
| **Cuando** | cancela |
| **Entonces** | el sistema cierra el formulario sin registrar el usuario ni actualizar el listado |

#### Definition of Done (DoD)

* [ ] Formulario de creación con nombre, correo electrónico, contraseña y rol
* [ ] Rol seleccionable entre Cliente y Administrador
* [ ] Campo de contraseña con indicación del mínimo de 8 caracteres y opción de mostrar u ocultar
* [ ] Validación de campos completos con mensaje de campos pendientes
* [ ] Validación de formato del correo y de que no esté registrado
* [ ] Validación de contraseña de mínimo 8 caracteres
* [ ] Contraseña cifrada con bcrypt antes de almacenarse
* [ ] Usuario registrado en estado Activo con el rol asignado
* [ ] Listado de usuarios actualizado tras la creación
* [ ] Confirmación comprensible al crear
* [ ] Los datos ingresados se conservan cuando hay errores
* [ ] Opción de cancelar sin registrar nada
* [ ] Endpoint protegido para el rol administrador
* [ ] La interfaz se adapta a computador, tableta y móvil
* [ ] Pruebas funcionales de los escenarios Gherkin ejecutadas y aprobadas
* [ ] Código versionado en GitHub y revisado

#### Aprobación del Product Owner

* [ ] Sí
* [ ] No
