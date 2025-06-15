/*
  Warnings:

  - You are about to drop the column `rutaId` on the `viajes` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[horarioRutaId,fecha,busId]` on the table `viajes` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "viajes" DROP CONSTRAINT "viajes_rutaId_fkey";

-- DropIndex
DROP INDEX "viajes_fecha_rutaId_estado_idx";

-- DropIndex
DROP INDEX "viajes_rutaId_fecha_horarioRutaId_busId_key";

-- AlterTable
ALTER TABLE "viajes" DROP COLUMN "rutaId";

-- CreateIndex
CREATE INDEX "viajes_fecha_horarioRutaId_estado_idx" ON "viajes"("fecha", "horarioRutaId", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "viajes_horarioRutaId_fecha_busId_key" ON "viajes"("horarioRutaId", "fecha", "busId");
