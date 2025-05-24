/*
  Warnings:

  - You are about to drop the column `ciudadDestinoId` on the `boletos` table. All the data in the column will be lost.
  - You are about to drop the column `ciudadOrigenId` on the `boletos` table. All the data in the column will be lost.
  - You are about to drop the column `frecuenciaHabilitadaId` on the `hoja_trabajo` table. All the data in the column will be lost.
  - You are about to drop the `frecuencias_asignadas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `frecuencias_habilitadas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `paradas_frecuencia` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `precios_tramos` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[tenantId,fecha,programacionId]` on the table `hoja_trabajo` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `segmentoFinId` to the `boletos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `segmentoInicioId` to the `boletos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `programacionId` to the `hoja_trabajo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "boletos" DROP CONSTRAINT "boletos_ciudadDestinoId_fkey";

-- DropForeignKey
ALTER TABLE "boletos" DROP CONSTRAINT "boletos_ciudadOrigenId_fkey";

-- DropForeignKey
ALTER TABLE "frecuencias_asignadas" DROP CONSTRAINT "frecuencias_asignadas_ciudadDestinoId_fkey";

-- DropForeignKey
ALTER TABLE "frecuencias_asignadas" DROP CONSTRAINT "frecuencias_asignadas_ciudadOrigenId_fkey";

-- DropForeignKey
ALTER TABLE "frecuencias_asignadas" DROP CONSTRAINT "frecuencias_asignadas_resolucionId_fkey";

-- DropForeignKey
ALTER TABLE "frecuencias_asignadas" DROP CONSTRAINT "frecuencias_asignadas_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "frecuencias_habilitadas" DROP CONSTRAINT "frecuencias_habilitadas_frecuenciaId_fkey";

-- DropForeignKey
ALTER TABLE "hoja_trabajo" DROP CONSTRAINT "hoja_trabajo_frecuenciaHabilitadaId_fkey";

-- DropForeignKey
ALTER TABLE "paradas_frecuencia" DROP CONSTRAINT "paradas_frecuencia_ciudadId_fkey";

-- DropForeignKey
ALTER TABLE "paradas_frecuencia" DROP CONSTRAINT "paradas_frecuencia_frecuenciaId_fkey";

-- DropForeignKey
ALTER TABLE "precios_tramos" DROP CONSTRAINT "precios_tramos_ciudadDestinoId_fkey";

-- DropForeignKey
ALTER TABLE "precios_tramos" DROP CONSTRAINT "precios_tramos_ciudadOrigenId_fkey";

-- DropForeignKey
ALTER TABLE "precios_tramos" DROP CONSTRAINT "precios_tramos_frecuenciaId_fkey";

-- DropIndex
DROP INDEX "hoja_trabajo_tenantId_fecha_frecuenciaHabilitadaId_key";

-- AlterTable
ALTER TABLE "boletos" DROP COLUMN "ciudadDestinoId",
DROP COLUMN "ciudadOrigenId",
ADD COLUMN     "segmentoFinId" INTEGER NOT NULL,
ADD COLUMN     "segmentoInicioId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "hoja_trabajo" DROP COLUMN "frecuenciaHabilitadaId",
ADD COLUMN     "programacionId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "frecuencias_asignadas";

-- DropTable
DROP TABLE "frecuencias_habilitadas";

-- DropTable
DROP TABLE "paradas_frecuencia";

-- DropTable
DROP TABLE "precios_tramos";

-- CreateTable
CREATE TABLE "rutas" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "resolucionId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rutas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "segmentos" (
    "id" SERIAL NOT NULL,
    "rutaId" INTEGER NOT NULL,
    "ordenSegmento" INTEGER NOT NULL,
    "ciudadOrigenId" INTEGER NOT NULL,
    "ciudadDestinoId" INTEGER NOT NULL,
    "distancia" DECIMAL(10,2),
    "duracion" INTEGER NOT NULL,
    "precioBase" DECIMAL(10,2) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "segmentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programaciones" (
    "id" SERIAL NOT NULL,
    "rutaId" INTEGER NOT NULL,
    "horaSalida" TIMESTAMP(3) NOT NULL,
    "diasOperacion" TEXT NOT NULL,
    "tipoViaje" "TipoViaje" NOT NULL DEFAULT 'CON_PARADAS',
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "programaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "horarios" (
    "id" SERIAL NOT NULL,
    "programacionId" INTEGER NOT NULL,
    "segmentoId" INTEGER NOT NULL,
    "horaLlegadaOrigen" TIMESTAMP(3) NOT NULL,
    "horaSalidaOrigen" TIMESTAMP(3) NOT NULL,
    "horaLlegadaDestino" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "horarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rutas_tenantId_idx" ON "rutas"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "rutas_tenantId_nombre_key" ON "rutas"("tenantId", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "segmentos_rutaId_ordenSegmento_key" ON "segmentos"("rutaId", "ordenSegmento");

-- CreateIndex
CREATE UNIQUE INDEX "segmentos_rutaId_ciudadOrigenId_ciudadDestinoId_key" ON "segmentos"("rutaId", "ciudadOrigenId", "ciudadDestinoId");

-- CreateIndex
CREATE UNIQUE INDEX "horarios_programacionId_segmentoId_key" ON "horarios"("programacionId", "segmentoId");

-- CreateIndex
CREATE UNIQUE INDEX "hoja_trabajo_tenantId_fecha_programacionId_key" ON "hoja_trabajo"("tenantId", "fecha", "programacionId");

-- AddForeignKey
ALTER TABLE "rutas" ADD CONSTRAINT "rutas_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rutas" ADD CONSTRAINT "rutas_resolucionId_fkey" FOREIGN KEY ("resolucionId") REFERENCES "resoluciones_ant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "segmentos" ADD CONSTRAINT "segmentos_rutaId_fkey" FOREIGN KEY ("rutaId") REFERENCES "rutas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "segmentos" ADD CONSTRAINT "segmentos_ciudadOrigenId_fkey" FOREIGN KEY ("ciudadOrigenId") REFERENCES "ciudades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "segmentos" ADD CONSTRAINT "segmentos_ciudadDestinoId_fkey" FOREIGN KEY ("ciudadDestinoId") REFERENCES "ciudades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programaciones" ADD CONSTRAINT "programaciones_rutaId_fkey" FOREIGN KEY ("rutaId") REFERENCES "rutas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horarios" ADD CONSTRAINT "horarios_programacionId_fkey" FOREIGN KEY ("programacionId") REFERENCES "programaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "horarios" ADD CONSTRAINT "horarios_segmentoId_fkey" FOREIGN KEY ("segmentoId") REFERENCES "segmentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hoja_trabajo" ADD CONSTRAINT "hoja_trabajo_programacionId_fkey" FOREIGN KEY ("programacionId") REFERENCES "programaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boletos" ADD CONSTRAINT "boletos_segmentoInicioId_fkey" FOREIGN KEY ("segmentoInicioId") REFERENCES "segmentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boletos" ADD CONSTRAINT "boletos_segmentoFinId_fkey" FOREIGN KEY ("segmentoFinId") REFERENCES "segmentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
