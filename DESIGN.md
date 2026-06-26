# Design del desafío de rate limiting

Elegí este desafío entre otros porque me pareció el más alcanzable dentro del tiempo que tenía para resolverlo. No había trabajado antes en algo parecido desde cero, así que veía en este problema una buena oportunidad para aprender algo concreto, aplicar varias decisiones de arquitectura y terminar con un resultado que fuera útil y demostrable.

También me gustó porque no era solo “hacer una app”, sino pensar en cómo proteger un servicio real frente a tráfico excesivo y cómo separar esa responsabilidad en un componente propio.

## Decisiones principales

### Backend

Para el backend usé ExpressJS. Me pareció la opción más simple y directa para este tipo de ejercicio. Si bien NestJS es mi framework favorito y el que más me gusta para proyectos más grandes, en este caso implicaba mucho más boilerplate y configuraciones extra que no tenían una justificación clara para un desafío de este tamaño.

El backend está pensado como un ejemplo mínimo para poder probar el flujo completo del rate limiter. Tiene datos mock y un endpoint de ejemplo para que el sistema quede funcional y se pueda validar de forma end to end.

### Rate limiter

El rate limiter también lo implementé con ExpressJS, pero como un servicio separado. La idea fue separar la lógica de protección del tráfico del propio backend, de forma que fuera más fácil de reutilizar en el futuro.

El tradeoff principal de esta decisión es que hay más trabajo de configuración y que ahora son dos proyectos en lugar de uno, pero a cambio queda una pieza más modular y reutilizable. En un escenario futuro, este rate limiter podría servir para múltiples servicios web, no solo para este caso puntual. Claro que para eso habría que sumar algún dato extra para identificar a qué servicio pertenece, como por ejemplo un nombre o un identificador de proyecto.

## Uso de Redis

Decidí usar Redis para almacenar la información del rate limiter. La razón principal es la velocidad. En este tipo de componente, el overhead tiene que ser lo más bajo posible, porque el rate limiter se encuentra en el camino de cada request y no debería convertirse en un cuello de botella.

Por eso, elegir una base de datos como PostgreSQL o MongoDB no habría sido una buena idea para este desafío. Redis es mucho más adecuado para este tipo de caché temporal y acceso rápido.

## Algoritmo elegido

Para el algoritmo de rate limiting opté por Fixed Window. Lo elegí porque es relativamente simple de implementar, fácil de entender y efectivo para un caso pequeño o intermedio como este.

El principal tradeoff de este enfoque es que puede permitir bursts de requests cerca del cambio de ventana. Es decir, entre el fin de una ventana y el comienzo de la siguiente, puede haber un momento en el que se acepten más requests de los esperados. En un sistema real, eso habría que evaluarlo con cuidado y decidir si es aceptable o si conviene elegir otro algoritmo más sofisticado.

## Lógica del rate limiting

El rate limiting lo hice teniendo en cuenta dos cosas: el userId y el recurso específico que se está consultando. Por ejemplo, el proyecto distingue entre el endpoint GET y el endpoint POST, y aplica límites distintos según el tipo de operación.

Esto permite que el throttling sea más flexible y no trate todos los recursos de la misma manera. Un recurso de lectura puede tener un límite distinto a uno que modifica datos, y eso tiene sentido desde el punto de vista de la protección del servicio.

## Limitaciones y simplificaciones

Hubo algunas decisiones que tomé por simplificación, pero que en un sistema real deberían revisarse.

La más importante es que el rate limiter recibe el campo userId desde los query params del request. Eso fue una decisión práctica para mantener el flujo simple, pero en la vida real eso no sería aceptable. El userId debería venir del token JWT, de la sesión del usuario o de algún identificador confiable que no dependa del cliente.

Además, este diseño asume que el usuario está autenticado y que existe un userId válido. Eso tiene sentido para una aplicación donde el usuario debe estar registrado. Para aplicaciones de uso público, probablemente sería más apropiado usar la IP del usuario para controlar el throttling.

## Levantado del proyecto

También decidí usar Docker Compose porque quería que este proyecto, que tiene varios componentes, pudiera levantarse de forma sencilla en cualquier computadora. La idea fue que no fuera necesario instalar y configurar cada pieza a mano, y que con un solo comando se pudiera tener el backend, el rate limiter, Redis y la parte de testing funcionando de forma coherente.

## Uso de IA durante el desarrollo

Dado el tiempo limitado, me apoyé en herramientas de programación asistida que tenía integradas en el IDE. En particular usé Cline, que me permitió trabajar con distintos modelos y ajustar el costo según la tarea. Para las partes más complejas, como el diseño inicial y la estructura general del proyecto, usé Claude Sonnet 4.6; para tareas más repetitivas o más simples, como tests unitarios y ajustes de configuración, opté por Claude Haiku 4.5 porque suele ser suficiente y más económico.

La forma en que lo usé fue bastante práctica: le explicaba la consigna, le dejaba claro el tipo de arquitectura que buscaba y le daba una guía concreta sobre lo que necesitaba. Después revisaba el resultado, corregía lo que no me convencía y le iba agregando nuevas mejoras a medida que surgían, como las pruebas E2E o el manejo de logs en módulos separados. También me ayudó mucho con tareas más tediosas, como YAML, README y tests, donde la IA puede ahorrar bastante tiempo sin bajar la calidad del trabajo.

Creo que lo más importante es no delegar el criterio. La IA fue una ayuda muy útil para acelerar el proceso y evitar bloqueos, pero la revisión final, la decisión de arquitectura y la validación del resultado siguieron siendo mías.

## Conclusión

En general, este desafío me sirvió para trabajar con una arquitectura un poco más completa de la que normalmente uso en ejercicios simples. Me permitió pensar en rendimiento, separación de responsabilidades, límites de tráfico y cómo estructurar un sistema para que sea fácil de probar y extender.
