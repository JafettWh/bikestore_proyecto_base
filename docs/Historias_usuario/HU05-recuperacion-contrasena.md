# HU05 - Recuperación de contraseña

**Prioridad:** Alta. Permite recuperar el acceso a la cuenta sin intervención del administrador.

**Referencias:** RF-16; RNF-05, RNF-10; CU-05 (Recuperar contraseña).

| **Como** | **Quiero** | **Para** |
| --- | --- | --- |
| Usuario registrado de BikeStore | recuperar mi contraseña mediante un código enviado a mi correo electrónico | volver a acceder a mi cuenta cuando la he olvidado |

#### **INVEST**

| **I** | **N** | **V** | **E** | **S** | **T** |
| --- | --- | --- | --- | --- | --- |
| Independiente en su desarrollo; requiere cuentas existentes y un servicio de envío de correo | Negociable: el diseño de los formularios y el texto del correo pueden ajustarse | Valiosa: evita que el usuario pierda su cuenta por un olvido | Estimable: los 11 pasos y los 6 flujos alternos están definidos en el CU-05 | Pequeña: se limita al proceso de recuperación en tres pasos (correo, código, nueva contraseña) | Testeable: se verifica con el recorrido completo y con cada flujo alterno |

#### **Criterios de Aceptación**

**Solicitud de recuperación** *(RF-16; CU-05 pasos 1-5)*

* El proceso debe presentarse en tres pasos: solicitar el código, confirmar el código y definir la nueva contraseña, y cada paso solo debe habilitarse cuando se completa el anterior.
* El sistema debe permitir solicitar la recuperación y pedir el correo electrónico asociado a la cuenta.
* El sistema debe validar que el correo tenga un formato correcto y corresponda a una cuenta registrada y activa.
* Si el correo no corresponde a una cuenta, la cuenta está inactiva o el formato es incorrecto, el sistema debe mostrar el mensaje de error correspondiente (CU-05 flujos alternos 4.1, 4.2 y 4.3).
* Si el correo es válido, el sistema debe enviar un correo con un código de recuperación.

**Verificación del código** *(CU-05 pasos 6-8)*

* El sistema debe mostrar un formulario donde el usuario ingrese el código recibido.
* Si el código es incorrecto, el sistema debe informarlo y permitir ingresarlo de nuevo (CU-05 flujo alterno 8.1).

**Nueva contraseña** *(RNF-05; CU-05 pasos 8-11)*

* La nueva contraseña debe tener mínimo 8 caracteres y ser diferente a la anterior; de lo contrario, el sistema debe mostrar el mensaje correspondiente (CU-05 flujos alternos 10.1 y 10.2).
* El sistema debe cifrar la nueva contraseña con bcrypt, actualizarla en la base de datos y redirigir al usuario al inicio de sesión (CU-04).

**Mensajes comprensibles** *(RNF-10)*

* Los mensajes de error y confirmación deben ser claros y comprensibles.

#### Escenarios Gherkin

**Característica:** Recuperación de contraseña en el aplicativo web BikeStore

| **Escenario 1** | **Recuperación exitosa** |
| --- | --- |
| **Dado que** | el usuario tiene una cuenta activa y olvidó su contraseña |
| **Cuando** | solicita la recuperación, ingresa el código recibido por correo y define una nueva contraseña válida |
| **Entonces** | el sistema actualiza la contraseña cifrada y lo redirige al inicio de sesión |

| **Escenario 2** | **Correo no registrado** |
| --- | --- |
| **Dado que** | el usuario se encuentra en el formulario de recuperación |
| **Cuando** | ingresa un correo sin cuenta asociada |
| **Entonces** | el sistema muestra un mensaje indicando que no existe una cuenta asociada a ese correo |

| **Escenario 3** | **Cuenta inactiva** |
| --- | --- |
| **Dado que** | el correo corresponde a una cuenta inactiva |
| **Cuando** | el usuario solicita la recuperación |
| **Entonces** | el sistema muestra un mensaje indicando que la cuenta está inactiva |

| **Escenario 4** | **Correo con formato incorrecto** |
| --- | --- |
| **Dado que** | el usuario se encuentra en el formulario de recuperación |
| **Cuando** | ingresa un correo con formato incorrecto |
| **Entonces** | el sistema muestra un mensaje de error de formato y le pide corregirlo |

| **Escenario 5** | **Código incorrecto** |
| --- | --- |
| **Dado que** | el usuario recibió el código por correo |
| **Cuando** | ingresa un código incorrecto |
| **Entonces** | el sistema muestra que el código es incorrecto y permite ingresarlo de nuevo |

| **Escenario 6** | **Contraseña nueva inválida** |
| --- | --- |
| **Dado que** | el usuario verificó el código correctamente |
| **Cuando** | ingresa una contraseña de menos de 8 caracteres |
| **Entonces** | el sistema indica que la contraseña debe tener al menos 8 caracteres |

| **Escenario 7** | **Contraseña igual a la anterior** |
| --- | --- |
| **Dado que** | el usuario verificó el código correctamente |
| **Cuando** | ingresa una contraseña igual a la anterior |
| **Entonces** | el sistema indica que debe ingresar una contraseña nueva o iniciar sesión con la existente |

#### Definition of Done (DoD)

* [ ] Formulario de solicitud de recuperación implementado
* [ ] Proceso presentado en tres pasos secuenciales
* [ ] Validación de formato, existencia y estado de la cuenta
* [ ] Envío del código de recuperación al correo del usuario
* [ ] Formulario de verificación del código implementado
* [ ] Formulario de nueva contraseña con validación de mínimo 8 caracteres
* [ ] Validación de que la nueva contraseña sea diferente a la anterior
* [ ] Nueva contraseña cifrada con bcrypt y actualizada en la base de datos
* [ ] Redirección al inicio de sesión al finalizar
* [ ] Mensajes de error claros para cada flujo alterno
* [ ] Endpoints del proceso de recuperación implementados
* [ ] Pruebas funcionales de los escenarios Gherkin ejecutadas y aprobadas
* [ ] Código versionado en GitHub y revisado

#### Aprobación del Product Owner

* [ ] Sí
* [ ] No
