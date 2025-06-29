/*
  Warnings:

  - Added the required column `tipoRutaBusId` to the `buses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoRutaBusId` to the `rutas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "buses" ADD COLUMN     "tipoRutaBusId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "rutas" ADD COLUMN     "tipoRutaBusId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "tipos_ruta_buse" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "tipos_ruta_buse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tipos_ruta_buse_tenantId_idx" ON "tipos_ruta_buse"("tenantId");

-- AddForeignKey
ALTER TABLE "tipos_ruta_buse" ADD CONSTRAINT "tipos_ruta_buse_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buses" ADD CONSTRAINT "buses_tipoRutaBusId_fkey" FOREIGN KEY ("tipoRutaBusId") REFERENCES "tipos_ruta_buse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rutas" ADD CONSTRAINT "rutas_tipoRutaBusId_fkey" FOREIGN KEY ("tipoRutaBusId") REFERENCES "tipos_ruta_buse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
