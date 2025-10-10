// ============================================================================
// SCHEMA PRISMA PARA RESOLVELO - PLATAFORMA DE ALQUILER DE EQUIPOS MUSICALES
// ============================================================================
// Este archivo define la estructura de la base de datos PostgreSQL para el
// sistema ReSolVelo, incluyendo modelos para usuarios, publicaciones, reservas
// y transacciones para el alquiler de instrumentos y equipos musicales.
// ============================================================================

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================================
// ENUMERACIONES
// ============================================================================

// Estados posibles de una publicación de equipo
enum EstadoPublicacion {
  ACTIVA      // Publicación disponible para reservas
  PAUSADA     // Temporalmente no disponible
  INACTIVA    // Desactivada por el propietario
  ELIMINADA   // Eliminada del sistema
}

// Roles de usuario en la plataforma
enum RolUsuario {
  USUARIO          // Usuario regular de la plataforma
  MODERADOR        // Moderador con permisos de moderación de contenido
  ADMINISTRADOR    // Administrador con permisos completos
  SUPER_ADMIN      // Super administrador con acceso total al sistema
}

// Estados de las reservas
enum EstadoReserva {
  PENDIENTE   // Reserva creada, esperando confirmación
  CONFIRMADA  // Reserva confirmada por el propietario
  EN_CURSO    // Equipo entregado, reserva activa
  COMPLETADA  // Reserva finalizada exitosamente
  CANCELADA   // Reserva cancelada
  RECHAZADA   // Reserva rechazada por el propietario
}

// Estados de las transacciones de pago
enum EstadoTransaccion {
  PENDIENTE   // Transacción iniciada
  PROCESANDO  // En proceso de pago
  COMPLETADA  // Pago exitoso
  FALLIDA     // Pago fallido
  REEMBOLSADA // Pago reembolsado
  CANCELADA   // Transacción cancelada
}

// Tipos de transacciones
enum TipoTransaccion {
  PAGO_RESERVA    // Pago por alquiler
  DEPOSITO        // Depósito de garantía
  REEMBOLSO       // Reembolso de pago
  COMISION        // Comisión de la plataforma
}

// Categorías de instrumentos y equipos musicales
enum CategoriaEquipo {
  GUITARRAS       // Guitarras eléctricas, acústicas, bajos
  BATERIAS        // Baterías acústicas y electrónicas
  TECLADOS        // Pianos, sintetizadores, órganos
  VIENTOS         // Saxofones, trompetas, flautas, etc.
  CUERDAS         // Violines, violas, violonchelos
  AMPLIFICADORES  // Amplificadores de guitarra, bajo, teclado
  AUDIO_PA        // Sistemas de sonido, mezcladores, micrófonos
  PERCUSION       // Instrumentos de percusión diversos
  GRABACION       // Interfaces de audio, monitores, micrófonos de estudio
  ILUMINACION     // Luces para espectáculos y eventos
  ACCESORIOS      // Cables, soportes, fundas, pedales
  OTROS           // Otros equipos musicales
}



// Estados de verificación de cuenta
enum EstadoVerificacion {
  PENDIENTE   // Cuenta creada, verificación pendiente
  VERIFICADA  // Cuenta verificada
  RECHAZADA   // Verificación rechazada
  SUSPENDIDA  // Cuenta suspendida
}

// Estados de moderación para publicaciones
enum EstadoModeracion {
  PENDIENTE_REVISION    // Publicación pendiente de revisión
  APROBADA             // Publicación aprobada por moderador
  RECHAZADA            // Publicación rechazada
  REPORTADA            // Publicación reportada por usuarios
  SUSPENDIDA           // Publicación suspendida temporalmente
  ELIMINADA            // Publicación eliminada por moderador
}

// Tipos de acciones administrativas
enum TipoAccionAdmin {
  CREAR_USUARIO        // Creación de usuario
  MODIFICAR_USUARIO    // Modificación de datos de usuario
  SUSPENDER_USUARIO    // Suspensión de usuario
  BLOQUEAR_USUARIO     // Bloqueo de usuario
  CAMBIAR_ROL          // Cambio de rol de usuario
  MODERAR_PUBLICACION  // Moderación de publicación
  RESOLVER_DISPUTA     // Resolución de disputa
  ELIMINAR_CONTENIDO   // Eliminación de contenido
  CONFIGURAR_SISTEMA   // Configuración del sistema
  GENERAR_REPORTE      // Generación de reportes
}

// Tipos de disputas
enum TipoDisputa {
  EQUIPO_NO_ENTREGADO     // Equipo no fue entregado
  EQUIPO_DANADO           // Equipo entregado con daños
  DESCRIPCION_INCORRECTA  // Descripción no coincide con el equipo
  PROBLEMA_PAGO           // Problemas con el pago
  COMPORTAMIENTO_USUARIO  // Comportamiento inapropiado
  CANCELACION_INDEBIDA    // Cancelación indebida de reserva
  OTRO                    // Otros tipos de disputa
}

// Estados de disputas
enum EstadoDisputa {
  ABIERTA              // Disputa recién creada
  EN_REVISION          // Disputa siendo revisada por moderador
  ESPERANDO_RESPUESTA  // Esperando respuesta de una de las partes
  RESUELTA             // Disputa resuelta
  CERRADA              // Disputa cerrada sin resolución
  ESCALADA             // Disputa escalada a administrador
}

// Tipos de permisos administrativos
enum TipoPermiso {
  MODERAR_PUBLICACIONES    // Moderar publicaciones
  GESTIONAR_USUARIOS       // Gestionar usuarios
  RESOLVER_DISPUTAS        // Resolver disputas
  ACCEDER_REPORTES         // Acceder a reportes y estadísticas
  CONFIGURAR_SISTEMA       // Configurar parámetros del sistema
  GESTIONAR_PAGOS          // Gestionar transacciones y pagos
  ELIMINAR_CONTENIDO       // Eliminar contenido
  BANEAR_USUARIOS          // Banear usuarios permanentemente
  GESTIONAR_ADMINISTRADORES // Gestionar otros administradores
  ACCESO_COMPLETO          // Acceso completo al sistema
}

// Severidad de reportes
enum SeveridadReporte {
  BAJA      // Reporte de baja prioridad
  MEDIA     // Reporte de prioridad media
  ALTA      // Reporte de alta prioridad
  CRITICA   // Reporte crítico que requiere atención inmediata
}

// ============================================================================
// MODELO USUARIO
// ============================================================================

model Usuario {
  // Identificador único del usuario
  id                    String   @id @default(cuid())
  
  // Información personal básica
  nombre                String   @db.VarChar(100)
  apellido              String   @db.VarChar(100)
  email                 String   @unique @db.VarChar(255)
  telefono              String?  @db.VarChar(20)
  
  // Documento de identidad uruguayo (cédula de identidad)
  // Formato: X.XXX.XXX-X (8 dígitos con guiones y puntos)
  documentoIdentidad    String   @unique @db.VarChar(12)
  
  // Seguridad de autenticación (hash + salt)
  // passwordHash almacena la contraseña hasheada con bcrypt
  passwordHash          String   @db.VarChar(255)
  // salt único para cada usuario para mayor seguridad
  passwordSalt          String   @db.VarChar(255)
  
  // Información de seguridad y autenticación
  emailVerificado       Boolean              @default(false)
  telefonoVerificado    Boolean              @default(false)
  estadoVerificacion    EstadoVerificacion   @default(PENDIENTE)
  fechaUltimoAcceso     DateTime?
  intentosFallidos      Int                  @default(0)
  bloqueadoHasta        DateTime?
  
  // Información de roles y administración
  rol                   RolUsuario           @default(USUARIO)
  fechaAsignacionRol    DateTime?            // Fecha cuando se asignó el rol actual
  asignadoPor           String?              @db.VarChar(36) // ID del admin que asignó el rol
  motivoRol             String?              @db.Text // Motivo de asignación del rol
  permisosSuspendidos   Boolean              @default(false) // Suspensión temporal de permisos
  
  // Información de perfil
  fechaNacimiento       DateTime?
  biografia             String?              @db.Text
  avatarUrl             String?              @db.VarChar(500)
  
  // Ubicación del usuario
  direccion             String?              @db.VarChar(255)
  ciudad                String?              @db.VarChar(100)
  departamento          String?              @db.VarChar(100)
  codigoPostal          String?              @db.VarChar(10)
  
  // Configuraciones de privacidad y notificaciones
  perfilPublico         Boolean              @default(true)
  notificacionesEmail   Boolean              @default(true)
  notificacionesSms     Boolean              @default(false)
  
  // Información de calificación y reputación
  calificacionPromedio  Decimal?             @db.Decimal(3,2) // Escala 0.00 a 5.00
  totalCalificaciones   Int                  @default(0)
  
  // Metadatos del sistema
  fechaCreacion         DateTime             @default(now())
  fechaActualizacion    DateTime             @updatedAt
  ultimoAcceso          DateTime?
  activo                Boolean              @default(true)
  
  // Tokens de verificación y recuperación
  tokenVerificacion     String?              @db.VarChar(255)
  tokenRecuperacion     String?              @db.VarChar(255)
  fechaExpiracionToken  DateTime?
  
  // ========================================================================
  // RELACIONES DEL USUARIO
  // ========================================================================
  
  // Publicaciones de equipos creadas por el usuario
  publicaciones         Publicacion[]
  
  // Reservas realizadas por el usuario
  reservasRealizadas    Reserva[]            @relation("UsuarioReserva")
  
  // Reservas recibidas en sus publicaciones
  reservasRecibidas     Reserva[]            @relation("PropietarioReserva")
  
  // Transacciones del usuario
  transacciones         Transaccion[]
  
  // Calificaciones dadas por el usuario
  calificacionesDadas   Calificacion[]       @relation("UsuarioCalificador")
  
  // Calificaciones recibidas por el usuario
  calificacionesRecibidas Calificacion[]     @relation("UsuarioCalificado")
  
  // Mensajes enviados
  mensajesEnviados      Mensaje[]            @relation("UsuarioEmisor")
  
  // Mensajes recibidos
  mensajesRecibidos     Mensaje[]            @relation("UsuarioReceptor")
  
  // Reportes realizados por el usuario
  reportesRealizados    Reporte[]            @relation("UsuarioReportador")
  
  // Reportes recibidos sobre el usuario
  reportesRecibidos     Reporte[]            @relation("UsuarioReportado")
  
  // ========================================================================
  // RELACIONES ADMINISTRATIVAS
  // ========================================================================
  
  // Información de administrador (si aplica)
  administrador         Administrador?
  
  // Disputas como demandante
  disputasComoDemandante Disputa[]           @relation("UsuarioDemandante")
  
  // Disputas como demandado
  disputasComoDemandado Disputa[]            @relation("UsuarioDemandado")
  
  // Mensajes en disputas
  mensajesDisputa       MensajeDisputa[]     @relation("AutorMensajeDisputa")
  
  // Evidencias subidas en disputas
  evidenciasDisputa     EvidenciaDisputa[]   @relation("UsuarioEvidencia")

  // ========================================================================
  // ÍNDICES Y CONFIGURACIONES
  // ========================================================================
  
  @@map("usuarios")
  @@index([email])
  @@index([documentoIdentidad])
  @@index([estadoVerificacion])
  @@index([fechaCreacion])
  @@index([calificacionPromedio])
}

// ============================================================================
// MODELO PUBLICACION (INSTRUMENTOS Y EQUIPOS MUSICALES)
// ============================================================================

model Publicacion {
  // Identificador único de la publicación
  id                    String               @id @default(cuid())
  
  // Información básica del instrumento/equipo musical
  titulo                String               @db.VarChar(200)
  descripcion           String               @db.Text
  categoria             CategoriaEquipo
  marca                 String?              @db.VarChar(100)
  modelo                String?              @db.VarChar(100)
  anioFabricacion       Int?
  
  // Información de precios y disponibilidad
  precioPorDia          Decimal              @db.Decimal(10,2)
  precioPorSemana       Decimal?             @db.Decimal(10,2)
  precioPorMes          Decimal?             @db.Decimal(10,2)
  deposito              Decimal?             @db.Decimal(10,2)
  
  // Disponibilidad y restricciones
  disponible            Boolean              @default(true)
  diasMinimoAlquiler    Int                  @default(1)
  diasMaximoAlquiler    Int?
  
  // Ubicación del instrumento/equipo
  direccion             String               @db.VarChar(255)
  ciudad                String               @db.VarChar(100)
  departamento          String               @db.VarChar(100)
  codigoPostal          String?              @db.VarChar(10)
  latitud               Decimal?             @db.Decimal(10,8)
  longitud              Decimal?             @db.Decimal(11,8)
  
  // Estado y configuración
  estado                EstadoPublicacion    @default(ACTIVA)
  estadoModeracion      EstadoModeracion     @default(PENDIENTE_REVISION)
  entregaDomicilio      Boolean              @default(false)
  retiroLocal           Boolean              @default(true)
  
  // Información de moderación
  fechaModeracion       DateTime?            // Fecha de última moderación
  moderadoPor           String?              @db.VarChar(36) // ID del moderador
  comentarioModeracion  String?              @db.Text // Comentarios del moderador
  
  // Información de calidad y estado del instrumento/equipo
  estadoEquipo          String               @db.VarChar(50) // Nuevo, Usado, Excelente, etc.
  instrucciones         String?              @db.Text
  
  // Metadatos
  fechaCreacion         DateTime             @default(now())
  fechaActualizacion    DateTime             @updatedAt
  fechaPublicacion      DateTime?
  fechaVencimiento      DateTime?
  
  // Estadísticas
  visualizaciones       Int                  @default(0)
  totalReservas         Int                  @default(0)
  calificacionPromedio  Decimal?             @db.Decimal(3,2)
  totalCalificaciones   Int                  @default(0)
  
  // ========================================================================
  // RELACIONES DE LA PUBLICACIÓN
  // ========================================================================
  
  // Propietario de la publicación
  propietarioId         String
  propietario           Usuario              @relation(fields: [propietarioId], references: [id], onDelete: Cascade)
  
  // Imágenes del instrumento/equipo musical
  imagenes              ImagenPublicacion[]
  
  // Reservas de esta publicación
  reservas              Reserva[]
  
  // Calificaciones de la publicación
  calificaciones        Calificacion[]
  
  // Reportes sobre la publicación
  reportes              Reporte[]
  
  // Disponibilidad específica (fechas bloqueadas)
  disponibilidades      DisponibilidadFecha[]
  
  // Moderaciones de la publicación
  moderaciones          ModeraccionPublicacion[]

  // ========================================================================
  // ÍNDICES Y CONFIGURACIONES
  // ========================================================================
  
  @@map("publicaciones")
  @@index([propietarioId])
  @@index([categoria])
  @@index([estado])
  @@index([ciudad, departamento])
  @@index([precioPorDia])
  @@index([fechaCreacion])
  @@index([calificacionPromedio])
  @@index([disponible])
}

// ============================================================================
// MODELO RESERVA
// ============================================================================

model Reserva {
  // Identificador único de la reserva
  id                    String               @id @default(cuid())
  
  // Fechas de la reserva
  fechaInicio           DateTime
  fechaFin              DateTime
  fechaCreacion         DateTime             @default(now())
  fechaActualizacion    DateTime             @updatedAt
  
  // Estado y configuración
  estado                EstadoReserva        @default(PENDIENTE)
  
  // Información de precios
  precioTotal           Decimal              @db.Decimal(10,2)
  deposito              Decimal?             @db.Decimal(10,2)
  comisionPlataforma    Decimal              @db.Decimal(10,2)
  
  // Información de entrega y devolución
  tipoEntrega           String               @db.VarChar(50) // "domicilio" o "retiro"
  direccionEntrega      String?              @db.VarChar(255)
  fechaEntrega          DateTime?
  fechaDevolucion       DateTime?
  
  // Notas y comentarios
  notasUsuario          String?              @db.Text
  notasPropietario      String?              @db.Text
  notasInternas         String?              @db.Text
  
  // Información de contacto para la reserva
  telefonoContacto      String?              @db.VarChar(20)
  
  // ========================================================================
  // RELACIONES DE LA RESERVA
  // ========================================================================
  
  // Usuario que realiza la reserva
  usuarioId             String
  usuario               Usuario              @relation("UsuarioReserva", fields: [usuarioId], references: [id], onDelete: Cascade)
  
  // Publicación reservada
  publicacionId         String
  publicacion           Publicacion          @relation(fields: [publicacionId], references: [id], onDelete: Cascade)
  
  // Propietario del instrumento/equipo (desnormalizado para consultas rápidas)
  propietarioId         String
  propietario           Usuario              @relation("PropietarioReserva", fields: [propietarioId], references: [id], onDelete: Cascade)
  
  // Transacciones asociadas a la reserva
  transacciones         Transaccion[]
  
  // Calificaciones de la reserva
  calificaciones        Calificacion[]
  
  // Mensajes relacionados con la reserva
  mensajes              Mensaje[]
  
  // Disputas relacionadas con la reserva
  disputas              Disputa[]

  // ========================================================================
  // ÍNDICES Y CONFIGURACIONES
  // ========================================================================
  
  @@map("reservas")
  @@index([usuarioId])
  @@index([publicacionId])
  @@index([propietarioId])
  @@index([estado])
  @@index([fechaInicio, fechaFin])
  @@index([fechaCreacion])
}

// ============================================================================
// MODELO TRANSACCION (PAGOS)
// ============================================================================

model Transaccion {
  // Identificador único de la transacción
  id                    String               @id @default(cuid())
  
  // Información básica de la transacción
  tipo                  TipoTransaccion
  estado                EstadoTransaccion    @default(PENDIENTE)
  monto                 Decimal              @db.Decimal(10,2)
  moneda                String               @default("UYU") @db.VarChar(3)
  
  // Información de pago
  metodoPago            String?              @db.VarChar(50) // "tarjeta", "transferencia", etc.
  referenciaExterna     String?              @db.VarChar(255) // ID de la pasarela de pago
  
  // Fechas importantes
  fechaCreacion         DateTime             @default(now())
  fechaProcesamiento    DateTime?
  fechaCompletado       DateTime?
  fechaVencimiento      DateTime?
  
  // Información adicional
  descripcion           String?              @db.VarChar(500)
  notasInternas         String?              @db.Text
  
  // Información de comisiones
  comisionPlataforma    Decimal?             @db.Decimal(10,2)
  comisionPasarela      Decimal?             @db.Decimal(10,2)
  montoNeto             Decimal?             @db.Decimal(10,2)
  
  // ========================================================================
  // RELACIONES DE LA TRANSACCIÓN
  // ========================================================================
  
  // Usuario que realiza la transacción
  usuarioId             String
  usuario               Usuario              @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  
  // Reserva asociada (opcional para algunos tipos de transacción)
  reservaId             String?
  reserva               Reserva?             @relation(fields: [reservaId], references: [id], onDelete: SetNull)

  // ========================================================================
  // ÍNDICES Y CONFIGURACIONES
  // ========================================================================
  
  @@map("transacciones")
  @@index([usuarioId])
  @@index([reservaId])
  @@index([estado])
  @@index([tipo])
  @@index([fechaCreacion])
  @@index([referenciaExterna])
}

// ============================================================================
// MODELO CALIFICACION
// ============================================================================

model Calificacion {
  // Identificador único de la calificación
  id                    String               @id @default(cuid())
  
  // Puntuación (1-5 estrellas)
  puntuacion            Int                  // Valor entre 1 y 5
  comentario            String?              @db.Text
  
  // Fechas
  fechaCreacion         DateTime             @default(now())
  fechaActualizacion    DateTime             @updatedAt
  
  // ========================================================================
  // RELACIONES DE LA CALIFICACIÓN
  // ========================================================================
  
  // Usuario que da la calificación
  usuarioCalificadorId  String
  usuarioCalificador    Usuario              @relation("UsuarioCalificador", fields: [usuarioCalificadorId], references: [id], onDelete: Cascade)
  
  // Usuario que recibe la calificación
  usuarioCalificadoId   String
  usuarioCalificado     Usuario              @relation("UsuarioCalificado", fields: [usuarioCalificadoId], references: [id], onDelete: Cascade)
  
  // Reserva asociada
  reservaId             String
  reserva               Reserva              @relation(fields: [reservaId], references: [id], onDelete: Cascade)
  
  // Publicación calificada
  publicacionId         String
  publicacion           Publicacion          @relation(fields: [publicacionId], references: [id], onDelete: Cascade)

  // ========================================================================
  // ÍNDICES Y CONFIGURACIONES
  // ========================================================================
  
  @@map("calificaciones")
  @@index([usuarioCalificadorId])
  @@index([usuarioCalificadoId])
  @@index([reservaId])
  @@index([publicacionId])
  @@index([puntuacion])
  @@unique([usuarioCalificadorId, reservaId]) // Un usuario solo puede calificar una vez por reserva
}

// ============================================================================
// MODELO IMAGEN_PUBLICACION
// ============================================================================

model ImagenPublicacion {
  // Identificador único de la imagen
  id                    String               @id @default(cuid())
  
  // Información de la imagen
  url                   String               @db.VarChar(500)
  descripcion           String?              @db.VarChar(255)
  orden                 Int                  @default(0)
  esPrincipal           Boolean              @default(false)
  
  // Metadatos
  fechaCreacion         DateTime             @default(now())
  
  // ========================================================================
  // RELACIONES DE LA IMAGEN
  // ========================================================================
  
  // Publicación a la que pertenece la imagen
  publicacionId         String
  publicacion           Publicacion          @relation(fields: [publicacionId], references: [id], onDelete: Cascade)

  // ========================================================================
  // ÍNDICES Y CONFIGURACIONES
  // ========================================================================
  
  @@map("imagenes_publicacion")
  @@index([publicacionId])
  @@index([orden])
}

// ============================================================================
// MODELO DISPONIBILIDAD_FECHA
// ============================================================================

model DisponibilidadFecha {
  // Identificador único
  id                    String               @id @default(cuid())
  
  // Fecha específica
  fecha                 DateTime             @db.Date
  disponible            Boolean              @default(true)
  motivo                String?              @db.VarChar(255)
  
  // ========================================================================
  // RELACIONES
  // ========================================================================
  
  // Publicación asociada
  publicacionId         String
  publicacion           Publicacion          @relation(fields: [publicacionId], references: [id], onDelete: Cascade)

  // ========================================================================
  // ÍNDICES Y CONFIGURACIONES
  // ========================================================================
  
  @@map("disponibilidad_fechas")
  @@index([publicacionId])
  @@index([fecha])
  @@unique([publicacionId, fecha])
}

// ============================================================================
// MODELO MENSAJE
// ============================================================================

model Mensaje {
  // Identificador único del mensaje
  id                    String               @id @default(cuid())
  
  // Contenido del mensaje
  contenido             String               @db.Text
  leido                 Boolean              @default(false)
  
  // Fechas
  fechaCreacion         DateTime             @default(now())
  fechaLectura          DateTime?
  
  // ========================================================================
  // RELACIONES DEL MENSAJE
  // ========================================================================
  
  // Usuario emisor
  emisorId              String
  emisor                Usuario              @relation("UsuarioEmisor", fields: [emisorId], references: [id], onDelete: Cascade)
  
  // Usuario receptor
  receptorId            String
  receptor              Usuario              @relation("UsuarioReceptor", fields: [receptorId], references: [id], onDelete: Cascade)
  
  // Reserva asociada (opcional)
  reservaId             String?
  reserva               Reserva?             @relation(fields: [reservaId], references: [id], onDelete: SetNull)

  // ========================================================================
  // ÍNDICES Y CONFIGURACIONES
  // ========================================================================
  
  @@map("mensajes")
  @@index([emisorId])
  @@index([receptorId])
  @@index([reservaId])
  @@index([fechaCreacion])
  @@index([leido])
}

// ============================================================================
// MODELO REPORTE
// ============================================================================

model Reporte {
  // Identificador único del reporte
  id                    String               @id @default(cuid())
  
  // Información del reporte
  motivo                String               @db.VarChar(100)
  descripcion           String               @db.Text
  estado                String               @default("PENDIENTE") @db.VarChar(50)
  
  // Fechas
  fechaCreacion         DateTime             @default(now())
  fechaResolucion       DateTime?
  
  // ========================================================================
  // RELACIONES DEL REPORTE
  // ========================================================================
  
  // Usuario que realiza el reporte
  usuarioReportadorId   String
  usuarioReportador     Usuario              @relation("UsuarioReportador", fields: [usuarioReportadorId], references: [id], onDelete: Cascade)
  
  // Usuario reportado (opcional)
  usuarioReportadoId    String?
  usuarioReportado      Usuario?             @relation("UsuarioReportado", fields: [usuarioReportadoId], references: [id], onDelete: SetNull)
  
  // Publicación reportada (opcional)
  publicacionId         String?
  publicacion           Publicacion?         @relation(fields: [publicacionId], references: [id], onDelete: SetNull)

  // ========================================================================
  // ÍNDICES Y CONFIGURACIONES
  // ========================================================================
  
  @@map("reportes")
  @@index([usuarioReportadorId])
  @@index([usuarioReportadoId])
  @@index([publicacionId])
  @@index([fechaCreacion])
  @@index([estado])
}

// ============================================================================
// MODELO ADMINISTRADOR
// ============================================================================

model Administrador {
  // Identificador único del administrador
  id                    String               @id @default(cuid())
  
  // Relación con el usuario
  usuarioId             String               @unique
  usuario               Usuario              @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  
  // Información administrativa
  fechaAsignacion       DateTime             @default(now())
  asignadoPor           String?              @db.VarChar(36) // ID del admin que lo asignó
  motivoAsignacion      String?              @db.Text
  activo                Boolean              @default(true)
  
  // Configuración de permisos
  permisos              PermisoAdministrador[]
  
  // Estadísticas de actividad
  totalAcciones         Int                  @default(0)
  ultimaActividad       DateTime?
  
  // Metadatos
  fechaCreacion         DateTime             @default(now())
  fechaActualizacion    DateTime             @updatedAt
  
  // ========================================================================
  // RELACIONES DEL ADMINISTRADOR
  // ========================================================================
  
  // Acciones administrativas realizadas
  acciones              AccionAdministrativa[]
  
  // Disputas resueltas
  disputasResueltas     Disputa[]            @relation("AdministradorResolutor")
  
  // Moderaciones realizadas
  moderaciones          ModeraccionPublicacion[]

  // ========================================================================
  // ÍNDICES Y CONFIGURACIONES
  // ========================================================================
  
  @@map("administradores")
  @@index([usuarioId])
  @@index([fechaAsignacion])
  @@index([activo])
}

// ============================================================================
// MODELO PERMISO ADMINISTRADOR
// ============================================================================

model PermisoAdministrador {
  // Identificador único del permiso
  id                    String               @id @default(cuid())
  
  // Información del permiso
  tipo                  TipoPermiso
  activo                Boolean              @default(true)
  fechaAsignacion       DateTime             @default(now())
  fechaExpiracion       DateTime?
  
  // Relación con administrador
  administradorId       String
  administrador         Administrador        @relation(fields: [administradorId], references: [id], onDelete: Cascade)
  
  // Metadatos
  fechaCreacion         DateTime             @default(now())
  fechaActualizacion    DateTime             @updatedAt

  // ========================================================================
  // ÍNDICES Y CONFIGURACIONES
  // ========================================================================
  
  @@map("permisos_administrador")
  @@index([administradorId])
  @@index([tipo])
  @@index([activo])
  @@unique([administradorId, tipo])
}

// ============================================================================
// MODELO ACCION ADMINISTRATIVA
// ============================================================================

model AccionAdministrativa {
  // Identificador único de la acción
  id                    String               @id @default(cuid())
  
  // Información de la acción
  tipo                  TipoAccionAdmin
  descripcion           String               @db.Text
  detalles              String?              @db.Text // JSON con detalles específicos
  
  // Información del objetivo de la acción
  usuarioObjetivoId     String?              @db.VarChar(36)
  publicacionObjetivoId String?              @db.VarChar(36)
  disputaObjetivoId     String?              @db.VarChar(36)
  
  // Resultado de la acción
  exitosa               Boolean              @default(true)
  motivoFallo           String?              @db.Text
  
  // Metadatos
  fechaCreacion         DateTime             @default(now())
  direccionIp           String?              @db.VarChar(45)
  userAgent             String?              @db.Text
  
  // ========================================================================
  // RELACIONES DE LA ACCIÓN ADMINISTRATIVA
  // ========================================================================
  
  // Administrador que realizó la acción
  administradorId       String
  administrador         Administrador        @relation(fields: [administradorId], references: [id], onDelete: Cascade)

  // ========================================================================
  // ÍNDICES Y CONFIGURACIONES
  // ========================================================================
  
  @@map("acciones_administrativas")
  @@index([administradorId])
  @@index([tipo])
  @@index([fechaCreacion])
  @@index([usuarioObjetivoId])
  @@index([publicacionObjetivoId])
  @@index([exitosa])
}

// ============================================================================
// MODELO DISPUTA
// ============================================================================

model Disputa {
  // Identificador único de la disputa
  id                    String               @id @default(cuid())
  
  // Información de la disputa
  tipo                  TipoDisputa
  titulo                String               @db.VarChar(200)
  descripcion           String               @db.Text
  estado                EstadoDisputa        @default(ABIERTA)
  severidad             SeveridadReporte     @default(MEDIA)
  
  // Información de las partes involucradas
  demandanteId          String
  demandante            Usuario              @relation("UsuarioDemandante", fields: [demandanteId], references: [id], onDelete: Cascade)
  
  demandadoId           String
  demandado             Usuario              @relation("UsuarioDemandado", fields: [demandadoId], references: [id], onDelete: Cascade)
  
  // Reserva relacionada (opcional)
  reservaId             String?
  reserva               Reserva?             @relation(fields: [reservaId], references: [id], onDelete: SetNull)
  
  // Información de resolución
  resolucion            String?              @db.Text
  compensacion          Decimal?             @db.Decimal(10,2)
  fechaResolucion       DateTime?
  
  // Administrador asignado
  administradorId       String?
  administrador         Administrador?       @relation("AdministradorResolutor", fields: [administradorId], references: [id], onDelete: SetNull)
  
  // Metadatos
  fechaCreacion         DateTime             @default(now())
  fechaActualizacion    DateTime             @updatedAt
  fechaLimiteRespuesta  DateTime?
  
  // ========================================================================
  // RELACIONES DE LA DISPUTA
  // ========================================================================
  
  // Mensajes de la disputa
  mensajes              MensajeDisputa[]
  
  // Evidencias adjuntas
  evidencias            EvidenciaDisputa[]

  // ========================================================================
  // ÍNDICES Y CONFIGURACIONES
  // ========================================================================
  
  @@map("disputas")
  @@index([demandanteId])
  @@index([demandadoId])
  @@index([reservaId])
  @@index([administradorId])
  @@index([estado])
  @@index([tipo])
  @@index([fechaCreacion])
  @@index([severidad])
}

// ============================================================================
// MODELO MENSAJE DISPUTA
// ============================================================================

model MensajeDisputa {
  // Identificador único del mensaje
  id                    String               @id @default(cuid())
  
  // Contenido del mensaje
  contenido             String               @db.Text
  esInterno             Boolean              @default(false) // Mensaje interno del administrador
  
  // Relación con la disputa
  disputaId             String
  disputa               Disputa              @relation(fields: [disputaId], references: [id], onDelete: Cascade)
  
  // Autor del mensaje
  autorId               String
  autor                 Usuario              @relation("AutorMensajeDisputa", fields: [autorId], references: [id], onDelete: Cascade)
  
  // Metadatos
  fechaCreacion         DateTime             @default(now())
  editado               Boolean              @default(false)
  fechaEdicion          DateTime?

  // ========================================================================
  // ÍNDICES Y CONFIGURACIONES
  // ========================================================================
  
  @@map("mensajes_disputa")
  @@index([disputaId])
  @@index([autorId])
  @@index([fechaCreacion])
  @@index([esInterno])
}

// ============================================================================
// MODELO EVIDENCIA DISPUTA
// ============================================================================

model EvidenciaDisputa {
  // Identificador único de la evidencia
  id                    String               @id @default(cuid())
  
  // Información de la evidencia
  tipo                  String               @db.VarChar(50) // imagen, documento, video, etc.
  nombre                String               @db.VarChar(255)
  url                   String               @db.VarChar(500)
  tamaño                Int?                 // Tamaño en bytes
  descripcion           String?              @db.Text
  
  // Relación con la disputa
  disputaId             String
  disputa               Disputa              @relation(fields: [disputaId], references: [id], onDelete: Cascade)
  
  // Usuario que subió la evidencia
  subidoPor             String
  usuario               Usuario              @relation("UsuarioEvidencia", fields: [subidoPor], references: [id], onDelete: Cascade)
  
  // Metadatos
  fechaCreacion         DateTime             @default(now())

  // ========================================================================
  // ÍNDICES Y CONFIGURACIONES
  // ========================================================================
  
  @@map("evidencias_disputa")
  @@index([disputaId])
  @@index([subidoPor])
  @@index([tipo])
  @@index([fechaCreacion])
}

// ============================================================================
// MODELO MODERACION PUBLICACION
// ============================================================================

model ModeraccionPublicacion {
  // Identificador único de la moderación
  id                    String               @id @default(cuid())
  
  // Información de la moderación
  accion                String               @db.VarChar(50) // APROBAR, RECHAZAR, SUSPENDER, etc.
  motivo                String?              @db.VarChar(200)
  comentarios           String?              @db.Text
  estadoAnterior        EstadoModeracion
  estadoNuevo           EstadoModeracion
  
  // Relación con la publicación
  publicacionId         String
  publicacion           Publicacion          @relation(fields: [publicacionId], references: [id], onDelete: Cascade)
  
  // Moderador que realizó la acción
  moderadorId           String
  moderador             Administrador        @relation(fields: [moderadorId], references: [id], onDelete: Cascade)
  
  // Metadatos
  fechaCreacion         DateTime             @default(now())

  // ========================================================================
  // ÍNDICES Y CONFIGURACIONES
  // ========================================================================
  
  @@map("moderaciones_publicacion")
  @@index([publicacionId])
  @@index([moderadorId])
  @@index([fechaCreacion])
  @@index([accion])
  @@index([estadoNuevo])
}

// ============================================================================
// MODELO ESTADISTICAS SISTEMA
// ============================================================================

model EstadisticaSistema {
  // Identificador único de la estadística
  id                    String               @id @default(cuid())
  
  // Información de la métrica
  nombre                String               @db.VarChar(100)
  valor                 Decimal              @db.Decimal(15,2)
  unidad                String?              @db.VarChar(50)
  descripcion           String?              @db.Text
  
  // Categorización
  categoria             String               @db.VarChar(50) // usuarios, publicaciones, transacciones, etc.
  subcategoria          String?              @db.VarChar(50)
  
  // Período de la estadística
  fechaInicio           DateTime
  fechaFin              DateTime
  
  // Metadatos
  fechaCreacion         DateTime             @default(now())
  calculadoPor          String?              @db.VarChar(36) // ID del admin que calculó

  // ========================================================================
  // ÍNDICES Y CONFIGURACIONES
  // ========================================================================
  
  @@map("estadisticas_sistema")
  @@index([nombre])
  @@index([categoria])
  @@index([fechaInicio])
  @@index([fechaFin])
  @@index([fechaCreacion])
}