-- Recrear esquema completo para corregir tipos de datos (TEXT -> BIGINT)

-- 1. Limpiar esquema existente
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO public; -- O al usuario configurado

-- 2. Crear Enums
CREATE TYPE "EstadoPublicacion" AS ENUM ('ACTIVA', 'PAUSADA', 'INACTIVA', 'ELIMINADA');
CREATE TYPE "RolUsuario" AS ENUM ('USUARIO', 'MODERADOR', 'ADMINISTRADOR', 'SUPER_ADMIN');
CREATE TYPE "EstadoReserva" AS ENUM ('PENDIENTE', 'CONFIRMADA', 'EN_CURSO', 'COMPLETADA', 'CANCELADA', 'RECHAZADA');
CREATE TYPE "EstadoTransaccion" AS ENUM ('PENDIENTE', 'PROCESANDO', 'COMPLETADA', 'FALLIDA', 'REEMBOLSADA', 'CANCELADA');
CREATE TYPE "TipoTransaccion" AS ENUM ('PAGO_RESERVA', 'DEPOSITO', 'REEMBOLSO', 'COMISION');
CREATE TYPE "CategoriaEquipo" AS ENUM ('GUITARRAS', 'BATERIAS', 'TECLADOS', 'VIENTOS', 'CUERDAS', 'AMPLIFICADORES', 'AUDIO_PA', 'PERCUSION', 'GRABACION', 'ILUMINACION', 'ACCESORIOS', 'OTROS');
CREATE TYPE "EstadoVerificacion" AS ENUM ('PENDIENTE', 'VERIFICADA', 'RECHAZADA', 'SUSPENDIDA');
CREATE TYPE "EstadoModeracion" AS ENUM ('PENDIENTE_REVISION', 'APROBADA', 'RECHAZADA', 'REPORTADA', 'SUSPENDIDA', 'ELIMINADA');
CREATE TYPE "TipoAccionAdmin" AS ENUM ('CREAR_USUARIO', 'MODIFICAR_USUARIO', 'SUSPENDER_USUARIO', 'BLOQUEAR_USUARIO', 'CAMBIAR_ROL', 'MODERAR_PUBLICACION', 'RESOLVER_DISPUTA', 'ELIMINAR_CONTENIDO', 'CONFIGURAR_SISTEMA', 'GENERAR_REPORTE');
CREATE TYPE "TipoDisputa" AS ENUM ('EQUIPO_NO_ENTREGADO', 'EQUIPO_DANADO', 'DESCRIPCION_INCORRECTA', 'PROBLEMA_PAGO', 'COMPORTAMIENTO_USUARIO', 'CANCELACION_INDEBIDA', 'OTRO');
CREATE TYPE "EstadoDisputa" AS ENUM ('ABIERTA', 'EN_REVISION', 'ESPERANDO_RESPUESTA', 'RESUELTA', 'CERRADA', 'ESCALADA');
CREATE TYPE "TipoPermiso" AS ENUM ('MODERAR_PUBLICACIONES', 'GESTIONAR_USUARIOS', 'RESOLVER_DISPUTAS', 'ACCEDER_REPORTES', 'CONFIGURAR_SISTEMA', 'GESTIONAR_PAGOS', 'ELIMINAR_CONTENIDO', 'BANEAR_USUARIOS', 'GESTIONAR_ADMINISTRADORES', 'ACCESO_COMPLETO');
CREATE TYPE "SeveridadReporte" AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'CRITICA');

-- 3. Crear Tablas

-- Usuario
CREATE TABLE "usuarios" (
    "id" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "apellido" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "telefono" VARCHAR(20),
    "documentoIdentidad" VARCHAR(12) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "passwordSalt" VARCHAR(255) NOT NULL,
    "emailVerificado" BOOLEAN NOT NULL DEFAULT false,
    "telefonoVerificado" BOOLEAN NOT NULL DEFAULT false,
    "estadoVerificacion" "EstadoVerificacion" NOT NULL DEFAULT 'PENDIENTE',
    "fechaUltimoAcceso" TIMESTAMP(3),
    "intentosFallidos" INTEGER NOT NULL DEFAULT 0,
    "bloqueadoHasta" TIMESTAMP(3),
    "rol" "RolUsuario" NOT NULL DEFAULT 'USUARIO',
    "fechaAsignacionRol" TIMESTAMP(3),
    "asignadoPor" VARCHAR(36),
    "motivoRol" TEXT,
    "permisosSuspendidos" BOOLEAN NOT NULL DEFAULT false,
    "fechaNacimiento" TIMESTAMP(3),
    "biografia" TEXT,
    "avatarUrl" VARCHAR(500),
    "direccion" VARCHAR(255),
    "ciudad" VARCHAR(100),
    "departamento" VARCHAR(100),
    "codigoPostal" VARCHAR(10),
    "perfilPublico" BOOLEAN NOT NULL DEFAULT true,
    "notificacionesEmail" BOOLEAN NOT NULL DEFAULT true,
    "notificacionesSms" BOOLEAN NOT NULL DEFAULT false,
    "calificacionPromedio" DECIMAL(3,2),
    "totalCalificaciones" INTEGER NOT NULL DEFAULT 0,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,
    "ultimoAcceso" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "primerLoginPendiente" BOOLEAN NOT NULL DEFAULT true,
    "tokenVerificacion" VARCHAR(255),
    "tokenRecuperacion" VARCHAR(255),
    "fechaExpiracionToken" TIMESTAMP(3),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- Publicacion
CREATE TABLE "publicaciones" (
    "id" BIGSERIAL NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "categoria" "CategoriaEquipo" NOT NULL,
    "marca" VARCHAR(100),
    "modelo" VARCHAR(100),
    "anioFabricacion" INTEGER,
    "precioPorDia" DECIMAL(10,2) NOT NULL,
    "precioPorSemana" DECIMAL(10,2),
    "precioPorMes" DECIMAL(10,2),
    "deposito" DECIMAL(10,2),
    "disponible" BOOLEAN NOT NULL DEFAULT true,
    "diasMinimoAlquiler" INTEGER NOT NULL DEFAULT 1,
    "diasMaximoAlquiler" INTEGER,
    "direccion" VARCHAR(255) NOT NULL,
    "ciudad" VARCHAR(100) NOT NULL,
    "departamento" VARCHAR(100) NOT NULL,
    "codigoPostal" VARCHAR(10),
    "latitud" DECIMAL(10,8),
    "longitud" DECIMAL(11,8),
    "estado" "EstadoPublicacion" NOT NULL DEFAULT 'ACTIVA',
    "estadoModeracion" "EstadoModeracion" NOT NULL DEFAULT 'PENDIENTE_REVISION',
    "entregaDomicilio" BOOLEAN NOT NULL DEFAULT false,
    "retiroLocal" BOOLEAN NOT NULL DEFAULT true,
    "fechaModeracion" TIMESTAMP(3),
    "moderadoPor" VARCHAR(36),
    "comentarioModeracion" TEXT,
    "estadoEquipo" VARCHAR(50) NOT NULL,
    "instrucciones" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,
    "fechaPublicacion" TIMESTAMP(3),
    "fechaVencimiento" TIMESTAMP(3),
    "visualizaciones" INTEGER NOT NULL DEFAULT 0,
    "totalReservas" INTEGER NOT NULL DEFAULT 0,
    "calificacionPromedio" DECIMAL(3,2),
    "totalCalificaciones" INTEGER NOT NULL DEFAULT 0,
    "propietarioId" BIGINT NOT NULL,

    CONSTRAINT "publicaciones_pkey" PRIMARY KEY ("id")
);

-- Reserva
CREATE TABLE "reservas" (
    "id" BIGSERIAL NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoReserva" NOT NULL DEFAULT 'PENDIENTE',
    "precioTotal" DECIMAL(10,2) NOT NULL,
    "deposito" DECIMAL(10,2),
    "comisionPlataforma" DECIMAL(10,2) NOT NULL,
    "tipoEntrega" VARCHAR(50) NOT NULL,
    "direccionEntrega" VARCHAR(255),
    "fechaEntrega" TIMESTAMP(3),
    "fechaDevolucion" TIMESTAMP(3),
    "notasUsuario" TEXT,
    "notasPropietario" TEXT,
    "notasInternas" TEXT,
    "telefonoContacto" VARCHAR(20),
    "usuarioId" BIGINT NOT NULL,
    "publicacionId" BIGINT NOT NULL,
    "propietarioId" BIGINT NOT NULL,

    CONSTRAINT "reservas_pkey" PRIMARY KEY ("id")
);

-- Transaccion
CREATE TABLE "transacciones" (
    "id" BIGSERIAL NOT NULL,
    "tipo" "TipoTransaccion" NOT NULL,
    "estado" "EstadoTransaccion" NOT NULL DEFAULT 'PENDIENTE',
    "monto" DECIMAL(10,2) NOT NULL,
    "moneda" VARCHAR(3) NOT NULL DEFAULT 'UYU',
    "metodoPago" VARCHAR(50),
    "referenciaExterna" VARCHAR(255),
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaProcesamiento" TIMESTAMP(3),
    "fechaCompletado" TIMESTAMP(3),
    "fechaVencimiento" TIMESTAMP(3),
    "descripcion" VARCHAR(500),
    "notasInternas" TEXT,
    "comisionPlataforma" DECIMAL(10,2),
    "comisionPasarela" DECIMAL(10,2),
    "montoNeto" DECIMAL(10,2),
    "usuarioId" BIGINT NOT NULL,
    "reservaId" BIGINT,

    CONSTRAINT "transacciones_pkey" PRIMARY KEY ("id")
);

-- Calificacion
CREATE TABLE "calificaciones" (
    "id" BIGSERIAL NOT NULL,
    "puntuacion" INTEGER NOT NULL,
    "comentario" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,
    "usuarioCalificadorId" BIGINT NOT NULL,
    "usuarioCalificadoId" BIGINT NOT NULL,
    "reservaId" BIGINT NOT NULL,
    "publicacionId" BIGINT NOT NULL,

    CONSTRAINT "calificaciones_pkey" PRIMARY KEY ("id")
);

-- ImagenPublicacion
CREATE TABLE "imagenes_publicacion" (
    "id" BIGSERIAL NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "descripcion" VARCHAR(255),
    "orden" INTEGER NOT NULL DEFAULT 0,
    "esPrincipal" BOOLEAN NOT NULL DEFAULT false,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publicacionId" BIGINT NOT NULL,

    CONSTRAINT "imagenes_publicacion_pkey" PRIMARY KEY ("id")
);

-- DisponibilidadFecha
CREATE TABLE "disponibilidad_fechas" (
    "id" BIGSERIAL NOT NULL,
    "fecha" DATE NOT NULL,
    "disponible" BOOLEAN NOT NULL DEFAULT true,
    "motivo" VARCHAR(255),
    "publicacionId" BIGINT NOT NULL,

    CONSTRAINT "disponibilidad_fechas_pkey" PRIMARY KEY ("id")
);

-- Mensaje
CREATE TABLE "mensajes" (
    "id" BIGSERIAL NOT NULL,
    "contenido" TEXT NOT NULL,
    "leido" BOOLEAN NOT NULL DEFAULT false,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaLectura" TIMESTAMP(3),
    "emisorId" BIGINT NOT NULL,
    "receptorId" BIGINT NOT NULL,
    "reservaId" BIGINT,

    CONSTRAINT "mensajes_pkey" PRIMARY KEY ("id")
);

-- Reporte
CREATE TABLE "reportes" (
    "id" BIGSERIAL NOT NULL,
    "motivo" VARCHAR(100) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE',
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaResolucion" TIMESTAMP(3),
    "usuarioReportadorId" BIGINT NOT NULL,
    "usuarioReportadoId" BIGINT,
    "publicacionId" BIGINT,

    CONSTRAINT "reportes_pkey" PRIMARY KEY ("id")
);

-- Administrador
CREATE TABLE "administradores" (
    "id" BIGSERIAL NOT NULL,
    "usuarioId" BIGINT NOT NULL,
    "fechaAsignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "asignadoPor" VARCHAR(36),
    "motivoAsignacion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "totalAcciones" INTEGER NOT NULL DEFAULT 0,
    "ultimaActividad" TIMESTAMP(3),
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "administradores_pkey" PRIMARY KEY ("id")
);

-- PermisoAdministrador
CREATE TABLE "permisos_administrador" (
    "id" BIGSERIAL NOT NULL,
    "tipo" "TipoPermiso" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaAsignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaExpiracion" TIMESTAMP(3),
    "administradorId" BIGINT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permisos_administrador_pkey" PRIMARY KEY ("id")
);

-- AccionAdministrativa
CREATE TABLE "acciones_administrativas" (
    "id" BIGSERIAL NOT NULL,
    "tipo" "TipoAccionAdmin" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "detalles" TEXT,
    "usuarioObjetivoId" VARCHAR(36),
    "publicacionObjetivoId" VARCHAR(36),
    "disputaObjetivoId" VARCHAR(36),
    "exitosa" BOOLEAN NOT NULL DEFAULT true,
    "motivoFallo" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "direccionIp" VARCHAR(45),
    "userAgent" TEXT,
    "administradorId" BIGINT NOT NULL,

    CONSTRAINT "acciones_administrativas_pkey" PRIMARY KEY ("id")
);

-- Disputa
CREATE TABLE "disputas" (
    "id" BIGSERIAL NOT NULL,
    "tipo" "TipoDisputa" NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" "EstadoDisputa" NOT NULL DEFAULT 'ABIERTA',
    "severidad" "SeveridadReporte" NOT NULL DEFAULT 'MEDIA',
    "demandanteId" BIGINT NOT NULL,
    "demandadoId" BIGINT NOT NULL,
    "reservaId" BIGINT,
    "resolucion" TEXT,
    "compensacion" DECIMAL(10,2),
    "fechaResolucion" TIMESTAMP(3),
    "administradorId" BIGINT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,
    "fechaLimiteRespuesta" TIMESTAMP(3),

    CONSTRAINT "disputas_pkey" PRIMARY KEY ("id")
);

-- MensajeDisputa
CREATE TABLE "mensajes_disputa" (
    "id" BIGSERIAL NOT NULL,
    "contenido" TEXT NOT NULL,
    "esInterno" BOOLEAN NOT NULL DEFAULT false,
    "disputaId" BIGINT NOT NULL,
    "autorId" BIGINT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editado" BOOLEAN NOT NULL DEFAULT false,
    "fechaEdicion" TIMESTAMP(3),

    CONSTRAINT "mensajes_disputa_pkey" PRIMARY KEY ("id")
);

-- EvidenciaDisputa
CREATE TABLE "evidencias_disputa" (
    "id" BIGSERIAL NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "tamano" INTEGER,
    "descripcion" TEXT,
    "disputaId" BIGINT NOT NULL,
    "subidoPor" BIGINT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidencias_disputa_pkey" PRIMARY KEY ("id")
);

-- ModeraccionPublicacion
CREATE TABLE "moderaciones_publicacion" (
    "id" BIGSERIAL NOT NULL,
    "accion" VARCHAR(50) NOT NULL,
    "motivo" VARCHAR(200),
    "comentarios" TEXT,
    "estadoAnterior" "EstadoModeracion" NOT NULL,
    "estadoNuevo" "EstadoModeracion" NOT NULL,
    "publicacionId" BIGINT NOT NULL,
    "moderadorId" BIGINT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderaciones_publicacion_pkey" PRIMARY KEY ("id")
);

-- EstadisticaSistema
CREATE TABLE "estadisticas_sistema" (
    "id" BIGSERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "valor" DECIMAL(15,2) NOT NULL,
    "unidad" VARCHAR(50),
    "descripcion" TEXT,
    "categoria" VARCHAR(50) NOT NULL,
    "subcategoria" VARCHAR(50),
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calculadoPor" VARCHAR(36),

    CONSTRAINT "estadisticas_sistema_pkey" PRIMARY KEY ("id")
);

-- 4. Crear Indices (Uniques y normales)

CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");
CREATE UNIQUE INDEX "usuarios_documentoIdentidad_key" ON "usuarios"("documentoIdentidad");
CREATE INDEX "usuarios_email_idx" ON "usuarios"("email");
CREATE INDEX "usuarios_documentoIdentidad_idx" ON "usuarios"("documentoIdentidad");
CREATE INDEX "usuarios_estadoVerificacion_idx" ON "usuarios"("estadoVerificacion");
CREATE INDEX "usuarios_fechaCreacion_idx" ON "usuarios"("fechaCreacion");
CREATE INDEX "usuarios_calificacionPromedio_idx" ON "usuarios"("calificacionPromedio");

CREATE INDEX "publicaciones_propietarioId_idx" ON "publicaciones"("propietarioId");
CREATE INDEX "publicaciones_categoria_idx" ON "publicaciones"("categoria");
CREATE INDEX "publicaciones_estado_idx" ON "publicaciones"("estado");
CREATE INDEX "publicaciones_ciudad_departamento_idx" ON "publicaciones"("ciudad", "departamento");
CREATE INDEX "publicaciones_precioPorDia_idx" ON "publicaciones"("precioPorDia");
CREATE INDEX "publicaciones_fechaCreacion_idx" ON "publicaciones"("fechaCreacion");
CREATE INDEX "publicaciones_calificacionPromedio_idx" ON "publicaciones"("calificacionPromedio");
CREATE INDEX "publicaciones_disponible_idx" ON "publicaciones"("disponible");

CREATE INDEX "reservas_usuarioId_idx" ON "reservas"("usuarioId");
CREATE INDEX "reservas_publicacionId_idx" ON "reservas"("publicacionId");
CREATE INDEX "reservas_propietarioId_idx" ON "reservas"("propietarioId");
CREATE INDEX "reservas_estado_idx" ON "reservas"("estado");
CREATE INDEX "reservas_fechaInicio_fechaFin_idx" ON "reservas"("fechaInicio", "fechaFin");
CREATE INDEX "reservas_fechaCreacion_idx" ON "reservas"("fechaCreacion");

CREATE INDEX "transacciones_usuarioId_idx" ON "transacciones"("usuarioId");
CREATE INDEX "transacciones_reservaId_idx" ON "transacciones"("reservaId");
CREATE INDEX "transacciones_estado_idx" ON "transacciones"("estado");
CREATE INDEX "transacciones_tipo_idx" ON "transacciones"("tipo");
CREATE INDEX "transacciones_fechaCreacion_idx" ON "transacciones"("fechaCreacion");
CREATE INDEX "transacciones_referenciaExterna_idx" ON "transacciones"("referenciaExterna");

CREATE INDEX "calificaciones_usuarioCalificadorId_idx" ON "calificaciones"("usuarioCalificadorId");
CREATE INDEX "calificaciones_usuarioCalificadoId_idx" ON "calificaciones"("usuarioCalificadoId");
CREATE INDEX "calificaciones_reservaId_idx" ON "calificaciones"("reservaId");
CREATE INDEX "calificaciones_publicacionId_idx" ON "calificaciones"("publicacionId");
CREATE INDEX "calificaciones_puntuacion_idx" ON "calificaciones"("puntuacion");
CREATE UNIQUE INDEX "calificaciones_usuarioCalificadorId_reservaId_key" ON "calificaciones"("usuarioCalificadorId", "reservaId");

CREATE INDEX "imagenes_publicacion_publicacionId_idx" ON "imagenes_publicacion"("publicacionId");
CREATE INDEX "imagenes_publicacion_orden_idx" ON "imagenes_publicacion"("orden");

CREATE INDEX "disponibilidad_fechas_publicacionId_idx" ON "disponibilidad_fechas"("publicacionId");
CREATE INDEX "disponibilidad_fechas_fecha_idx" ON "disponibilidad_fechas"("fecha");
CREATE UNIQUE INDEX "disponibilidad_fechas_publicacionId_fecha_key" ON "disponibilidad_fechas"("publicacionId", "fecha");

CREATE INDEX "mensajes_emisorId_idx" ON "mensajes"("emisorId");
CREATE INDEX "mensajes_receptorId_idx" ON "mensajes"("receptorId");
CREATE INDEX "mensajes_reservaId_idx" ON "mensajes"("reservaId");
CREATE INDEX "mensajes_fechaCreacion_idx" ON "mensajes"("fechaCreacion");
CREATE INDEX "mensajes_leido_idx" ON "mensajes"("leido");

CREATE INDEX "reportes_usuarioReportadorId_idx" ON "reportes"("usuarioReportadorId");
CREATE INDEX "reportes_usuarioReportadoId_idx" ON "reportes"("usuarioReportadoId");
CREATE INDEX "reportes_publicacionId_idx" ON "reportes"("publicacionId");
CREATE INDEX "reportes_fechaCreacion_idx" ON "reportes"("fechaCreacion");
CREATE INDEX "reportes_estado_idx" ON "reportes"("estado");

CREATE UNIQUE INDEX "administradores_usuarioId_key" ON "administradores"("usuarioId");
CREATE INDEX "administradores_usuarioId_idx" ON "administradores"("usuarioId");
CREATE INDEX "administradores_fechaAsignacion_idx" ON "administradores"("fechaAsignacion");
CREATE INDEX "administradores_activo_idx" ON "administradores"("activo");

CREATE INDEX "permisos_administrador_administradorId_idx" ON "permisos_administrador"("administradorId");
CREATE INDEX "permisos_administrador_tipo_idx" ON "permisos_administrador"("tipo");
CREATE INDEX "permisos_administrador_activo_idx" ON "permisos_administrador"("activo");
CREATE UNIQUE INDEX "permisos_administrador_administradorId_tipo_key" ON "permisos_administrador"("administradorId", "tipo");

CREATE INDEX "acciones_administrativas_administradorId_idx" ON "acciones_administrativas"("administradorId");
CREATE INDEX "acciones_administrativas_tipo_idx" ON "acciones_administrativas"("tipo");
CREATE INDEX "acciones_administrativas_fechaCreacion_idx" ON "acciones_administrativas"("fechaCreacion");
CREATE INDEX "acciones_administrativas_usuarioObjetivoId_idx" ON "acciones_administrativas"("usuarioObjetivoId");
CREATE INDEX "acciones_administrativas_publicacionObjetivoId_idx" ON "acciones_administrativas"("publicacionObjetivoId");
CREATE INDEX "acciones_administrativas_exitosa_idx" ON "acciones_administrativas"("exitosa");

CREATE INDEX "disputas_demandanteId_idx" ON "disputas"("demandanteId");
CREATE INDEX "disputas_demandadoId_idx" ON "disputas"("demandadoId");
CREATE INDEX "disputas_reservaId_idx" ON "disputas"("reservaId");
CREATE INDEX "disputas_administradorId_idx" ON "disputas"("administradorId");
CREATE INDEX "disputas_estado_idx" ON "disputas"("estado");
CREATE INDEX "disputas_tipo_idx" ON "disputas"("tipo");
CREATE INDEX "disputas_fechaCreacion_idx" ON "disputas"("fechaCreacion");
CREATE INDEX "disputas_severidad_idx" ON "disputas"("severidad");

CREATE INDEX "mensajes_disputa_disputaId_idx" ON "mensajes_disputa"("disputaId");
CREATE INDEX "mensajes_disputa_autorId_idx" ON "mensajes_disputa"("autorId");
CREATE INDEX "mensajes_disputa_fechaCreacion_idx" ON "mensajes_disputa"("fechaCreacion");
CREATE INDEX "mensajes_disputa_esInterno_idx" ON "mensajes_disputa"("esInterno");

CREATE INDEX "evidencias_disputa_disputaId_idx" ON "evidencias_disputa"("disputaId");
CREATE INDEX "evidencias_disputa_subidoPor_idx" ON "evidencias_disputa"("subidoPor");
CREATE INDEX "evidencias_disputa_tipo_idx" ON "evidencias_disputa"("tipo");
CREATE INDEX "evidencias_disputa_fechaCreacion_idx" ON "evidencias_disputa"("fechaCreacion");

CREATE INDEX "moderaciones_publicacion_publicacionId_idx" ON "moderaciones_publicacion"("publicacionId");
CREATE INDEX "moderaciones_publicacion_moderadorId_idx" ON "moderaciones_publicacion"("moderadorId");
CREATE INDEX "moderaciones_publicacion_fechaCreacion_idx" ON "moderaciones_publicacion"("fechaCreacion");
CREATE INDEX "moderaciones_publicacion_accion_idx" ON "moderaciones_publicacion"("accion");
CREATE INDEX "moderaciones_publicacion_estadoNuevo_idx" ON "moderaciones_publicacion"("estadoNuevo");

CREATE INDEX "estadisticas_sistema_nombre_idx" ON "estadisticas_sistema"("nombre");
CREATE INDEX "estadisticas_sistema_categoria_idx" ON "estadisticas_sistema"("categoria");
CREATE INDEX "estadisticas_sistema_fechaInicio_idx" ON "estadisticas_sistema"("fechaInicio");
CREATE INDEX "estadisticas_sistema_fechaFin_idx" ON "estadisticas_sistema"("fechaFin");
CREATE INDEX "estadisticas_sistema_fechaCreacion_idx" ON "estadisticas_sistema"("fechaCreacion");

-- 5. Crear Foreign Keys

ALTER TABLE "publicaciones" ADD CONSTRAINT "publicaciones_propietarioId_fkey" FOREIGN KEY ("propietarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "reservas" ADD CONSTRAINT "reservas_propietarioId_fkey" FOREIGN KEY ("propietarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_publicacionId_fkey" FOREIGN KEY ("publicacionId") REFERENCES "publicaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "transacciones" ADD CONSTRAINT "transacciones_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "reservas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "transacciones" ADD CONSTRAINT "transacciones_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "calificaciones" ADD CONSTRAINT "calificaciones_publicacionId_fkey" FOREIGN KEY ("publicacionId") REFERENCES "publicaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "calificaciones" ADD CONSTRAINT "calificaciones_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "reservas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "calificaciones" ADD CONSTRAINT "calificaciones_usuarioCalificadoId_fkey" FOREIGN KEY ("usuarioCalificadoId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "calificaciones" ADD CONSTRAINT "calificaciones_usuarioCalificadorId_fkey" FOREIGN KEY ("usuarioCalificadorId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "imagenes_publicacion" ADD CONSTRAINT "imagenes_publicacion_publicacionId_fkey" FOREIGN KEY ("publicacionId") REFERENCES "publicaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "disponibilidad_fechas" ADD CONSTRAINT "disponibilidad_fechas_publicacionId_fkey" FOREIGN KEY ("publicacionId") REFERENCES "publicaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "mensajes" ADD CONSTRAINT "mensajes_emisorId_fkey" FOREIGN KEY ("emisorId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mensajes" ADD CONSTRAINT "mensajes_receptorId_fkey" FOREIGN KEY ("receptorId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mensajes" ADD CONSTRAINT "mensajes_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "reservas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "reportes" ADD CONSTRAINT "reportes_publicacionId_fkey" FOREIGN KEY ("publicacionId") REFERENCES "publicaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "reportes" ADD CONSTRAINT "reportes_usuarioReportadoId_fkey" FOREIGN KEY ("usuarioReportadoId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "reportes" ADD CONSTRAINT "reportes_usuarioReportadorId_fkey" FOREIGN KEY ("usuarioReportadorId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "administradores" ADD CONSTRAINT "administradores_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "permisos_administrador" ADD CONSTRAINT "permisos_administrador_administradorId_fkey" FOREIGN KEY ("administradorId") REFERENCES "administradores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "acciones_administrativas" ADD CONSTRAINT "acciones_administrativas_administradorId_fkey" FOREIGN KEY ("administradorId") REFERENCES "administradores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "disputas" ADD CONSTRAINT "disputas_administradorId_fkey" FOREIGN KEY ("administradorId") REFERENCES "administradores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "disputas" ADD CONSTRAINT "disputas_demandadoId_fkey" FOREIGN KEY ("demandadoId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "disputas" ADD CONSTRAINT "disputas_demandanteId_fkey" FOREIGN KEY ("demandanteId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "disputas" ADD CONSTRAINT "disputas_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "reservas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "mensajes_disputa" ADD CONSTRAINT "mensajes_disputa_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mensajes_disputa" ADD CONSTRAINT "mensajes_disputa_disputaId_fkey" FOREIGN KEY ("disputaId") REFERENCES "disputas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "evidencias_disputa" ADD CONSTRAINT "evidencias_disputa_disputaId_fkey" FOREIGN KEY ("disputaId") REFERENCES "disputas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "evidencias_disputa" ADD CONSTRAINT "evidencias_disputa_subidoPor_fkey" FOREIGN KEY ("subidoPor") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "moderaciones_publicacion" ADD CONSTRAINT "moderaciones_publicacion_moderadorId_fkey" FOREIGN KEY ("moderadorId") REFERENCES "administradores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "moderaciones_publicacion" ADD CONSTRAINT "moderaciones_publicacion_publicacionId_fkey" FOREIGN KEY ("publicacionId") REFERENCES "publicaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
