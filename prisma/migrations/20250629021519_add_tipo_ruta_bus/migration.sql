/*
  Warnings:

  - You are about to drop the `tipos_ruta_buse` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "buses" DROP CONSTRAINT "buses_tipoRutaBusId_fkey";

-- DropForeignKey
ALTER TABLE "rutas" DROP CONSTRAINT "rutas_tipoRutaBusId_fkey";

-- DropForeignKey
ALTER TABLE "tipos_ruta_buse" DROP CONSTRAINT "tipos_ruta_buse_tenantId_fkey";

-- DropTable
DROP TABLE "tipos_ruta_buse";

-- CreateTable
CREATE TABLE "tipos_ruta_bus" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "tipos_ruta_bus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tipos_ruta_bus_tenantId_idx" ON "tipos_ruta_bus"("tenantId");

-- AddForeignKey
ALTER TABLE "tipos_ruta_bus" ADD CONSTRAINT "tipos_ruta_bus_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buses" ADD CONSTRAINT "buses_tipoRutaBusId_fkey" FOREIGN KEY ("tipoRutaBusId") REFERENCES "tipos_ruta_bus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rutas" ADD CONSTRAINT "rutas_tipoRutaBusId_fkey" FOREIGN KEY ("tipoRutaBusId") REFERENCES "tipos_ruta_bus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
