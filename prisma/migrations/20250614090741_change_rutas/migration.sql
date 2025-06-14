/*
  Warnings:

  - You are about to drop the column `ciudadDestinoId` on the `rutas` table. All the data in the column will be lost.
  - You are about to drop the column `ciudadOrigenId` on the `rutas` table. All the data in the column will be lost.
  - You are about to drop the column `distanciaTotal` on the `rutas` table. All the data in the column will be lost.
  - You are about to drop the column `duracionTotal` on the `rutas` table. All the data in the column will be lost.
  - You are about to drop the column `fechaCreacion` on the `rutas` table. All the data in the column will be lost.
  - You are about to drop the column `precioCompleto` on the `rutas` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "rutas" DROP CONSTRAINT "rutas_ciudadDestinoId_fkey";

-- DropForeignKey
ALTER TABLE "rutas" DROP CONSTRAINT "rutas_ciudadOrigenId_fkey";

-- DropIndex
DROP INDEX "rutas_tenantId_ciudadOrigenId_ciudadDestinoId_idx";

-- AlterTable
ALTER TABLE "rutas" DROP COLUMN "ciudadDestinoId",
DROP COLUMN "ciudadOrigenId",
DROP COLUMN "distanciaTotal",
DROP COLUMN "duracionTotal",
DROP COLUMN "fechaCreacion",
DROP COLUMN "precioCompleto";

-- CreateIndex
CREATE INDEX "rutas_tenantId_idx" ON "rutas"("tenantId");
