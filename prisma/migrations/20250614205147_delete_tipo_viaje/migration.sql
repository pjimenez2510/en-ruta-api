/*
  Warnings:

  - You are about to drop the column `tipoViaje` on the `horarios_ruta` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "horarios_ruta" DROP COLUMN "tipoViaje";

-- DropEnum
DROP TYPE "TipoViaje";
