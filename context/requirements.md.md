```gherkin
# language: es

Feature: Gestión de Usuarios y Perfiles
  Como usuario de la plataforma,
  necesito poder registrarme, iniciar sesión y gestionar mi perfil
  para poder interactuar de forma segura en "ReSolVelo".

  Background:
    Given que me encuentro en la página de inicio de "ReSolVelo".

  @registro
  Scenario: Registro exitoso de un nuevo usuario
    Given que no estoy autenticado en el sistema.
    When hago clic en el botón "Registrarse".
    And completo el formulario de registro con un email válido, una contraseña segura y mis datos personales.
    And acepto los términos y condiciones.
    And hago clic en el botón "Crear Cuenta".
    Then debería recibir un correo electrónico para verificar mi cuenta.
    And mi cuenta debería ser creada con un estado "pendiente de verificación".
    And el sistema debería proteger mi contraseña usando técnicas de hashing seguras (OWASP Top 10).

  @autenticacion
  Scenario: Inicio de sesión exitoso de un usuario existente
    Given que soy un usuario registrado y mi cuenta está verificada.
    When hago clic en el botón "Iniciar Sesión".
    And ingreso mi email y contraseña correctos.
    And hago clic en el botón "Ingresar".
    Then debería ser redirigido a mi panel de control personal.
    And debería ver mi nombre de usuario en la barra de navegación.
    And mi sesión debería estar protegida contra ataques de fijación de sesión (OWASP Top 10).

  @autenticacion
  Scenario: Intento de inicio de sesión con credenciales incorrectas
    Given que soy un usuario registrado.
    When hago clic en el botón "Iniciar Sesión".
    And ingreso mi email correcto y una contraseña incorrecta.
    And hago clic en el botón "Ingresar".
    Then debería ver un mensaje de error indicando "Email o contraseña incorrectos".
    And debería permanecer en la página de inicio de sesión.
    And el sistema debería limitar los intentos de inicio de sesión para prevenir ataques de fuerza bruta (OWASP Top 10).

  @perfil
  Scenario: Actualización de información de perfil
    Given que he iniciado sesión en mi cuenta.
    When navego a la sección "Mi Perfil".
    And modifico mi nombre, teléfono o dirección.
    And hago clic en "Guardar Cambios".
    Then mi información de perfil debería ser actualizada exitosamente.
    And los cambios deberían reflejarse en la plataforma.

  @seguridad
  Scenario: Recuperación de contraseña
    Given que he olvidado mi contraseña.
    When hago clic en "¿Olvidaste tu contraseña?".
    And ingreso mi email registrado.
    And recibo un enlace de recuperación de contraseña en mi correo electrónico.
    Then al hacer clic en el enlace, debería poder establecer una nueva contraseña segura.
    And la nueva contraseña debería ser almacenada de forma segura.
```

```gherkin
# language: es

Feature: Publicación y Gestión de Equipos
  Como propietario de equipos,
  necesito poder crear, editar y gestionar mis publicaciones
  para ofrecer mis equipos en alquiler.

  Background:
    Given que soy un usuario autenticado y mi cuenta está verificada.
    And tengo la opción de gestionar mis publicaciones de equipos.

  @publicacion
  Scenario: Creación exitosa de una nueva publicación de equipo
    Given que estoy en mi panel de control.
    When hago clic en "Publicar un nuevo equipo".
    And completo el formulario con el título, descripción, tipo de equipo, precio por día y ubicación.
    And subo al menos una foto del equipo.
    And defino las fechas de disponibilidad en el calendario.
    And hago clic en "Publicar".
    Then mi nueva publicación debería aparecer en la sección "Mis Equipos".
    And la publicación debería estar visible en los resultados de búsqueda para otros usuarios.
    And la información ingresada debería ser validada para prevenir inyección de código (OWASP Top 10).

  @publicacion
  Scenario: Edición de una publicación existente
    Given que tengo una publicación de equipo activa.
    When navego a la sección "Mis Equipos".
    And selecciono la publicación que deseo editar.
    And modifico la descripción, el precio o la disponibilidad.
    And hago clic en "Guardar Cambios".
    Then la publicación debería ser actualizada exitosamente.
    And los cambios deberían reflejarse en el catálogo de la plataforma.

  @publicacion
  Scenario: Eliminación de una publicación de equipo
    Given que tengo una publicación de equipo activa y sin reservas pendientes.
    When navego a la sección "Mis Equipos".
    And selecciono la publicación que deseo eliminar.
    And confirmo la eliminación.
    Then la publicación debería ser eliminada de mi lista de equipos.
    And la publicación ya no debería ser visible en el catálogo de la plataforma.
```

```gherkin
# language: es

Feature: Búsqueda y Descubrimiento de Equipos
  Como músico o arrendatario,
  necesito poder buscar y filtrar equipos
  para encontrar lo que necesito de forma rápida y eficiente.

  Background:
    Given que estoy en la página principal de "ReSolVelo".

  @navegacion
  Scenario: Visualización de publicaciones sin autenticación
    Given que no estoy autenticado en el sistema.
    When accedo a la página principal de "ReSolVelo".
    Then debería poder ver las publicaciones de equipos disponibles.
    And debería poder navegar por el catálogo de equipos.
    And no se me debería solicitar iniciar sesión para ver las publicaciones.

  @busqueda
  Scenario: Búsqueda de equipos por tipo y ubicación
    Given que existen publicaciones de "Guitarras eléctricas" en "Montevideo".
    When ingreso "Guitarra eléctrica" en la barra de búsqueda.
    And selecciono "Montevideo" en el filtro de ubicación.
    And hago clic en "Buscar".
    Then debería ver una lista de resultados que contenga únicamente publicaciones de guitarras eléctricas disponibles en Montevideo.
    And los resultados deberían mostrar información relevante como el nombre del equipo, precio y una imagen.

  @busqueda
  Scenario: Filtrado de equipos por disponibilidad de fechas
    Given que existen publicaciones de equipos con disponibilidad variada.
    When selecciono un rango de fechas específico en el filtro de disponibilidad.
    And hago clic en "Aplicar Filtros".
    Then debería ver solo los equipos que están disponibles para alquiler en el rango de fechas seleccionado.

  @busqueda
  Scenario: Búsqueda sin resultados
    Given que no existen publicaciones de "Baterías" en "Salto".
    When ingreso "Batería" en la barra de búsqueda.
    And selecciono "Salto" en el filtro de ubicación.
    And hago clic en "Buscar".
    Then debería ver un mensaje indicando que no se encontraron resultados.
    And se me deberían sugerir opciones para ampliar la búsqueda o crear una alerta.
```

```gherkin
# language: es

Feature: Gestión de Reservas y Alquileres
  Como usuario,
  necesito un sistema claro para solicitar, aprobar y gestionar reservas
  para asegurar un proceso de alquiler transparente y ordenado.

  Background:
    Given que soy un usuario autenticado.

  @reserva
  Scenario: Un arrendatario solicita una reserva
    Given que he encontrado una "Batería" que quiero alquilar.
    When selecciono las fechas de inicio y fin del alquiler en el calendario de la publicación.
    And hago clic en el botón "Solicitar Reserva".
    Then la solicitud de reserva se envía al propietario.
    And el estado de la reserva se muestra como "Pendiente de Aprobación" en mi panel de usuario.
    And el propietario recibe una notificación por correo electrónico sobre la solicitud.

  @reserva
  Scenario: Un propietario aprueba una reserva pendiente
    Given que he recibido una solicitud de reserva para mi "Batería".
    When voy a mi panel de "Mis Reservas".
    And encuentro la solicitud pendiente y hago clic en "Aprobar".
    Then el estado de la reserva cambia a "Aprobada".
    And el arrendatario recibe una notificación por correo electrónico confirmando la reserva.
    And el sistema solicita al arrendatario que proceda con el pago.

  @reserva
  Scenario: Un propietario rechaza una reserva pendiente
    Given que he recibido una solicitud de reserva para mi "Guitarra".
    When voy a mi panel de "Mis Reservas".
    And encuentro la solicitud pendiente y hago clic en "Rechazar".
    And proporciono un motivo para el rechazo.
    Then el estado de la reserva cambia a "Rechazada".
    And el arrendatario recibe una notificación por correo electrónico informando el rechazo y el motivo.

  @reserva
  Scenario: Cancelación de una reserva por el arrendatario
    Given que tengo una reserva "Aprobada" pero aún no pagada.
    When voy a mi panel de "Mis Reservas".
    And selecciono la reserva que deseo cancelar.
    And confirmo la cancelación.
    Then el estado de la reserva cambia a "Cancelada por Arrendatario".
    And el propietario recibe una notificación de la cancelación.
```

```gherkin
# language: es

Feature: Pagos y Transacciones
  Como usuario,
  necesito una pasarela de pagos segura para gestionar las transacciones
  para garantizar la confianza y la monetización del servicio.

  Background:
    Given que soy un arrendatario autenticado.

  @pago
  Scenario: Pago exitoso de una reserva aprobada (simulado)
    Given que mi solicitud de reserva para un "Amplificador" ha sido aprobada.
    When voy a la sección "Mis Reservas" y hago clic en "Pagar Ahora".
    And soy redirigido a una página de simulación de pago.
    And la simulación de pago indica que el pago fue exitoso.
    Then el estado de la reserva cambia a "Confirmada y Pagada".
    And tanto yo como el propietario recibimos una confirmación del pago.
    And la transacción se registra en el sistema.
    And el sistema debería proteger la información de pago sensible (OWASP Top 10, PCI DSS).

  @pago
  Scenario: Cálculo de costo total de alquiler
    Given que he seleccionado un equipo con un precio diario de $500.
    And he seleccionado un período de alquiler de 3 días.
    When visualizo el resumen de la reserva.
    Then el costo total del alquiler debería ser $1500.
```

```gherkin
# language: es

Feature: Comunicación y Notificaciones
  Como usuario,
  necesito un sistema de mensajería interna y notificaciones
  para comunicarme con la otra parte y estar al tanto del estado de mis alquileres.

  Background:
    Given que estoy autenticado en el sistema.

  @comunicacion
  Scenario: Enviar un mensaje al propietario de un equipo
    Given que estoy viendo la publicación de un "Teclado".
    When escribo un mensaje en la caja de "Contactar al propietario".
    And hago clic en "Enviar Mensaje".
    Then el propietario recibe mi mensaje en su bandeja de entrada interna.
    And el propietario recibe una notificación por correo electrónico sobre el nuevo mensaje.
    And el sistema debería prevenir ataques de Cross-Site Scripting (XSS) en los mensajes (OWASP Top 10).

  @notificacion
  Scenario: Recepción de notificación por cambio de estado de reserva
    Given que tengo una reserva pendiente de aprobación.
    When el propietario aprueba mi solicitud de reserva.
    Then recibo una notificación por correo electrónico confirmando la aprobación.
    And el estado de la reserva se actualiza en mi panel de usuario.
```

```gherkin
# language: es

Feature: Administración y Seguridad
  Como administrador de la plataforma,
  necesito herramientas para gestionar usuarios y publicaciones,
  y asegurar la integridad y seguridad del sistema.

  Background:
    Given que he iniciado sesión como usuario con rol de administrador.

  @administracion
  Scenario: Gestión básica de usuarios por el administrador
    Given que estoy en el panel de administración.
    When navego a la sección "Gestión de Usuarios".
    And puedo ver una lista de usuarios registrados.
    And puedo deshabilitar o habilitar la cuenta de un usuario.
    Then los cambios en el estado del usuario se aplican correctamente.
    And el sistema registra la acción del administrador.

  @administracion
  Scenario: Gestión básica de publicaciones por el administrador
    Given que estoy en el panel de administración.
    When navego a la sección "Gestión de Publicaciones".
    And puedo ver una lista de todas las publicaciones activas.
    And puedo eliminar una publicación que incumple las normas.
    Then la publicación es eliminada del catálogo.
    And el usuario propietario es notificado de la eliminación.

  @seguridad
  Scenario: Protección contra vulnerabilidades comunes (OWASP Top 10)
    Given que la plataforma está en funcionamiento.
    When se realiza una auditoría de seguridad.
    Then la plataforma debería demostrar resistencia a inyecciones SQL, XSS, CSRF y otras vulnerabilidades del OWASP Top 10.
    And los datos sensibles deberían estar cifrados en tránsito (TLS) y en reposo.
```

```gherkin
# language: es

Feature: Experiencia de Usuario y Diseño
  Como usuario de la plataforma,
  necesito una interfaz intuitiva, accesible y responsive
  para una experiencia de uso óptima.

  @usabilidad
  Scenario: Interfaz responsive en diferentes dispositivos
    Given que accedo a "ReSolVelo" desde un dispositivo móvil.
    When navego por las diferentes secciones de la plataforma.
    Then la interfaz debería adaptarse correctamente al tamaño de la pantalla.
    And todos los elementos interactivos deberían ser accesibles y funcionales.

  @accesibilidad
  Scenario: Cumplimiento de pautas de accesibilidad web (WCAG 2.1)
    Given que soy un usuario con necesidades especiales (ej. discapacidad visual).
    When utilizo un lector de pantalla para navegar por la plataforma.
    Then todos los elementos de la interfaz deberían tener etiquetas y descripciones accesibles.
    And la navegación debería ser posible utilizando solo el teclado.
```

