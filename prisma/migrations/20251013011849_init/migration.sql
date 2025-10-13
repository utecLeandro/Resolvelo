-- CreateEnum
CREATE TYPE "EstadoPublicacion" AS ENUM ('ACTIVA', 'PAUSADA', 'INACTIVA', 'ELIMINADA');

-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('USUARIO', 'MODERADOR', 'ADMINISTRADOR', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "EstadoReserva" AS ENUM ('PENDIENTE', 'CONFIRMADA', 'EN_CURSO', 'COMPLETADA', 'CANCELADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "EstadoTransaccion" AS ENUM ('PENDIENTE', 'PROCESANDO', 'COMPLETADA', 'FALLIDA', 'REEMBOLSADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoTransaccion" AS ENUM ('PAGO_RESERVA', 'DEPOSITO', 'REEMBOLSO', 'COMISION');

-- CreateEnum
CREATE TYPE "CategoriaEquipo" AS ENUM ('GUITARRAS', 'BATERIAS', 'TECLADOS', 'VIENTOS', 'CUERDAS', 'AMPLIFICADORES', 'AUDIO_PA', 'PERCUSION', 'GRABACION', 'ILUMINACION', 'ACCESORIOS', 'OTROS');

-- CreateEnum
CREATE TYPE "EstadoVerificacion" AS ENUM ('PENDIENTE', 'VERIFICADA', 'RECHAZADA', 'SUSPENDIDA');

-- CreateEnum
CREATE TYPE "EstadoModeracion" AS ENUM ('PENDIENTE_REVISION', 'APROBADA', 'RECHAZADA', 'REPORTADA', 'SUSPENDIDA', 'ELIMINADA');

-- CreateEnum
CREATE TYPE "TipoAccionAdmin" AS ENUM ('CREAR_USUARIO', 'MODIFICAR_USUARIO', 'SUSPENDER_USUARIO', 'BLOQUEAR_USUARIO', 'CAMBIAR_ROL', 'MODERAR_PUBLICACION', 'RESOLVER_DISPUTA', 'ELIMINAR_CONTENIDO', 'CONFIGURAR_SISTEMA', 'GENERAR_REPORTE');

-- CreateEnum
CREATE TYPE "TipoDisputa" AS ENUM ('EQUIPO_NO_ENTREGADO', 'EQUIPO_DANADO', 'DESCRIPCION_INCORRECTA', 'PROBLEMA_PAGO', 'COMPORTAMIENTO_USUARIO', 'CANCELACION_INDEBIDA', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoDisputa" AS ENUM ('ABIERTA', 'EN_REVISION', 'ESPERANDO_RESPUESTA', 'RESUELTA', 'CERRADA', 'ESCALADA');

-- CreateEnum
CREATE TYPE "TipoPermiso" AS ENUM ('MODERAR_PUBLICACIONES', 'GESTIONAR_USUARIOS', 'RESOLVER_DISPUTAS', 'ACCEDER_REPORTES', 'CONFIGURAR_SISTEMA', 'GESTIONAR_PAGOS', 'ELIMINAR_CONTENIDO', 'BANEAR_USUARIOS', 'GESTIONAR_ADMINISTRADORES', 'ACCESO_COMPLETO');

-- CreateEnum
CREATE TYPE "SeveridadReporte" AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'CRITICA');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
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
    "tokenVerificacion" VARCHAR(255),
    "tokenRecuperacion" VARCHAR(255),
    "fechaExpiracionToken" TIMESTAMP(3),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publicaciones" (
    "id" TEXT NOT NULL,
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
    "propietarioId" TEXT NOT NULL,

    CONSTRAINT "publicaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservas" (
    "id" TEXT NOT NULL,
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
    "usuarioId" TEXT NOT NULL,
    "publicacionId" TEXT NOT NULL,
    "propietarioId" TEXT NOT NULL,

    CONSTRAINT "reservas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transacciones" (
    "id" TEXT NOT NULL,
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
    "usuarioId" TEXT NOT NULL,
    "reservaId" TEXT,

    CONSTRAINT "transacciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calificaciones" (
    "id" TEXT NOT NULL,
    "puntuacion" INTEGER NOT NULL,
    "comentario" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,
    "usuarioCalificadorId" TEXT NOT NULL,
    "usuarioCalificadoId" TEXT NOT NULL,
    "reservaId" TEXT NOT NULL,
    "publicacionId" TEXT NOT NULL,

    CONSTRAINT "calificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imagenes_publicacion" (
    "id" TEXT NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "descripcion" VARCHAR(255),
    "orden" INTEGER NOT NULL DEFAULT 0,
    "esPrincipal" BOOLEAN NOT NULL DEFAULT false,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publicacionId" TEXT NOT NULL,

    CONSTRAINT "imagenes_publicacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disponibilidad_fechas" (
    "id" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "disponible" BOOLEAN NOT NULL DEFAULT true,
    "motivo" VARCHAR(255),
    "publicacionId" TEXT NOT NULL,

    CONSTRAINT "disponibilidad_fechas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensajes" (
    "id" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "leido" BOOLEAN NOT NULL DEFAULT false,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaLectura" TIMESTAMP(3),
    "emisorId" TEXT NOT NULL,
    "receptorId" TEXT NOT NULL,
    "reservaId" TEXT,

    CONSTRAINT "mensajes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reportes" (
    "id" TEXT NOT NULL,
    "motivo" VARCHAR(100) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE',
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaResolucion" TIMESTAMP(3),
    "usuarioReportadorId" TEXT NOT NULL,
    "usuarioReportadoId" TEXT,
    "publicacionId" TEXT,

    CONSTRAINT "reportes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "administradores" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "permisos_administrador" (
    "id" TEXT NOT NULL,
    "tipo" "TipoPermiso" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaAsignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaExpiracion" TIMESTAMP(3),
    "administradorId" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permisos_administrador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acciones_administrativas" (
    "id" TEXT NOT NULL,
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
    "administradorId" TEXT NOT NULL,

    CONSTRAINT "acciones_administrativas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disputas" (
    "id" TEXT NOT NULL,
    "tipo" "TipoDisputa" NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" "EstadoDisputa" NOT NULL DEFAULT 'ABIERTA',
    "severidad" "SeveridadReporte" NOT NULL DEFAULT 'MEDIA',
    "demandanteId" TEXT NOT NULL,
    "demandadoId" TEXT NOT NULL,
    "reservaId" TEXT,
    "resolucion" TEXT,
    "compensacion" DECIMAL(10,2),
    "fechaResolucion" TIMESTAMP(3),
    "administradorId" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,
    "fechaLimiteRespuesta" TIMESTAMP(3),

    CONSTRAINT "disputas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensajes_disputa" (
    "id" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "esInterno" BOOLEAN NOT NULL DEFAULT false,
    "disputaId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editado" BOOLEAN NOT NULL DEFAULT false,
    "fechaEdicion" TIMESTAMP(3),

    CONSTRAINT "mensajes_disputa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidencias_disputa" (
    "id" TEXT NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "tamano" INTEGER,
    "descripcion" TEXT,
    "disputaId" TEXT NOT NULL,
    "subidoPor" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidencias_disputa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderaciones_publicacion" (
    "id" TEXT NOT NULL,
    "accion" VARCHAR(50) NOT NULL,
    "motivo" VARCHAR(200),
    "comentarios" TEXT,
    "estadoAnterior" "EstadoModeracion" NOT NULL,
    "estadoNuevo" "EstadoModeracion" NOT NULL,
    "publicacionId" TEXT NOT NULL,
    "moderadorId" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderaciones_publicacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estadisticas_sistema" (
    "id" TEXT NOT NULL,
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

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_documentoIdentidad_key" ON "usuarios"("documentoIdentidad");

-- CreateIndex
CREATE INDEX "usuarios_email_idx" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_documentoIdentidad_idx" ON "usuarios"("documentoIdentidad");

-- CreateIndex
CREATE INDEX "usuarios_estadoVerificacion_idx" ON "usuarios"("estadoVerificacion");

-- CreateIndex
CREATE INDEX "usuarios_fechaCreacion_idx" ON "usuarios"("fechaCreacion");

-- CreateIndex
CREATE INDEX "usuarios_calificacionPromedio_idx" ON "usuarios"("calificacionPromedio");

-- CreateIndex
CREATE INDEX "publicaciones_propietarioId_idx" ON "publicaciones"("propietarioId");

-- CreateIndex
CREATE INDEX "publicaciones_categoria_idx" ON "publicaciones"("categoria");

-- CreateIndex
CREATE INDEX "publicaciones_estado_idx" ON "publicaciones"("estado");

-- CreateIndex
CREATE INDEX "publicaciones_ciudad_departamento_idx" ON "publicaciones"("ciudad", "departamento");

-- CreateIndex
CREATE INDEX "publicaciones_precioPorDia_idx" ON "publicaciones"("precioPorDia");

-- CreateIndex
CREATE INDEX "publicaciones_fechaCreacion_idx" ON "publicaciones"("fechaCreacion");

-- CreateIndex
CREATE INDEX "publicaciones_calificacionPromedio_idx" ON "publicaciones"("calificacionPromedio");

-- CreateIndex
CREATE INDEX "publicaciones_disponible_idx" ON "publicaciones"("disponible");

-- CreateIndex
CREATE INDEX "reservas_usuarioId_idx" ON "reservas"("usuarioId");

-- CreateIndex
CREATE INDEX "reservas_publicacionId_idx" ON "reservas"("publicacionId");

-- CreateIndex
CREATE INDEX "reservas_propietarioId_idx" ON "reservas"("propietarioId");

-- CreateIndex
CREATE INDEX "reservas_estado_idx" ON "reservas"("estado");

-- CreateIndex
CREATE INDEX "reservas_fechaInicio_fechaFin_idx" ON "reservas"("fechaInicio", "fechaFin");

-- CreateIndex
CREATE INDEX "reservas_fechaCreacion_idx" ON "reservas"("fechaCreacion");

-- CreateIndex
CREATE INDEX "transacciones_usuarioId_idx" ON "transacciones"("usuarioId");

-- CreateIndex
CREATE INDEX "transacciones_reservaId_idx" ON "transacciones"("reservaId");

-- CreateIndex
CREATE INDEX "transacciones_estado_idx" ON "transacciones"("estado");

-- CreateIndex
CREATE INDEX "transacciones_tipo_idx" ON "transacciones"("tipo");

-- CreateIndex
CREATE INDEX "transacciones_fechaCreacion_idx" ON "transacciones"("fechaCreacion");

-- CreateIndex
CREATE INDEX "transacciones_referenciaExterna_idx" ON "transacciones"("referenciaExterna");

-- CreateIndex
CREATE INDEX "calificaciones_usuarioCalificadorId_idx" ON "calificaciones"("usuarioCalificadorId");

-- CreateIndex
CREATE INDEX "calificaciones_usuarioCalificadoId_idx" ON "calificaciones"("usuarioCalificadoId");

-- CreateIndex
CREATE INDEX "calificaciones_reservaId_idx" ON "calificaciones"("reservaId");

-- CreateIndex
CREATE INDEX "calificaciones_publicacionId_idx" ON "calificaciones"("publicacionId");

-- CreateIndex
CREATE INDEX "calificaciones_puntuacion_idx" ON "calificaciones"("puntuacion");

-- CreateIndex
CREATE UNIQUE INDEX "calificaciones_usuarioCalificadorId_reservaId_key" ON "calificaciones"("usuarioCalificadorId", "reservaId");

-- CreateIndex
CREATE INDEX "imagenes_publicacion_publicacionId_idx" ON "imagenes_publicacion"("publicacionId");

-- CreateIndex
CREATE INDEX "imagenes_publicacion_orden_idx" ON "imagenes_publicacion"("orden");

-- CreateIndex
CREATE INDEX "disponibilidad_fechas_publicacionId_idx" ON "disponibilidad_fechas"("publicacionId");

-- CreateIndex
CREATE INDEX "disponibilidad_fechas_fecha_idx" ON "disponibilidad_fechas"("fecha");

-- CreateIndex
CREATE UNIQUE INDEX "disponibilidad_fechas_publicacionId_fecha_key" ON "disponibilidad_fechas"("publicacionId", "fecha");

-- CreateIndex
CREATE INDEX "mensajes_emisorId_idx" ON "mensajes"("emisorId");

-- CreateIndex
CREATE INDEX "mensajes_receptorId_idx" ON "mensajes"("receptorId");

-- CreateIndex
CREATE INDEX "mensajes_reservaId_idx" ON "mensajes"("reservaId");

-- CreateIndex
CREATE INDEX "mensajes_fechaCreacion_idx" ON "mensajes"("fechaCreacion");

-- CreateIndex
CREATE INDEX "mensajes_leido_idx" ON "mensajes"("leido");

-- CreateIndex
CREATE INDEX "reportes_usuarioReportadorId_idx" ON "reportes"("usuarioReportadorId");

-- CreateIndex
CREATE INDEX "reportes_usuarioReportadoId_idx" ON "reportes"("usuarioReportadoId");

-- CreateIndex
CREATE INDEX "reportes_publicacionId_idx" ON "reportes"("publicacionId");

-- CreateIndex
CREATE INDEX "reportes_fechaCreacion_idx" ON "reportes"("fechaCreacion");

-- CreateIndex
CREATE INDEX "reportes_estado_idx" ON "reportes"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "administradores_usuarioId_key" ON "administradores"("usuarioId");

-- CreateIndex
CREATE INDEX "administradores_usuarioId_idx" ON "administradores"("usuarioId");

-- CreateIndex
CREATE INDEX "administradores_fechaAsignacion_idx" ON "administradores"("fechaAsignacion");

-- CreateIndex
CREATE INDEX "administradores_activo_idx" ON "administradores"("activo");

-- CreateIndex
CREATE INDEX "permisos_administrador_administradorId_idx" ON "permisos_administrador"("administradorId");

-- CreateIndex
CREATE INDEX "permisos_administrador_tipo_idx" ON "permisos_administrador"("tipo");

-- CreateIndex
CREATE INDEX "permisos_administrador_activo_idx" ON "permisos_administrador"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "permisos_administrador_administradorId_tipo_key" ON "permisos_administrador"("administradorId", "tipo");

-- CreateIndex
CREATE INDEX "acciones_administrativas_administradorId_idx" ON "acciones_administrativas"("administradorId");

-- CreateIndex
CREATE INDEX "acciones_administrativas_tipo_idx" ON "acciones_administrativas"("tipo");

-- CreateIndex
CREATE INDEX "acciones_administrativas_fechaCreacion_idx" ON "acciones_administrativas"("fechaCreacion");

-- CreateIndex
CREATE INDEX "acciones_administrativas_usuarioObjetivoId_idx" ON "acciones_administrativas"("usuarioObjetivoId");

-- CreateIndex
CREATE INDEX "acciones_administrativas_publicacionObjetivoId_idx" ON "acciones_administrativas"("publicacionObjetivoId");

-- CreateIndex
CREATE INDEX "acciones_administrativas_exitosa_idx" ON "acciones_administrativas"("exitosa");

-- CreateIndex
CREATE INDEX "disputas_demandanteId_idx" ON "disputas"("demandanteId");

-- CreateIndex
CREATE INDEX "disputas_demandadoId_idx" ON "disputas"("demandadoId");

-- CreateIndex
CREATE INDEX "disputas_reservaId_idx" ON "disputas"("reservaId");

-- CreateIndex
CREATE INDEX "disputas_administradorId_idx" ON "disputas"("administradorId");

-- CreateIndex
CREATE INDEX "disputas_estado_idx" ON "disputas"("estado");

-- CreateIndex
CREATE INDEX "disputas_tipo_idx" ON "disputas"("tipo");

-- CreateIndex
CREATE INDEX "disputas_fechaCreacion_idx" ON "disputas"("fechaCreacion");

-- CreateIndex
CREATE INDEX "disputas_severidad_idx" ON "disputas"("severidad");

-- CreateIndex
CREATE INDEX "mensajes_disputa_disputaId_idx" ON "mensajes_disputa"("disputaId");

-- CreateIndex
CREATE INDEX "mensajes_disputa_autorId_idx" ON "mensajes_disputa"("autorId");

-- CreateIndex
CREATE INDEX "mensajes_disputa_fechaCreacion_idx" ON "mensajes_disputa"("fechaCreacion");

-- CreateIndex
CREATE INDEX "mensajes_disputa_esInterno_idx" ON "mensajes_disputa"("esInterno");

-- CreateIndex
CREATE INDEX "evidencias_disputa_disputaId_idx" ON "evidencias_disputa"("disputaId");

-- CreateIndex
CREATE INDEX "evidencias_disputa_subidoPor_idx" ON "evidencias_disputa"("subidoPor");

-- CreateIndex
CREATE INDEX "evidencias_disputa_tipo_idx" ON "evidencias_disputa"("tipo");

-- CreateIndex
CREATE INDEX "evidencias_disputa_fechaCreacion_idx" ON "evidencias_disputa"("fechaCreacion");

-- CreateIndex
CREATE INDEX "moderaciones_publicacion_publicacionId_idx" ON "moderaciones_publicacion"("publicacionId");

-- CreateIndex
CREATE INDEX "moderaciones_publicacion_moderadorId_idx" ON "moderaciones_publicacion"("moderadorId");

-- CreateIndex
CREATE INDEX "moderaciones_publicacion_fechaCreacion_idx" ON "moderaciones_publicacion"("fechaCreacion");

-- CreateIndex
CREATE INDEX "moderaciones_publicacion_accion_idx" ON "moderaciones_publicacion"("accion");

-- CreateIndex
CREATE INDEX "moderaciones_publicacion_estadoNuevo_idx" ON "moderaciones_publicacion"("estadoNuevo");

-- CreateIndex
CREATE INDEX "estadisticas_sistema_nombre_idx" ON "estadisticas_sistema"("nombre");

-- CreateIndex
CREATE INDEX "estadisticas_sistema_categoria_idx" ON "estadisticas_sistema"("categoria");

-- CreateIndex
CREATE INDEX "estadisticas_sistema_fechaInicio_idx" ON "estadisticas_sistema"("fechaInicio");

-- CreateIndex
CREATE INDEX "estadisticas_sistema_fechaFin_idx" ON "estadisticas_sistema"("fechaFin");

-- CreateIndex
CREATE INDEX "estadisticas_sistema_fechaCreacion_idx" ON "estadisticas_sistema"("fechaCreacion");

-- AddForeignKey
ALTER TABLE "publicaciones" ADD CONSTRAINT "publicaciones_propietarioId_fkey" FOREIGN KEY ("propietarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_publicacionId_fkey" FOREIGN KEY ("publicacionId") REFERENCES "publicaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservas" ADD CONSTRAINT "reservas_propietarioId_fkey" FOREIGN KEY ("propietarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacciones" ADD CONSTRAINT "transacciones_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacciones" ADD CONSTRAINT "transacciones_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "reservas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calificaciones" ADD CONSTRAINT "calificaciones_usuarioCalificadorId_fkey" FOREIGN KEY ("usuarioCalificadorId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calificaciones" ADD CONSTRAINT "calificaciones_usuarioCalificadoId_fkey" FOREIGN KEY ("usuarioCalificadoId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calificaciones" ADD CONSTRAINT "calificaciones_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "reservas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calificaciones" ADD CONSTRAINT "calificaciones_publicacionId_fkey" FOREIGN KEY ("publicacionId") REFERENCES "publicaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagenes_publicacion" ADD CONSTRAINT "imagenes_publicacion_publicacionId_fkey" FOREIGN KEY ("publicacionId") REFERENCES "publicaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disponibilidad_fechas" ADD CONSTRAINT "disponibilidad_fechas_publicacionId_fkey" FOREIGN KEY ("publicacionId") REFERENCES "publicaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensajes" ADD CONSTRAINT "mensajes_emisorId_fkey" FOREIGN KEY ("emisorId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensajes" ADD CONSTRAINT "mensajes_receptorId_fkey" FOREIGN KEY ("receptorId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensajes" ADD CONSTRAINT "mensajes_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "reservas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportes" ADD CONSTRAINT "reportes_usuarioReportadorId_fkey" FOREIGN KEY ("usuarioReportadorId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportes" ADD CONSTRAINT "reportes_usuarioReportadoId_fkey" FOREIGN KEY ("usuarioReportadoId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportes" ADD CONSTRAINT "reportes_publicacionId_fkey" FOREIGN KEY ("publicacionId") REFERENCES "publicaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "administradores" ADD CONSTRAINT "administradores_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permisos_administrador" ADD CONSTRAINT "permisos_administrador_administradorId_fkey" FOREIGN KEY ("administradorId") REFERENCES "administradores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acciones_administrativas" ADD CONSTRAINT "acciones_administrativas_administradorId_fkey" FOREIGN KEY ("administradorId") REFERENCES "administradores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputas" ADD CONSTRAINT "disputas_demandanteId_fkey" FOREIGN KEY ("demandanteId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputas" ADD CONSTRAINT "disputas_demandadoId_fkey" FOREIGN KEY ("demandadoId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputas" ADD CONSTRAINT "disputas_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "reservas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputas" ADD CONSTRAINT "disputas_administradorId_fkey" FOREIGN KEY ("administradorId") REFERENCES "administradores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensajes_disputa" ADD CONSTRAINT "mensajes_disputa_disputaId_fkey" FOREIGN KEY ("disputaId") REFERENCES "disputas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensajes_disputa" ADD CONSTRAINT "mensajes_disputa_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencias_disputa" ADD CONSTRAINT "evidencias_disputa_disputaId_fkey" FOREIGN KEY ("disputaId") REFERENCES "disputas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencias_disputa" ADD CONSTRAINT "evidencias_disputa_subidoPor_fkey" FOREIGN KEY ("subidoPor") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderaciones_publicacion" ADD CONSTRAINT "moderaciones_publicacion_publicacionId_fkey" FOREIGN KEY ("publicacionId") REFERENCES "publicaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderaciones_publicacion" ADD CONSTRAINT "moderaciones_publicacion_moderadorId_fkey" FOREIGN KEY ("moderadorId") REFERENCES "administradores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
