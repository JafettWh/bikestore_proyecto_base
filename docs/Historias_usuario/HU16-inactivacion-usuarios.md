# HU16 - Inactivación de usuarios

**Prioridad:** Alta. Permite bloquear el acceso de una cuenta sin perder su información. El CU-17 la califica con importancia *Alta*.

**Referencias:** RF-29 (solo inactivar), RF-31; RNF-01, RNF-04, RNF-06, RNF-10; CU-17 (Inactivar usuario); CU-04 (flujo alterno 4.4).

| **Como** | **Quiero** | **Para** |
| --- | --- | --- |
| Administrador de BikeStore | inactivar la cuenta de un usuario | impedirle el acceso al sistema sin eliminar su información |

#### **INVEST**

| **I** | **N** | **V** | **E** | **S** | **T** |
| --- | --- | --- | --- | --- | --- |
| Independiente en su alcance; su efecto se comprueba en el inicio de sesión (HU04) | Negociable: el texto de la confirmación y la forma de presentarla pueden ajustarse | Valiosa: protege el sistema frente a cuentas que ya no deben acceder y conserva el historial | Estimable: el flujo está definido en el CU-17 | Pequeña: se limita a inactivar; la reactivación no se contempla | Testeable: se verifica con inactivaciones confirmadas, canceladas y la regla del último administrador |

#### **Criterios de Aceptación**

**Selección del usuario** *(RF-31; CU-17 pasos 1-3 y flujo alterno 4.1)*

* Solo el administrador con sesión iniciada debe poder inactivar usuarios.
* El administrador debe poder ubicar un usuario activo desde el listado, usando la búsqueda por nombre, correo o rol (HU16).
* Si la búsqueda no encuentra usuarios, el sistema debe mostrar un mensaje indicando que no se encontraron usuarios con esos criterios.
* La opción de inactivar solo debe estar disponible para usuarios activos.

**Confirmación** *(CU-17 pasos 4-5 y flujo alterno 5.1)*

* El sistema debe solicitar confirmación antes de inactivar la cuenta.
* Si el administrador cancela, el sistema debe cerrar el aviso sin realizar cambios en la base de datos ni en el listado.

**Inactivación** *(RF-29, RNF-06, RNF-10; CU-17 paso 6)*

* Al confirmar, el sistema debe cambiar el estado del usuario a Inactivo en la base de datos y en el listado, y mostrar una confirmación comprensible.
* La inactivación no debe eliminar la información del usuario.
* Una cuenta inactiva no debe poder iniciar sesión; el sistema debe denegar el acceso e informarlo (HU04, flujo alterno 4.4).

**Regla del administrador activo** *(CU-17 flujo alterno 4.2)*

* El sistema debe impedir inactivar al último administrador activo y notificar que debe existir al menos un administrador activo.

**Requisitos no funcionales aplicables**

* La interfaz debe ser clara y consistente (RNF-01) y los mensajes comprensibles (RNF-10).

#### Escenarios Gherkin

**Característica:** Inactivación de usuarios en el panel de administración de BikeStore

| **Escenario 1** | **Inactivación exitosa** |
| --- | --- |
| **Dado que** | el administrador seleccionó un usuario activo |
| **Cuando** | confirma la inactivación |
| **Entonces** | el sistema cambia el estado a Inactivo en la base de datos y en el listado, y muestra una confirmación |

| **Escenario 2** | **Búsqueda sin resultados** |
| --- | --- |
| **Dado que** | el administrador busca un usuario para inactivarlo |
| **Cuando** | ningún usuario cumple el criterio |
| **Entonces** | el sistema muestra un mensaje indicando que no se encontraron usuarios con esos criterios |

| **Escenario 3** | **Último administrador activo** |
| --- | --- |
| **Dado que** | el usuario seleccionado es el único administrador activo |
| **Cuando** | el administrador intenta inactivarlo |
| **Entonces** | el sistema impide la acción e informa que debe existir al menos un administrador activo |

| **Escenario 4** | **Cancelación de la inactivación** |
| --- | --- |
| **Dado que** | el sistema solicitó confirmar la inactivación |
| **Cuando** | el administrador cancela |
| **Entonces** | el sistema cierra el aviso sin realizar cambios |

| **Escenario 5** | **Cuenta inactiva no puede iniciar sesión** |
| --- | --- |
| **Dado que** | la cuenta de un usuario fue inactivada |
| **Cuando** | el usuario intenta iniciar sesión |
| **Entonces** | el sistema deniega el acceso e informa que la cuenta está inactiva |

| **Escenario 6** | **La información del usuario se conserva** |
| --- | --- |
| **Dado que** | un usuario fue inactivado |
| **Cuando** | el administrador consulta el listado |
| **Entonces** | el usuario aparece con estado Inactivo y su información intacta |

#### Definition of Done (DoD)

* [ ] Opción de inactivar disponible solo para usuarios activos
* [ ] Ventana de confirmación antes de inactivar
* [ ] Cambio de estado a Inactivo guardado en la base de datos y reflejado en el listado
* [ ] La información del usuario no se elimina
* [ ] Cuenta inactiva sin acceso al iniciar sesión, con mensaje claro
* [ ] Regla del último administrador activo implementada en el backend
* [ ] Mensaje cuando la búsqueda no tiene resultados
* [ ] Confirmación comprensible al inactivar
* [ ] Opción de cancelar sin cambios
* [ ] Endpoint protegido para el rol administrador
* [ ] Pruebas funcionales de los escenarios Gherkin ejecutadas y aprobadas
* [ ] Código versionado en GitHub y revisado

#### Aprobación del Product Owner

* [ ] Sí
* [ ] No
