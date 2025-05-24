/*
  Warnings:

  - You are about to drop the column `busId` on the `asientos` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `asientos` table. All the data in the column will be lost.
  - You are about to drop the column `pasajeroId` on the `boletos` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `caracteristicas_bus` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `frecuencias_habilitadas` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `paradas_frecuencia` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `pisos_bus` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `precios_tramos` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `registros_abordaje` table. All the data in the column will be lost.
  - You are about to drop the column `apellidos` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `cedula` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `esDiscapacitado` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `fechaNacimiento` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `nombres` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `porcentajeDiscapacidad` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `telefono` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the `informacion_pasajeros` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[pisoBusId,numero]` on the table `asientos` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[frecuenciaId,ciudadId]` on the table `paradas_frecuencia` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[frecuenciaId,ciudadOrigenId,ciudadDestinoId]` on the table `precios_tramos` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clienteId` to the `boletos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "asientos" DROP CONSTRAINT "asientos_busId_fkey";

-- DropForeignKey
ALTER TABLE "asientos" DROP CONSTRAINT "asientos_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "boletos" DROP CONSTRAINT "boletos_pasajeroId_fkey";

-- DropForeignKey
ALTER TABLE "caracteristicas_bus" DROP CONSTRAINT "caracteristicas_bus_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "frecuencias_habilitadas" DROP CONSTRAINT "frecuencias_habilitadas_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "informacion_pasajeros" DROP CONSTRAINT "informacion_pasajeros_boletoId_fkey";

-- DropForeignKey
ALTER TABLE "paradas_frecuencia" DROP CONSTRAINT "paradas_frecuencia_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "pisos_bus" DROP CONSTRAINT "pisos_bus_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "precios_tramos" DROP CONSTRAINT "precios_tramos_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "registros_abordaje" DROP CONSTRAINT "registros_abordaje_tenantId_fkey";

-- DropIndex
DROP INDEX "asientos_tenantId_busId_numero_key";

-- DropIndex
DROP INDEX "asientos_tenantId_idx";

-- DropIndex
DROP INDEX "caracteristicas_bus_tenantId_idx";

-- DropIndex
DROP INDEX "frecuencias_habilitadas_tenantId_idx";

-- DropIndex
DROP INDEX "paradas_frecuencia_tenantId_frecuenciaId_ciudadId_key";

-- DropIndex
DROP INDEX "paradas_frecuencia_tenantId_idx";

-- DropIndex
DROP INDEX "pisos_bus_tenantId_idx";

-- DropIndex
DROP INDEX "precios_tramos_tenantId_frecuenciaId_ciudadOrigenId_ciudadD_key";

-- DropIndex
DROP INDEX "precios_tramos_tenantId_idx";

-- DropIndex
DROP INDEX "registros_abordaje_tenantId_idx";

-- DropIndex
DROP INDEX "usuarios_cedula_key";

-- AlterTable
ALTER TABLE "asientos" DROP COLUMN "busId",
DROP COLUMN "tenantId";

-- AlterTable
ALTER TABLE "boletos" DROP COLUMN "pasajeroId",
ADD COLUMN     "clienteId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "caracteristicas_bus" DROP COLUMN "tenantId";

-- AlterTable
ALTER TABLE "frecuencias_habilitadas" DROP COLUMN "tenantId";

-- AlterTable
ALTER TABLE "paradas_frecuencia" DROP COLUMN "tenantId";

-- AlterTable
ALTER TABLE "pisos_bus" DROP COLUMN "tenantId";

-- AlterTable
ALTER TABLE "precios_tramos" DROP COLUMN "tenantId";

-- AlterTable
ALTER TABLE "registros_abordaje" DROP COLUMN "tenantId";

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "apellidos",
DROP COLUMN "cedula",
DROP COLUMN "esDiscapacitado",
DROP COLUMN "fechaNacimiento",
DROP COLUMN "nombres",
DROP COLUMN "porcentajeDiscapacidad",
DROP COLUMN "telefono";

-- DropTable
DROP TABLE "informacion_pasajeros";

-- CreateTable
CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "tipoDocumento" TEXT NOT NULL DEFAULT 'CEDULA',
    "numeroDocumento" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "fechaNacimiento" TIMESTAMP(3),
    "esDiscapacitado" BOOLEAN NOT NULL DEFAULT false,
    "porcentajeDiscapacidad" DECIMAL(5,2),
    "usuarioId" INTEGER,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimaActualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clientes_usuarioId_key" ON "clientes"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_tipoDocumento_numeroDocumento_key" ON "clientes"("tipoDocumento", "numeroDocumento");

-- CreateIndex
CREATE UNIQUE INDEX "asientos_pisoBusId_numero_key" ON "asientos"("pisoBusId", "numero");

-- CreateIndex
CREATE INDEX "boletos_fechaViaje_estado_idx" ON "boletos"("fechaViaje", "estado");

-- CreateIndex
CREATE INDEX "boletos_clienteId_fechaViaje_idx" ON "boletos"("clienteId", "fechaViaje");

-- CreateIndex
CREATE UNIQUE INDEX "paradas_frecuencia_frecuenciaId_ciudadId_key" ON "paradas_frecuencia"("frecuenciaId", "ciudadId");

-- CreateIndex
CREATE UNIQUE INDEX "precios_tramos_frecuenciaId_ciudadOrigenId_ciudadDestinoId_key" ON "precios_tramos"("frecuenciaId", "ciudadOrigenId", "ciudadDestinoId");

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boletos" ADD CONSTRAINT "boletos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
