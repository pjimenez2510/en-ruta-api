/*
  Warnings:

  - You are about to drop the column `informacionPasajero` on the `boletos` table. All the data in the column will be lost.
  - You are about to drop the column `caracteristicas` on the `buses` table. All the data in the column will be lost.
  - You are about to drop the column `configuracionAsientosId` on the `buses` table. All the data in the column will be lost.
  - You are about to drop the column `configuracionPersonalizada` on the `buses` table. All the data in the column will be lost.
  - You are about to drop the column `marcaCarroceria` on the `buses` table. All the data in the column will be lost.
  - You are about to drop the column `marcaChasis` on the `buses` table. All the data in the column will be lost.
  - You are about to drop the column `modeloCarroceria` on the `buses` table. All the data in the column will be lost.
  - You are about to drop the column `modeloChasis` on the `buses` table. All the data in the column will be lost.
  - You are about to drop the column `ubicacionGeografica` on the `ciudades` table. All the data in the column will be lost.
  - You are about to drop the column `ubicacionGeografica` on the `registros_abordaje` table. All the data in the column will be lost.
  - You are about to drop the column `configJson` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `permisos` on the `usuarios_tenants` table. All the data in the column will be lost.
  - You are about to drop the `configuracion_asientos` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[tenantId,numero]` on the table `buses` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,nombre]` on the table `tipos_asiento` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `pisoBusId` to the `asientos` table without a default value. This is not possible if the table is not empty.
  - Made the column `fila` on table `asientos` required. This step will fail if there are existing NULL values in that column.
  - Made the column `columna` on table `asientos` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `modeloBusId` to the `buses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "RolUsuario" ADD VALUE 'CONDUCTOR';
ALTER TYPE "RolUsuario" ADD VALUE 'AYUDANTE';

-- DropForeignKey
ALTER TABLE "configuracion_asientos" DROP CONSTRAINT "configuracion_asientos_busId_fkey";

-- DropForeignKey
ALTER TABLE "configuracion_asientos" DROP CONSTRAINT "configuracion_asientos_tenantId_fkey";

-- AlterTable
ALTER TABLE "asientos" ADD COLUMN     "pisoBusId" INTEGER NOT NULL,
ALTER COLUMN "fila" SET NOT NULL,
ALTER COLUMN "columna" SET NOT NULL;

-- AlterTable
ALTER TABLE "boletos" DROP COLUMN "informacionPasajero";

-- AlterTable
ALTER TABLE "buses" DROP COLUMN "caracteristicas",
DROP COLUMN "configuracionAsientosId",
DROP COLUMN "configuracionPersonalizada",
DROP COLUMN "marcaCarroceria",
DROP COLUMN "marcaChasis",
DROP COLUMN "modeloCarroceria",
DROP COLUMN "modeloChasis",
ADD COLUMN     "modeloBusId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ciudades" DROP COLUMN "ubicacionGeografica",
ADD COLUMN     "latitud" DECIMAL(10,6),
ADD COLUMN     "longitud" DECIMAL(10,6);

-- AlterTable
ALTER TABLE "registros_abordaje" DROP COLUMN "ubicacionGeografica",
ADD COLUMN     "latitud" DECIMAL(10,6),
ADD COLUMN     "longitud" DECIMAL(10,6);

-- AlterTable
ALTER TABLE "tenants" DROP COLUMN "configJson";

-- AlterTable
ALTER TABLE "usuarios_tenants" DROP COLUMN "permisos";

-- DropTable
DROP TABLE "configuracion_asientos";

-- CreateTable
CREATE TABLE "permisos_usuario" (
    "id" SERIAL NOT NULL,
    "usuarioTenantId" INTEGER NOT NULL,
    "permiso" TEXT NOT NULL,
    "valor" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "permisos_usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modelos_bus" (
    "id" SERIAL NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "tipoChasis" TEXT,
    "tipoCarroceria" TEXT,
    "anioModelo" INTEGER,
    "numeroPisos" INTEGER NOT NULL DEFAULT 1,
    "descripcion" TEXT,
    "esPublico" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "modelos_bus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plantillas_piso" (
    "id" SERIAL NOT NULL,
    "modeloBusId" INTEGER NOT NULL,
    "numeroPiso" INTEGER NOT NULL,
    "filas" INTEGER NOT NULL,
    "columnas" INTEGER NOT NULL,
    "descripcion" TEXT,
    "esPublico" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "plantillas_piso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ubicaciones_asiento_plantilla" (
    "id" SERIAL NOT NULL,
    "plantillaPisoId" INTEGER NOT NULL,
    "fila" INTEGER NOT NULL,
    "columna" INTEGER NOT NULL,
    "estaHabilitado" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ubicaciones_asiento_plantilla_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pisos_bus" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "busId" INTEGER NOT NULL,
    "numeroPiso" INTEGER NOT NULL,
    "plantillaPisoId" INTEGER,

    CONSTRAINT "pisos_bus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "caracteristicas_bus" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "busId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "valor" TEXT NOT NULL,

    CONSTRAINT "caracteristicas_bus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "precios_tipo_asiento" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "tipoAsientoId" INTEGER NOT NULL,
    "tramoId" INTEGER,
    "multiplicador" DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    "cargoAdicional" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "precios_tipo_asiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metodos_pago" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "procesador" TEXT,
    "configuracion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "metodos_pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "informacion_pasajeros" (
    "id" SERIAL NOT NULL,
    "boletoId" INTEGER NOT NULL,
    "nombreCompleto" TEXT NOT NULL,
    "tipoDocumento" TEXT NOT NULL DEFAULT 'CEDULA',
    "numeroDocumento" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "fechaNacimiento" TIMESTAMP(3),

    CONSTRAINT "informacion_pasajeros_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "permisos_usuario_usuarioTenantId_permiso_key" ON "permisos_usuario"("usuarioTenantId", "permiso");

-- CreateIndex
CREATE UNIQUE INDEX "modelos_bus_marca_modelo_key" ON "modelos_bus"("marca", "modelo");

-- CreateIndex
CREATE UNIQUE INDEX "plantillas_piso_modeloBusId_numeroPiso_key" ON "plantillas_piso"("modeloBusId", "numeroPiso");

-- CreateIndex
CREATE UNIQUE INDEX "ubicaciones_asiento_plantilla_plantillaPisoId_fila_columna_key" ON "ubicaciones_asiento_plantilla"("plantillaPisoId", "fila", "columna");

-- CreateIndex
CREATE INDEX "pisos_bus_tenantId_idx" ON "pisos_bus"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "pisos_bus_busId_numeroPiso_key" ON "pisos_bus"("busId", "numeroPiso");

-- CreateIndex
CREATE INDEX "caracteristicas_bus_tenantId_idx" ON "caracteristicas_bus"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "caracteristicas_bus_busId_nombre_key" ON "caracteristicas_bus"("busId", "nombre");

-- CreateIndex
CREATE INDEX "precios_tipo_asiento_tenantId_idx" ON "precios_tipo_asiento"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "precios_tipo_asiento_tenantId_tipoAsientoId_tramoId_key" ON "precios_tipo_asiento"("tenantId", "tipoAsientoId", "tramoId");

-- CreateIndex
CREATE INDEX "metodos_pago_tenantId_idx" ON "metodos_pago"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "metodos_pago_tenantId_nombre_key" ON "metodos_pago"("tenantId", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "informacion_pasajeros_boletoId_key" ON "informacion_pasajeros"("boletoId");

-- CreateIndex
CREATE UNIQUE INDEX "buses_tenantId_numero_key" ON "buses"("tenantId", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_asiento_tenantId_nombre_key" ON "tipos_asiento"("tenantId", "nombre");

-- AddForeignKey
ALTER TABLE "permisos_usuario" ADD CONSTRAINT "permisos_usuario_usuarioTenantId_fkey" FOREIGN KEY ("usuarioTenantId") REFERENCES "usuarios_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantillas_piso" ADD CONSTRAINT "plantillas_piso_modeloBusId_fkey" FOREIGN KEY ("modeloBusId") REFERENCES "modelos_bus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ubicaciones_asiento_plantilla" ADD CONSTRAINT "ubicaciones_asiento_plantilla_plantillaPisoId_fkey" FOREIGN KEY ("plantillaPisoId") REFERENCES "plantillas_piso"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buses" ADD CONSTRAINT "buses_modeloBusId_fkey" FOREIGN KEY ("modeloBusId") REFERENCES "modelos_bus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pisos_bus" ADD CONSTRAINT "pisos_bus_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pisos_bus" ADD CONSTRAINT "pisos_bus_busId_fkey" FOREIGN KEY ("busId") REFERENCES "buses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pisos_bus" ADD CONSTRAINT "pisos_bus_plantillaPisoId_fkey" FOREIGN KEY ("plantillaPisoId") REFERENCES "plantillas_piso"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caracteristicas_bus" ADD CONSTRAINT "caracteristicas_bus_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caracteristicas_bus" ADD CONSTRAINT "caracteristicas_bus_busId_fkey" FOREIGN KEY ("busId") REFERENCES "buses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asientos" ADD CONSTRAINT "asientos_pisoBusId_fkey" FOREIGN KEY ("pisoBusId") REFERENCES "pisos_bus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "precios_tipo_asiento" ADD CONSTRAINT "precios_tipo_asiento_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "precios_tipo_asiento" ADD CONSTRAINT "precios_tipo_asiento_tipoAsientoId_fkey" FOREIGN KEY ("tipoAsientoId") REFERENCES "tipos_asiento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metodos_pago" ADD CONSTRAINT "metodos_pago_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_metodoPagoId_fkey" FOREIGN KEY ("metodoPagoId") REFERENCES "metodos_pago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "informacion_pasajeros" ADD CONSTRAINT "informacion_pasajeros_boletoId_fkey" FOREIGN KEY ("boletoId") REFERENCES "boletos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
