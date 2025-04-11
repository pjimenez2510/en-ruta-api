/*
  Warnings:

  - You are about to drop the `precios_tipo_asiento` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "precios_tipo_asiento" DROP CONSTRAINT "precios_tipo_asiento_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "precios_tipo_asiento" DROP CONSTRAINT "precios_tipo_asiento_tipoAsientoId_fkey";

-- DropTable
DROP TABLE "precios_tipo_asiento";
