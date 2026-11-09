# HU06 - Control de acceso a funcionalidades según el rol del usuario

**Prioridad:** Alta. Protege las funciones administrativas y la compra frente a personas no autorizadas. Es una restricción transversal del sistema, por eso no tiene un caso de uso propio.

**Referencias:** RF-30; RNF-04, RNF-10; CU-04 (paso 6, redirección según rol); CU-08 (precondición de sesión iniciada); CU-09 a CU-17 (funciones administrativas).

| **Como** | **Quiero** | **Para** |
| --- | --- | --- |
| Administrador de BikeStore | que el sistema controle el acceso a las funcionalidades según el rol de cada usuario | evitar que personas no autorizadas accedan a funciones administrativas o a operaciones que requieren sesión |

#### **INVEST**

| **I** | **N** | **V** | **E** | **S** | **T** |
| --- | --- | --- | --- | --- | --- |
| Independiente en su alcance, aunque se apoya en el rol y el token que entrega el inicio de sesión (HU04) | Negociable: los mensajes de acceso denegado y la vista a la que se redirige pueden ajustarse | Valiosa: garantiza la seguridad de la información comercial y de los usuarios | Estimable: se resuelve con la verificación del token y del rol en la interfaz y en la API | Pequeña: se limita a restringir el acceso; no incluye la gestión de roles (HU15 y HU16) | Testeable: se verifica intentando acceder a cada funcionalidad con cada rol |

#### **Criterios de Aceptación**

**Roles y permisos** *(RF-30; CU-04 paso 6)*

* El sistema debe distinguir tres perfiles de acceso: visitante (sin sesión), cliente y administrador.
* Las funcionalidades administrativas (gestión de productos, de usuarios, dashboard e informes, CU-09 a CU-17) solo deben estar disponibles para el administrador.
* La realización de la compra (CU-08) solo debe estar disponible para el cliente que haya iniciado sesión.

**Acceso no autorizado** *(RNF-04, RNF-10)*

* Si un visitante intenta acceder a una funcionalidad que requiere sesión, el sistema debe llevarlo al inicio de sesión.
* Si un cliente o un visitante intenta acceder a una funcionalidad administrativa, el sistema debe denegar el acceso y mostrar un mensaje claro.

**Interfaz según el rol** *(RF-30)*

* La interfaz solo debe mostrar las opciones que correspondan al rol del usuario autenticado.

**Validación en el servidor** *(RNF-04)*

* El control de acceso no debe depender solo de ocultar opciones en la interfaz: la API debe verificar el token y el rol en cada solicitud a una función protegida y rechazar las que no cumplan.

#### Escenarios Gherkin

**Característica:** Control de acceso según el rol en el aplicativo web BikeStore

| **Escenario 1** | **El administrador accede a las funciones administrativas** |
| --- | --- |
| **Dado que** | el usuario inició sesión con rol de administrador |
| **Cuando** | accede al panel de administración |
| **Entonces** | el sistema le permite ver y usar las funcionalidades administrativas |

| **Escenario 2** | **Un cliente intenta acceder a una función administrativa** |
| --- | --- |
| **Dado que** | el usuario inició sesión con rol de cliente |
| **Cuando** | intenta acceder al panel de administración |
| **Entonces** | el sistema deniega el acceso y muestra un mensaje de acceso no autorizado |

| **Escenario 3** | **Un visitante intenta acceder a una función administrativa** |
| --- | --- |
| **Dado que** | el usuario no ha iniciado sesión |
| **Cuando** | intenta acceder al panel de administración |
| **Entonces** | el sistema lo lleva al inicio de sesión |

| **Escenario 4** | **Un visitante intenta finalizar una compra** |
| --- | --- |
| **Dado que** | el usuario no ha iniciado sesión y tiene productos en el carrito |
| **Cuando** | presiona "Finalizar compra" |
| **Entonces** | el sistema lo lleva al inicio de sesión |

| **Escenario 5** | **Solicitud a la API sin autorización** |
| --- | --- |
| **Dado que** | una solicitud a una función administrativa no incluye un token válido o corresponde a un rol sin permiso |
| **Cuando** | el sistema recibe la solicitud |
| **Entonces** | la rechaza sin ejecutar la operación |

#### Definition of Done (DoD)

* [ ] Middleware de autenticación que verifica el token JWT en el backend
* [ ] Middleware de autorización por rol aplicado a las rutas administrativas
* [ ] Rutas protegidas en el frontend según sesión y rol
* [ ] La interfaz muestra solo las opciones del rol del usuario
* [ ] Mensaje claro cuando el acceso es denegado
* [ ] Redirección al inicio de sesión cuando se requiere autenticación
* [ ] Pruebas funcionales con visitante, cliente y administrador
* [ ] Código versionado en GitHub y revisado

#### Aprobación del Product Owner

* [ ] Sí
* [ ] No
