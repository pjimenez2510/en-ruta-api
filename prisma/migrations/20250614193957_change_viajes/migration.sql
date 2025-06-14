/*
  Warnings:

  - You are about to drop the column `dispositivoInfo` on the `registros_abordaje` table. All the data in the column will be lost.
  - You are about to drop the column `latitud` on the `registros_abordaje` table. All the data in the column will be lost.
  - You are about to drop the column `longitud` on the `registros_abordaje` table. All the data in the column will be lost.
  - You are about to drop the column `metodo` on the `registros_abordaje` table. All the data in the column will be lost.
  - You are about to drop the column `codigoTransaccion` on the `ventas` table. All the data in the column will be lost.
  - You are about to drop the column `comprobanteUrl` on the `ventas` table. All the data in the column will be lost.
  - You are about to drop the column `dispositivoInfo` on the `ventas` table. All the data in the column will be lost.
  - You are about to drop the column `ipCompra` on the `ventas` table. All the data in the column will be lost.
  - You are about to drop the column `notas` on the `ventas` table. All the data in the column will be lost.
  - You are about to drop the column `origenVenta` on the `ventas` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "EstadoAbordaje" AS ENUM ('PENDIENTE', 'ABORDADO', 'NO_ABORDADO', 'CANCELADO');

-- AlterTable
ALTER TABLE "registros_abordaje" DROP COLUMN "dispositivoInfo",
DROP COLUMN "latitud",
DROP COLUMN "longitud",
DROP COLUMN "metodo",
ADD COLUMN     "estadoAbordaje" "EstadoAbordaje" NOT NULL DEFAULT 'PENDIENTE';

-- AlterTable
ALTER TABLE "ventas" DROP COLUMN "codigoTransaccion",
DROP COLUMN "comprobanteUrl",
DROP COLUMN "dispositivoInfo",
DROP COLUMN "ipCompra",
DROP COLUMN "notas",
DROP COLUMN "origenVenta";

-- DropEnum
DROP TYPE "MetodoAbordaje";

-- DropEnum
DROP TYPE "OrigenVenta";
