# HU04 - Inicio de sesión en el aplicativo web BikeStore

**Prioridad:** Alta. Es requisito previo para comprar y para toda función administrativa. El CU-04 la califica como *Vital*.

**Referencias:** RF-15; RNF-01, RNF-04, RNF-05; CU-04 (Iniciar sesión); CU-08 (cita al CU-04).

| **Como** | **Quiero** | **Para** |
| --- | --- | --- |
| Usuario registrado de BikeStore | iniciar sesión con mi correo electrónico y contraseña | acceder a las funcionalidades que corresponden a mi rol |

#### **INVEST**

| **I** | **N** | **V** | **E** | **S** | **T** |
| --- | --- | --- | --- | --- | --- |
| Independiente en su desarrollo; requiere que existan cuentas, que se crean con la HU03 o con datos de prueba | Negociable: el diseño del formulario y la vista a la que se redirige pueden ajustarse | Valiosa: protege el acceso y habilita la compra y la administración | Estimable: el flujo está definido en el CU-04 | Pequeña: se limita a autenticar y generar la sesión | Testeable: se verifica con credenciales válidas, inválidas, inexistentes y de cuentas inactivas |

#### **Criterios de Aceptación**

**Formulario de inicio de sesión** *(RF-15; CU-04 pasos 1-3)*

* El sistema debe mostrar un formulario con correo electrónico y contraseña obligatorios.
* El campo de contraseña debe permitir mostrar u ocultar lo digitado (RNF-01).
* Si algún campo está vacío, el sistema debe mostrar un mensaje indicando que debe llenarlos (CU-04 flujo alterno 4.1).
* Si el correo o la contraseña tienen un formato inválido, el sistema debe mostrar un mensaje de error (CU-04 flujo alterno 4.2).

**Validación de credenciales** *(RF-15, RNF-05; CU-04 paso 4)*

* El sistema debe validar las credenciales contra la base de datos, comparando la contraseña con su versión cifrada, y verificar el estado de la cuenta.
* Si no existe una cuenta con esas credenciales, el sistema debe informarlo y sugerir el registro (CU-04 flujo alterno 4.3).
* Si la cuenta está inactiva, el sistema debe denegar el acceso e informarlo (CU-04 flujo alterno 4.4).

**Sesión y redirección según rol** *(RNF-04; CU-04 paso 6; CU-08 paso 1)*

* Con credenciales válidas, el sistema debe generar un token JWT y redirigir al usuario a la interfaz correspondiente a su rol.
* Si el usuario llegó al inicio de sesión desde "Finalizar compra", el sistema debe llevarlo de regreso al proceso de compra al autenticarse.

#### Escenarios Gherkin

**Característica:** Inicio de sesión en el aplicativo web BikeStore

| **Escenario 1** | **Inicio de sesión exitoso** |
| --- | --- |
| **Dado que** | el usuario tiene una cuenta activa registrada |
| **Cuando** | ingresa su correo y contraseña correctos y confirma |
| **Entonces** | el sistema genera un token JWT y lo redirige a la interfaz de su rol |

| **Escenario 2** | **Campos vacíos** |
| --- | --- |
| **Dado que** | el usuario se encuentra en el formulario de inicio de sesión |
| **Cuando** | deja algún campo vacío e intenta continuar |
| **Entonces** | el sistema muestra un mensaje indicando que debe llenar todos los campos |

| **Escenario 3** | **Formato inválido** |
| --- | --- |
| **Dado que** | el usuario se encuentra en el formulario de inicio de sesión |
| **Cuando** | ingresa un correo o una contraseña con formato inválido |
| **Entonces** | el sistema muestra un mensaje de error de formato |

| **Escenario 4** | **Cuenta inexistente o credenciales incorrectas** |
| --- | --- |
| **Dado que** | no existe una cuenta con las credenciales ingresadas |
| **Cuando** | el usuario confirma el inicio de sesión |
| **Entonces** | el sistema informa que no existe una cuenta con esas credenciales y sugiere registrarse |

| **Escenario 5** | **Cuenta inactiva** |
| --- | --- |
| **Dado que** | la cuenta del usuario se encuentra inactiva |
| **Cuando** | intenta iniciar sesión |
| **Entonces** | el sistema deniega el acceso e informa que la cuenta está inactiva |

| **Escenario 6** | **Inicio de sesión desde la compra** |
| --- | --- |
| **Dado que** | el visitante presionó "Finalizar compra" sin haber iniciado sesión |
| **Cuando** | inicia sesión con credenciales válidas |
| **Entonces** | el sistema lo lleva de regreso al proceso de compra |

#### Definition of Done (DoD)

* [ ] Formulario de inicio de sesión implementado
* [ ] Campo de contraseña con opción de mostrar u ocultar
* [ ] Validación de campos vacíos y de formato
* [ ] Validación de credenciales contra la base de datos usando bcrypt
* [ ] Verificación del estado de la cuenta (activa o inactiva)
* [ ] Generación de token JWT al iniciar sesión
* [ ] Redirección a la interfaz correspondiente al rol
* [ ] Retorno al proceso de compra cuando el inicio de sesión se solicitó desde "Finalizar compra"
* [ ] Mensajes de error claros para cada caso
* [ ] Endpoint de autenticación implementado
* [ ] Pruebas funcionales de los escenarios Gherkin ejecutadas y aprobadas
* [ ] Código versionado en GitHub y revisado

#### Aprobación del Product Owner

* [ ] Sí
* [ ] No
