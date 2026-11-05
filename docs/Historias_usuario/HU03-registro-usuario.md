# HU03 - Registro en el aplicativo web BikeStore

**Prioridad:** Alta. Sin cuenta no es posible comprar ni acceder a las funciones protegidas. El CU-03 la califica como *Vital*.

**Referencias:** RF-13, RF-14; RNF-01, RNF-05, RNF-10; CU-03 (Registrarse).

| **Como** | **Quiero** | **Para** |
| --- | --- | --- |
| Visitante de BikeStore | registrarme con mi nombre, correo electrónico y contraseña | acceder de forma segura a las funcionalidades reservadas a usuarios autenticados |

#### **INVEST**

| **I** | **N** | **V** | **E** | **S** | **T** |
| --- | --- | --- | --- | --- | --- |
| Independiente: no depende de otra funcionalidad; es el punto de partida de la gestión de usuarios | Negociable: el diseño del formulario y los textos de los mensajes pueden ajustarse durante el desarrollo | Valiosa: aporta seguridad y permite identificar a cada cliente en el aplicativo | Estimable: el flujo y las validaciones están definidos en el CU-03 | Pequeña: se limita a crear la cuenta; el inicio de sesión se trata en la HU04 | Testeable: se verifica con registros exitosos y con cada una de las validaciones fallidas |

#### **Criterios de Aceptación**

**Formulario y campos obligatorios** *(RF-13; CU-03 pasos 1-4)*

* El sistema debe mostrar un formulario de registro con los campos nombre, correo electrónico, contraseña y teléfono.
* El campo de contraseña debe indicar el mínimo de 8 caracteres y permitir mostrar u ocultar lo digitado (RNF-01).
* El sistema debe mostrar una casilla donde se deban aceptar los términos y condiciones del aplicativo para registrarse en BikeStore.
* Si algún campo está vacío, el sistema debe mostrar un mensaje indicando que se deben llenar todos los campos para avanzar (CU-03 flujo alterno 4.3).

**Validación del correo electrónico** *(RF-14; CU-03 pasos 4 y 7)*

* El correo electrónico debe tener un formato válido; de lo contrario, el sistema debe mostrar un mensaje de error de formato incorrecto (CU-03 flujo alterno 4.1).
* El correo electrónico no debe estar registrado previamente; de lo contrario, el sistema debe indicar que el correo ya existe (CU-03 flujo alterno 7.1).

**Validación de la contraseña** *(RF-13; CU-03 paso 4)*

* La contraseña debe tener mínimo 8 caracteres; de lo contrario, el sistema debe mostrar un mensaje de error de formato incorrecto (CU-03 flujo alterno 4.2).

**Creación de la cuenta** *(RNF-05; CU-03 pasos 6-8)*

* Al confirmar el envío, el sistema debe cifrar la contraseña con bcrypt, de modo que nunca se almacene en texto plano, y crear la cuenta en estado activo.
* Una vez creada la cuenta, el sistema debe redirigir al usuario al formulario de inicio de sesión (CU-04).

**Mensajes comprensibles** *(RNF-10)*

* Los mensajes de error y confirmación deben ser claros y comprensibles para el usuario.

#### Escenarios Gherkin

**Característica:** Registro de usuarios en el aplicativo web BikeStore

| **Escenario 1** | **Registro exitoso** |
| --- | --- |
| **Dado que** | el visitante se encuentra en el formulario de registro |
| **Cuando** | diligencia nombre, un correo válido no registrado y una contraseña de al menos 8 caracteres, y confirma |
| **Entonces** | el sistema crea la cuenta con la contraseña cifrada y redirige al formulario de inicio de sesión |

| **Escenario 2** | **Registro con campos vacíos** |
| --- | --- |
| **Dado que** | el visitante se encuentra en el formulario de registro |
| **Cuando** | deja uno o más campos sin diligenciar e intenta continuar |
| **Entonces** | el sistema muestra un mensaje indicando que debe llenar todos los campos |

| **Escenario 3** | **Registro con correo de formato inválido** |
| --- | --- |
| **Dado que** | el visitante se encuentra en el formulario de registro |
| **Cuando** | ingresa un correo con formato incorrecto |
| **Entonces** | el sistema muestra un mensaje de error de formato de correo y le pide corregirlo |

| **Escenario 4** | **Registro con contraseña inválida** |
| --- | --- |
| **Dado que** | el visitante se encuentra en el formulario de registro |
| **Cuando** | ingresa una contraseña de menos de 8 caracteres |
| **Entonces** | el sistema muestra un mensaje de error de formato de contraseña |

| **Escenario 5** | **Registro con correo ya existente** |
| --- | --- |
| **Dado que** | ya existe una cuenta con el correo ingresado |
| **Cuando** | el visitante confirma el envío del formulario |
| **Entonces** | el sistema muestra un mensaje indicando que el correo ya existe |

#### Definition of Done (DoD)

* [ ] Formulario de registro implementado con nombre, correo electrónico y contraseña
* [ ] Todos los campos son obligatorios
* [ ] Campo de contraseña con indicación del mínimo de 8 caracteres y opción de mostrar u ocultar
* [ ] Validación del formato del correo electrónico
* [ ] Validación de que el correo no esté registrado previamente
* [ ] Validación de contraseña de mínimo 8 caracteres
* [ ] Contraseña cifrada con bcrypt antes de almacenarse
* [ ] La cuenta se crea en estado activo
* [ ] Mensajes de error claros para cada validación
* [ ] El usuario es redirigido al inicio de sesión tras el registro exitoso
* [ ] Endpoint de registro implementado y conectado a la base de datos
* [ ] Pruebas funcionales de los escenarios Gherkin ejecutadas y aprobadas
* [ ] Código versionado en GitHub y revisado

#### Aprobación del Product Owner

* [ ] Sí
* [ ] No
