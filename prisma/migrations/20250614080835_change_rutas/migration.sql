/*
  Warnings:

  - You are about to drop the column `segmentoFinId` on the `boletos` table. All the data in the column will be lost.
  - You are about to drop the column `segmentoInicioId` on the `boletos` table. All the data in the column will be lost.
  - You are about to drop the column `hojaId` on the `ventas` table. All the data in the column will be lost.
  - You are about to drop the `hoja_trabajo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `horarios` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `programaciones` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `segmentos` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `paradaDestinoId` to the `boletos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paradaOrigenId` to the `boletos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `viajeId` to the `boletos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ciudadDestinoId` to the `rutas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ciudadOrigenId` to the `rutas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duracionTotal` to the `rutas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `precioCompleto` to the `rutas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `viajeId` to the `ventas` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EstadoViaje" AS ENUM ('PROGRAMADO', 'EN_RUTA', 'COMPLETADO', 'CANCELADO', 'RETRASADO');

-- DropForeignKey
ALTER TABLE "boletos" DROP CONSTRAINT "boletos_segmentoFinId_fkey";

-- DropForeignKey
ALTER TABLE "boletos" DROP CONSTRAINT "boletos_segmentoInicioId_fkey";

-- DropForeignKey
ALTER TABLE "hoja_trabajo" DROP CONSTRAINT "hoja_trabajo_ayudanteId_fkey";

-- DropForeignKey
ALTER TABLE "hoja_trabajo" DROP CONSTRAINT "hoja_trabajo_busId_fkey";

-- DropForeignKey
ALTER TABLE "hoja_trabajo" DROP CONSTRAINT "hoja_trabajo_conductorId_fkey";

-- DropForeignKey
ALTER TABLE "hoja_trabajo" DROP CONSTRAINT "hoja_trabajo_programacionId_fkey";

-- DropForeignKey
ALTER TABLE "hoja_trabajo" DROP CONSTRAINT "hoja_trabajo_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "horarios" DROP CONSTRAINT "horarios_programacionId_fkey";

-- DropForeignKey
ALTER TABLE "horarios" DROP CONSTRAINT "horarios_segmentoId_fkey";

-- DropForeignKey
ALTER TABLE "programaciones" DROP CONSTRAINT "programaciones_rutaId_fkey";

-- DropForeignKey
ALTER TABLE "segmentos" DROP CONSTRAINT "segmentos_ciudadDestinoId_fkey";

-- DropForeignKey
ALTER TABLE "segmentos" DROP CONSTRAINT "segmentos_ciudadOrigenId_fkey";

-- DropForeignKey
ALTER TABLE "segmentos" DROP CONSTRAINT "segmentos_rutaId_fkey";

-- DropForeignKey
ALTER TABLE "ventas" DROP CONSTRAINT "ventas_hojaId_fkey";

-- DropIndex
DROP INDEX "rutas_tenantId_idx";

-- AlterTable
ALTER TABLE "boletos" DROP COLUMN "segmentoFinId",
DROP COLUMN "segmentoInicioId",
ADD COLUMN     "paradaDestinoId" INTEGER NOT NULL,
ADD COLUMN     "paradaOrigenId" INTEGER NOT NULL,
ADD COLUMN     "viajeId" INTEGER NOT NULL,
ALTER COLUMN "horaSalida" SET DATA TYPE TIME;

-- AlterTable
ALTER TABLE "rutas" ADD COLUMN     "ciudadDestinoId" INTEGER NOT NULL,
ADD COLUMN     "ciudadOrigenId" INTEGER NOT NULL,
ADD COLUMN     "distanciaTotal" DECIMAL(10,2),
ADD COLUMN     "duracionTotal" INTEGER NOT NULL,
ADD COLUMN     "precioCompleto" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "ventas" DROP COLUMN "hojaId",
ADD COLUMN     "viajeId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "hoja_trabajo";

-- DropTable
DROP TABLE "horarios";

-- DropTable
DROP TABLE "programaciones";

-- DropTable
DROP TABLE "segmentos";

-- DropEnum
DROP TYPE "EstadoHojaTrabajo";

-- CreateTable
CREATE TABLE "paradas_ruta" (
    "id" SERIAL NOT NULL,
    "rutaId" INTEGER NOT NULL,
    "ciudadId" INTEGER NOT NULL,
    "orden" INTEGER NOT NULL,
    "distanciaAcumulada" DECIMAL(10,2),
    "tiempoAcumulado" INTEGER NOT NULL,
    "precioAcumulado" DECIMAL(10,2) NOT NULL,
    "esParadaObligatoria" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "paradas_ruta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "horarios_ruta" (
    "id" SERIAL NOT NULL,
    "rutaId" INTEGER NOT NULL,
    "horaSalida" TIME NOT NULL,
    "diasSemana" TEXT NOT NULL,
    "tipoViaje" "TipoViaje" NOT NULL DEFAULT 'CON_PARADAS',
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "horarios_ruta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "viajes" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "rutaId" INTEGER NOT NULL,
    "horarioRutaId" INTEGER NOT NULL,
    "busId" INTEGER NOT NULL,
    "conductorId" INTEGER,
    "ayudanteId" INTEGER,
    "fecha" DATE NOT NULL,
    "horaSalidaReal" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoViaje" NOT NULL DEFAULT 'PROGRAMADO',
    "observaciones" TEXT,
    "capacidadTotal" INTEGER NOT NULL,
    "asientosOcupados" INTEGER NOT NULL DEFAULT 0,
    "generacion" "TipoGeneracion" NOT NULL DEFAULT 'AUTOMATICA',

    CONSTRAINT "viajes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ocupacion_asientos" (
    "id" SERIAL NOT NULL,
    "viajeId" INTEGER NOT NULL,
    "asientoId" INTEGER NOT NULL,
    "paradaOrigenId" INTEGER NOT NULL,
    "paradaDestinoId" INTEGER NOT NULL,
    "boletoId" INTEGER NOT NULL,

    CONSTRAINT "ocupacion_asientos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "paradas_ruta_rutaId_orden_idx" ON "paradas_ruta"("rutaId", "orden");

-- CreateIndex
CREATE UNIQUE INDEX "paradas_ruta_rutaId_orden_key" ON "paradas_ruta"("rutaId", "orden");

-- CreateIndex
CREATE UNIQUE INDEX "paradas_ruta_rutaId_ciudadId_key" ON "paradas_ruta"("rutaId", "ciudadId");

-- CreateIndex
CREATE INDEX "viajes_tenantId_fecha_estado_idx" ON "viajes"("tenantId", "fecha", "estado");

-- CreateIndex
CREATE INDEX "viajes_fecha_rutaId_estado_idx" ON "viajes"("fecha", "rutaId", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "viajes_rutaId_fecha_horarioRutaId_busId_key" ON "viajes"("rutaId", "fecha", "horarioRutaId", "busId");

-- CreateIndex
CREATE INDEX "ocupacion_asientos_viajeId_paradaOrigenId_paradaDestinoId_idx" ON "ocupacion_asientos"("viajeId", "paradaOrigenId", "paradaDestinoId");

-- CreateIndex
CREATE UNIQUE INDEX "ocupacion_asientos_viajeId_asientoId_paradaOrigenId_paradaD_key" ON "ocupacion_asientos"("viajeId", "asientoId", "paradaOrigenId", "paradaDestinoId");

-- CreateIndex
CREATE INDEX "boletos_viajeId_paradaOrigenId_paradaDestinoId_idx" ON "boletos"("viajeId", "paradaOrigenId", "paradaDestinoId");

-- CreateIndex
CREATE INDEX "rutas_tenantId_ciudadOrigenId_ciudadDestinoId_idx" ON "rutas"("tenantId", "ciudadOrigenId", "ciudadDestinoId");

-- CreateIndex
CREATE INDEX "ventas_viajeId_estadoPago_idx" ON "ventas"("viajeId", "estadoPago");

-- AddForeignKey
ALTER TABLE "rutas" ADD CONSTRAINT "rutas_ciudadOrigenId_fkey" FOREIGN KEY ("ciudadOrigenId") REFERENCES "ciudades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rutas" ADD CONSTRAINT "rutas_ciudadDestinoId_fkey" FOREIGN KEY ("ciudadDestinoId") REFERENCES "ciudades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paradas_ruta" ADD CONSTRAINT "paradas_ruta_rutaId_fkey" FOREIGN KEY ("rutaId") REFERENCES "rutas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paradas_ruta" ADD CONSTRAINT "paradas_ruta_ciudadId_fkey" FOREIGN KEY ("ciudadId") REFERENCES "ciudades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horarios_ruta" ADD CONSTRAINT "horarios_ruta_rutaId_fkey" FOREIGN KEY ("rutaId") REFERENCES "rutas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viajes" ADD CONSTRAINT "viajes_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viajes" ADD CONSTRAINT "viajes_rutaId_fkey" FOREIGN KEY ("rutaId") REFERENCES "rutas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viajes" ADD CONSTRAINT "viajes_horarioRutaId_fkey" FOREIGN KEY ("horarioRutaId") REFERENCES "horarios_ruta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viajes" ADD CONSTRAINT "viajes_busId_fkey" FOREIGN KEY ("busId") REFERENCES "buses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viajes" ADD CONSTRAINT "viajes_conductorId_fkey" FOREIGN KEY ("conductorId") REFERENCES "usuarios_tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viajes" ADD CONSTRAINT "viajes_ayudanteId_fkey" FOREIGN KEY ("ayudanteId") REFERENCES "usuarios_tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ocupacion_asientos" ADD CONSTRAINT "ocupacion_asientos_viajeId_fkey" FOREIGN KEY ("viajeId") REFERENCES "viajes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ocupacion_asientos" ADD CONSTRAINT "ocupacion_asientos_asientoId_fkey" FOREIGN KEY ("asientoId") REFERENCES "asientos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ocupacion_asientos" ADD CONSTRAINT "ocupacion_asientos_paradaOrigenId_fkey" FOREIGN KEY ("paradaOrigenId") REFERENCES "paradas_ruta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ocupacion_asientos" ADD CONSTRAINT "ocupacion_asientos_paradaDestinoId_fkey" FOREIGN KEY ("paradaDestinoId") REFERENCES "paradas_ruta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ocupacion_asientos" ADD CONSTRAINT "ocupacion_asientos_boletoId_fkey" FOREIGN KEY ("boletoId") REFERENCES "boletos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_viajeId_fkey" FOREIGN KEY ("viajeId") REFERENCES "viajes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boletos" ADD CONSTRAINT "boletos_viajeId_fkey" FOREIGN KEY ("viajeId") REFERENCES "viajes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boletos" ADD CONSTRAINT "boletos_paradaOrigenId_fkey" FOREIGN KEY ("paradaOrigenId") REFERENCES "paradas_ruta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boletos" ADD CONSTRAINT "boletos_paradaDestinoId_fkey" FOREIGN KEY ("paradaDestinoId") REFERENCES "paradas_ruta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
