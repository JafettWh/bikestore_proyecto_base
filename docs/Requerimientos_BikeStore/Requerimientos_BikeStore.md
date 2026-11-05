# Requerimientos de BikeStore

**Fuente:** documento oficial *Proyecto didáctico de desarrollo de software: Bike Store* (SENA, ADSO, CBI Palmira). El texto de cada requerimiento es el oficial, sin modificaciones. Las columnas de trazabilidad (CU y HU) se obtuvieron de los casos de uso y de las historias de usuario del proyecto.

**Resumen:** 31 requerimientos funcionales (RF-01 a RF-31) y 12 requerimientos no funcionales (RNF-01 a RNF-12).

## Requerimientos funcionales

### Gestión del catálogo

| ID | Requisito | Caso de uso | Historia de usuario |
| --- | --- | --- | --- |
| **RF-01** | El sistema deberá permitir al cliente consultar el catálogo de productos disponibles sin estar logeado | CU-01 | HU01 |
| **RF-02** | El sistema deberá mostrar para cada producto su imagen, nombre, precio y disponibilidad. | CU-01, CU-02 | HU01, HU02 |
| **RF-03** | El sistema deberá permitir filtrar los productos por categoría. | CU-01 | HU01 |
| **RF-04** | El sistema deberá permitir un filtro de ordenación para los productos por precio ascendente o descendente. | CU-01 | HU01 |

### Carrito de compras

| ID | Requisito | Caso de uso | Historia de usuario |
| --- | --- | --- | --- |
| **RF-05** | El sistema deberá permitir al cliente agregar productos al carrito desde el catálogo o desde el detalle del producto. | CU-06 | HU02, HU07 |
| **RF-06** | El sistema deberá mostrar en el carrito los productos seleccionados, cantidades y valores correspondientes (parciales y total). | CU-07 | HU07, HU08 |
| **RF-07** | El sistema deberá permitir modificar la cantidad de productos del carrito. | CU-07 | HU08 |
| **RF-08** | El sistema deberá conservar el carrito asociado al cliente para permitir su recuperación posteriormente. | — | HU09 |

### Gestión de compras y pagos

| ID | Requisito | Caso de uso | Historia de usuario |
| --- | --- | --- | --- |
| **RF-09** | El sistema deberá permitir al cliente consultar el resumen de su pedido antes de realizar el pago. | CU-08 | HU10 |
| **RF-10** | El sistema deberá generar un número único para cada pedido. | CU-08 | HU10 |
| **RF-11** | El sistema deberá permitir realizar un pago simulado con datos de cuenta, dirección de envío y terminar con un aviso exitoso de pago. | CU-08 | HU10 |
| **RF-12** | El sistema deberá generar una confirmación cuando el pago haya sido procesado exitosamente. | CU-08 | HU10 |

### Gestión de usuarios

| ID | Requisito | Caso de uso | Historia de usuario |
| --- | --- | --- | --- |
| **RF-13** | El sistema deberá permitir al cliente registrarse proporcionando nombre, correo electrónico y contraseña. | CU-03 | HU03 |
| **RF-14** | El sistema deberá validar el correo electrónico durante el registro. | CU-03 | HU03 |
| **RF-15** | El sistema deberá permitir al usuario iniciar sesión utilizando correo electrónico y contraseña. | CU-04 | HU04 |
| **RF-16** | El sistema deberá permitir al usuario recuperar su contraseña. | CU-05 | HU05 |

### Administración de productos

| ID | Requisito | Caso de uso | Historia de usuario |
| --- | --- | --- | --- |
| **RF-17** | El sistema deberá permitir al administrador registrar productos. | CU-09 | HU11 |
| **RF-18** | El sistema deberá permitir al administrador actualizar precios y existencias, etc. | CU-11 | HU13 |
| **RF-19** | El sistema deberá permitir al administrador inactivar productos. | CU-12 | HU14 |
| **RF-20** | El sistema deberá permitir al administrador consultar, buscar y filtrar productos. | CU-10 | HU12 |

### Tablero de control e informes

| ID | Requisito | Caso de uso | Historia de usuario |
| --- | --- | --- | --- |
| **RF-21** | El sistema deberá proporcionar al administrador un dashboard con métricas y alertas propias de la operación comercial. | CU-13 | HU18 |
| **RF-22** | El sistema deberá mostrar las ventas totales. | CU-13 | HU18 |
| **RF-23** | El sistema deberá mostrar los productos más vendidos. | CU-13 | HU18 |
| **RF-24** | El sistema deberá mostrar la cantidad de pedidos. | CU-13 | HU18 |
| **RF-25** | El sistema deberá permitir filtrar la información por fechas y categorías. | CU-13 | HU18 |
| **RF-26** | El sistema deberá permitir exportar los informes en formato Excel o PDF para el proyecto. | CU-14 | HU19 |

### Administración y seguridad

| ID | Requisito | Caso de uso | Historia de usuario |
| --- | --- | --- | --- |
| **RF-27** | El sistema deberá permitir al administrador consultar el listado de usuarios. | CU-15, CU-16 | HU15, HU16 |
| **RF-28** | El sistema deberá permitir al administrador asignar roles a los usuarios. | CU-15, CU-16 | HU15, HU16 |
| **RF-29** | El sistema deberá permitir activar o desactivar cuentas de usuario. | CU-17 | HU17 |
| **RF-30** | El sistema deberá controlar el acceso a funcionalidades de acuerdo con el rol del usuario. | — | HU06 |
| **RF-31** | El sistema deberá permitir buscar usuarios desde el panel administrativo. | CU-16, CU-17 | HU16, HU17 |

## Requerimientos no funcionales

| ID | Categoría | Requisito | Historias de usuario que lo citan |
| --- | --- | --- | --- |
| **RNF-01** | Usabilidad | La interfaz deberá ser clara, consistente y permitir que las operaciones principales sean realizadas de manera intuitiva. (patrón de diseño y patrón de comportamiento). | HU01, HU02, HU03, HU04, HU07, HU08, HU10, HU11, HU12, HU13, HU14, HU15, HU16, HU17, HU18, HU19 |
| **RNF-02** | Responsive | La interfaz deberá adaptarse a computadores, tabletas y dispositivos móviles. | HU01, HU02, HU08, HU10, HU11, HU12, HU13, HU15, HU16, HU18 |
| **RNF-03** | Rendimiento | Las operaciones de consulta del catálogo deberán responder en un tiempo adecuado bajo las condiciones de carga definidas para el proyecto. | HU01, HU18 |
| **RNF-04** | Seguridad | El sistema deberá impedir el acceso de usuarios no autorizados a las funcionalidades administrativas. | HU04, HU06, HU11, HU12, HU13, HU14, HU15, HU16, HU17, HU18, HU19 |
| **RNF-05** | Seguridad | Las contraseñas de los usuarios no deberán almacenarse en texto plano. (hash) | HU03, HU04, HU05, HU15 |
| **RNF-06** | Integridad | El sistema deberá mantener la integridad de los datos relacionados con productos, usuarios, pedidos y detalles de pedidos. | HU09, HU10, HU11, HU13, HU14, HU15, HU16, HU17, HU18 |
| **RNF-07** | Disponibilidad | La aplicación desplegada deberá estar disponible durante los periodos establecidos para las pruebas y demostraciones del proyecto. | — |
| **RNF-08** | Mantenibilidad | El código deberá organizarse de manera modular, facilitando su mantenimiento y evolución. | — |
| **RNF-09** | Compatibilidad | La aplicación deberá funcionar correctamente en los navegadores web definidos para las pruebas. | — |
| **RNF-10** | Usabilidad | Los mensajes de error y confirmación deberán ser comprensibles para el usuario. | HU03, HU05, HU06, HU07, HU08, HU10, HU11, HU13, HU14, HU15, HU16, HU17, HU19 |
| **RNF-11** | Escalabilidad | La arquitectura deberá permitir incorporar posteriormente nuevas funcionalidades sin modificar completamente la solución. | — |
| **RNF-12** | Despliegue | La aplicación deberá poder desplegarse en un servidor local. | — |

## Notas de trazabilidad

* **RF-08 y RF-30** no tienen caso de uso propio: son restricciones transversales y se desarrollan en las HU09 y HU06.
* **RF-29** dice "activar o desactivar", pero por indicación del instructor solo se desarrolla la inactivación (CU-17, HU17); no se contempla la reactivación.
* **RF-21** habla de métricas y alertas; las alertas se incorporaron a la HU18 (productos sin existencias).
* **RNF sin historia de usuario** (RNF-07, RNF-08, RNF-09, RNF-11 y RNF-12): se atienden desde la arquitectura, las pruebas y el despliegue, no desde una funcionalidad concreta. Aun así, conviene citarlos en los criterios de la arquitectura y en el plan de pruebas.
* Las HU citan los RNF únicamente en su línea de referencias; la columna de RNF muestra esas citas, no una verificación de cumplimiento.
