-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ADMIN_SISTEMA', 'ADMIN_COOPERATIVA', 'OFICINISTA', 'CLIENTE');

-- CreateEnum
CREATE TYPE "EstadoBus" AS ENUM ('ACTIVO', 'MANTENIMIENTO', 'RETIRADO');

-- CreateEnum
CREATE TYPE "EstadoAsiento" AS ENUM ('DISPONIBLE', 'OCUPADO', 'MANTENIMIENTO', 'RESERVADO');

-- CreateEnum
CREATE TYPE "TipoViaje" AS ENUM ('DIRECTO', 'CON_PARADAS');

-- CreateEnum
CREATE TYPE "TipoDescuento" AS ENUM ('MENOR_EDAD', 'TERCERA_EDAD', 'DISCAPACIDAD');

-- CreateEnum
CREATE TYPE "EstadoHojaTrabajo" AS ENUM ('PROGRAMADO', 'EN_CURSO', 'COMPLETADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "TipoGeneracion" AS ENUM ('MANUAL', 'AUTOMATICA');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'VERIFICANDO', 'APROBADO', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "OrigenVenta" AS ENUM ('WEB', 'MOVIL', 'OFICINA');

-- CreateEnum
CREATE TYPE "TipoDescuentoCliente" AS ENUM ('NINGUNO', 'MENOR_EDAD', 'TERCERA_EDAD', 'DISCAPACIDAD');

-- CreateEnum
CREATE TYPE "EstadoBoleto" AS ENUM ('PENDIENTE', 'CONFIRMADO', 'ABORDADO', 'NO_SHOW', 'CANCELADO');

-- CreateEnum
CREATE TYPE "MetodoAbordaje" AS ENUM ('ESCANEO', 'MANUAL');

-- CreateEnum
CREATE TYPE "TipoConfiguracion" AS ENUM ('TEXTO', 'NUMERO', 'BOOLEANO', 'JSON');

-- CreateEnum
CREATE TYPE "TipoNotificacion" AS ENUM ('COMPRA', 'CAMBIO_ESTADO', 'RECORDATORIO', 'PROMOCION', 'SISTEMA');

-- CreateTable
CREATE TABLE "tenants" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "identificador" TEXT NOT NULL,
    "logoUrl" TEXT,
    "colorPrimario" TEXT,
    "colorSecundario" TEXT,
    "sitioWeb" TEXT,
    "emailContacto" TEXT,
    "telefono" TEXT,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "configJson" JSONB,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "cedula" TEXT,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "fechaNacimiento" TIMESTAMP(3),
    "telefono" TEXT,
    "esDiscapacitado" BOOLEAN NOT NULL DEFAULT false,
    "porcentajeDiscapacidad" DECIMAL(5,2),
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimoAcceso" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios_tenants" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "rol" "RolUsuario" NOT NULL,
    "permisos" JSONB,
    "fechaAsignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "usuarios_tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ciudades" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "provincia" TEXT NOT NULL,
    "ubicacionGeografica" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ciudades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resoluciones_ant" (
    "id" SERIAL NOT NULL,
    "numeroResolucion" TEXT NOT NULL,
    "fechaEmision" TIMESTAMP(3) NOT NULL,
    "fechaVigencia" TIMESTAMP(3),
    "documentoUrl" TEXT,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "resoluciones_ant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buses" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "placa" TEXT NOT NULL,
    "marcaChasis" TEXT NOT NULL,
    "modeloChasis" TEXT NOT NULL,
    "anioFabricacion" INTEGER,
    "marcaCarroceria" TEXT,
    "modeloCarroceria" TEXT,
    "configuracionAsientosId" INTEGER,
    "totalAsientos" INTEGER NOT NULL,
    "fotoUrl" TEXT,
    "tipoCombustible" TEXT,
    "fechaIngreso" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoBus" NOT NULL DEFAULT 'ACTIVO',
    "caracteristicas" JSONB,
    "configuracionPersonalizada" JSONB,

    CONSTRAINT "buses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion_asientos" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "busId" INTEGER NOT NULL,
    "planoAsientos" JSONB NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "configuracion_asientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_asiento" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "factorPrecio" DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    "color" TEXT,
    "icono" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tipos_asiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asientos" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "busId" INTEGER NOT NULL,
    "numero" TEXT NOT NULL,
    "fila" INTEGER,
    "columna" INTEGER,
    "tipoId" INTEGER NOT NULL,
    "estado" "EstadoAsiento" NOT NULL DEFAULT 'DISPONIBLE',
    "notas" TEXT,

    CONSTRAINT "asientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "frecuencias_asignadas" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "resolucionId" INTEGER NOT NULL,
    "ciudadOrigenId" INTEGER NOT NULL,
    "ciudadDestinoId" INTEGER NOT NULL,
    "horaSalida" TIMESTAMP(3) NOT NULL,
    "duracionEstimada" INTEGER NOT NULL,
    "distancia" DECIMAL(10,2),
    "fechaAsignacion" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "frecuencias_asignadas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paradas_frecuencia" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "frecuenciaId" INTEGER NOT NULL,
    "ciudadId" INTEGER NOT NULL,
    "orden" INTEGER NOT NULL,
    "tiempoLlegada" INTEGER NOT NULL,
    "tiempoParada" INTEGER NOT NULL DEFAULT 5,
    "esTerminal" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "paradas_frecuencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "frecuencias_habilitadas" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "frecuenciaId" INTEGER NOT NULL,
    "diasOperacion" TEXT NOT NULL,
    "horaSalida" TIMESTAMP(3),
    "precioBase" DECIMAL(10,2) NOT NULL,
    "tipoViaje" "TipoViaje" NOT NULL DEFAULT 'CON_PARADAS',
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "frecuencias_habilitadas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "precios_tramos" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "frecuenciaId" INTEGER NOT NULL,
    "ciudadOrigenId" INTEGER NOT NULL,
    "ciudadDestinoId" INTEGER NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "precios_tramos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion_descuentos" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "tipo" "TipoDescuento" NOT NULL,
    "porcentaje" DECIMAL(5,2) NOT NULL,
    "requiereValidacion" BOOLEAN NOT NULL DEFAULT true,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "configuracion_descuentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hoja_trabajo" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "frecuenciaHabilitadaId" INTEGER NOT NULL,
    "busId" INTEGER NOT NULL,
    "conductorId" INTEGER,
    "ayudanteId" INTEGER,
    "estado" "EstadoHojaTrabajo" NOT NULL DEFAULT 'PROGRAMADO',
    "observaciones" TEXT,
    "generacion" "TipoGeneracion" NOT NULL,

    CONSTRAINT "hoja_trabajo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ventas" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "hojaId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "oficinistaId" INTEGER,
    "fechaVenta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metodoPagoId" INTEGER NOT NULL,
    "totalSinDescuento" DECIMAL(10,2) NOT NULL,
    "totalDescuentos" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalFinal" DECIMAL(10,2) NOT NULL,
    "estadoPago" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
    "comprobanteUrl" TEXT,
    "codigoTransaccion" TEXT,
    "origenVenta" "OrigenVenta" NOT NULL,
    "ipCompra" TEXT,
    "dispositivoInfo" TEXT,
    "notas" TEXT,

    CONSTRAINT "ventas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boletos" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "ventaId" INTEGER NOT NULL,
    "pasajeroId" INTEGER,
    "asientoId" INTEGER NOT NULL,
    "ciudadOrigenId" INTEGER NOT NULL,
    "ciudadDestinoId" INTEGER NOT NULL,
    "fechaViaje" DATE NOT NULL,
    "horaSalida" TIMESTAMP(3) NOT NULL,
    "precioBase" DECIMAL(10,2) NOT NULL,
    "tipoDescuento" "TipoDescuentoCliente" NOT NULL DEFAULT 'NINGUNO',
    "porcentajeDescuento" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "precioFinal" DECIMAL(10,2) NOT NULL,
    "codigoAcceso" TEXT NOT NULL,
    "estado" "EstadoBoleto" NOT NULL DEFAULT 'PENDIENTE',
    "informacionPasajero" JSONB,

    CONSTRAINT "boletos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_abordaje" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "boletoId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "fechaHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metodo" "MetodoAbordaje" NOT NULL DEFAULT 'ESCANEO',
    "dispositivoInfo" TEXT,
    "ubicacionGeografica" TEXT,
    "observaciones" TEXT,

    CONSTRAINT "registros_abordaje_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuraciones" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "clave" TEXT NOT NULL,
    "valor" TEXT,
    "tipo" "TipoConfiguracion" NOT NULL,
    "descripcion" TEXT,
    "fechaModificacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "configuraciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "tipo" "TipoNotificacion" NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaLectura" TIMESTAMP(3),
    "entidadRelacionada" TEXT,
    "entidadId" INTEGER,
    "accionUrl" TEXT,
    "leida" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_identificador_key" ON "tenants"("identificador");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_cedula_key" ON "usuarios"("cedula");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_tenants_usuarioId_tenantId_rol_key" ON "usuarios_tenants"("usuarioId", "tenantId", "rol");

-- CreateIndex
CREATE INDEX "buses_tenantId_idx" ON "buses"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "buses_tenantId_placa_key" ON "buses"("tenantId", "placa");

-- CreateIndex
CREATE INDEX "configuracion_asientos_tenantId_idx" ON "configuracion_asientos"("tenantId");

-- CreateIndex
CREATE INDEX "tipos_asiento_tenantId_idx" ON "tipos_asiento"("tenantId");

-- CreateIndex
CREATE INDEX "asientos_tenantId_idx" ON "asientos"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "asientos_tenantId_busId_numero_key" ON "asientos"("tenantId", "busId", "numero");

-- CreateIndex
CREATE INDEX "frecuencias_asignadas_tenantId_idx" ON "frecuencias_asignadas"("tenantId");

-- CreateIndex
CREATE INDEX "paradas_frecuencia_tenantId_idx" ON "paradas_frecuencia"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "paradas_frecuencia_tenantId_frecuenciaId_ciudadId_key" ON "paradas_frecuencia"("tenantId", "frecuenciaId", "ciudadId");

-- CreateIndex
CREATE INDEX "frecuencias_habilitadas_tenantId_idx" ON "frecuencias_habilitadas"("tenantId");

-- CreateIndex
CREATE INDEX "precios_tramos_tenantId_idx" ON "precios_tramos"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "precios_tramos_tenantId_frecuenciaId_ciudadOrigenId_ciudadD_key" ON "precios_tramos"("tenantId", "frecuenciaId", "ciudadOrigenId", "ciudadDestinoId");

-- CreateIndex
CREATE INDEX "configuracion_descuentos_tenantId_idx" ON "configuracion_descuentos"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "configuracion_descuentos_tenantId_tipo_key" ON "configuracion_descuentos"("tenantId", "tipo");

-- CreateIndex
CREATE INDEX "hoja_trabajo_tenantId_idx" ON "hoja_trabajo"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "hoja_trabajo_tenantId_fecha_frecuenciaHabilitadaId_key" ON "hoja_trabajo"("tenantId", "fecha", "frecuenciaHabilitadaId");

-- CreateIndex
CREATE INDEX "ventas_tenantId_idx" ON "ventas"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "boletos_codigoAcceso_key" ON "boletos"("codigoAcceso");

-- CreateIndex
CREATE INDEX "boletos_tenantId_idx" ON "boletos"("tenantId");

-- CreateIndex
CREATE INDEX "registros_abordaje_tenantId_idx" ON "registros_abordaje"("tenantId");

-- CreateIndex
CREATE INDEX "configuraciones_tenantId_idx" ON "configuraciones"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "configuraciones_tenantId_clave_key" ON "configuraciones"("tenantId", "clave");

-- CreateIndex
CREATE INDEX "notificaciones_tenantId_idx" ON "notificaciones"("tenantId");

-- AddForeignKey
ALTER TABLE "usuarios_tenants" ADD CONSTRAINT "usuarios_tenants_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_tenants" ADD CONSTRAINT "usuarios_tenants_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buses" ADD CONSTRAINT "buses_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuracion_asientos" ADD CONSTRAINT "configuracion_asientos_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuracion_asientos" ADD CONSTRAINT "configuracion_asientos_busId_fkey" FOREIGN KEY ("busId") REFERENCES "buses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tipos_asiento" ADD CONSTRAINT "tipos_asiento_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asientos" ADD CONSTRAINT "asientos_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asientos" ADD CONSTRAINT "asientos_busId_fkey" FOREIGN KEY ("busId") REFERENCES "buses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asientos" ADD CONSTRAINT "asientos_tipoId_fkey" FOREIGN KEY ("tipoId") REFERENCES "tipos_asiento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "frecuencias_asignadas" ADD CONSTRAINT "frecuencias_asignadas_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paradas_frecuencia" ADD CONSTRAINT "paradas_frecuencia_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paradas_frecuencia" ADD CONSTRAINT "paradas_frecuencia_frecuenciaId_fkey" FOREIGN KEY ("frecuenciaId") REFERENCES "frecuencias_asignadas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "frecuencias_habilitadas" ADD CONSTRAINT "frecuencias_habilitadas_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "frecuencias_habilitadas" ADD CONSTRAINT "frecuencias_habilitadas_frecuenciaId_fkey" FOREIGN KEY ("frecuenciaId") REFERENCES "frecuencias_asignadas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "precios_tramos" ADD CONSTRAINT "precios_tramos_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "precios_tramos" ADD CONSTRAINT "precios_tramos_frecuenciaId_fkey" FOREIGN KEY ("frecuenciaId") REFERENCES "frecuencias_habilitadas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuracion_descuentos" ADD CONSTRAINT "configuracion_descuentos_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hoja_trabajo" ADD CONSTRAINT "hoja_trabajo_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hoja_trabajo" ADD CONSTRAINT "hoja_trabajo_frecuenciaHabilitadaId_fkey" FOREIGN KEY ("frecuenciaHabilitadaId") REFERENCES "frecuencias_habilitadas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hoja_trabajo" ADD CONSTRAINT "hoja_trabajo_busId_fkey" FOREIGN KEY ("busId") REFERENCES "buses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_hojaId_fkey" FOREIGN KEY ("hojaId") REFERENCES "hoja_trabajo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_oficinistaId_fkey" FOREIGN KEY ("oficinistaId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boletos" ADD CONSTRAINT "boletos_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boletos" ADD CONSTRAINT "boletos_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "ventas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boletos" ADD CONSTRAINT "boletos_pasajeroId_fkey" FOREIGN KEY ("pasajeroId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boletos" ADD CONSTRAINT "boletos_asientoId_fkey" FOREIGN KEY ("asientoId") REFERENCES "asientos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_abordaje" ADD CONSTRAINT "registros_abordaje_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_abordaje" ADD CONSTRAINT "registros_abordaje_boletoId_fkey" FOREIGN KEY ("boletoId") REFERENCES "boletos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_abordaje" ADD CONSTRAINT "registros_abordaje_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuraciones" ADD CONSTRAINT "configuraciones_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
