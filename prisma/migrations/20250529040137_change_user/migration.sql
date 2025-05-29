/*
  Warnings:

  - The `tipoDocumento` column on the `clientes` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `email` on the `usuarios` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `usuarios` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `usuarios` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('CEDULA', 'PASAPORTE', 'NIT');

-- DropIndex
DROP INDEX "usuarios_email_key";

-- AlterTable
ALTER TABLE "clientes" DROP COLUMN "tipoDocumento",
ADD COLUMN     "tipoDocumento" "TipoDocumento" NOT NULL DEFAULT 'CEDULA';

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "email",
ADD COLUMN     "username" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "clientes_tipoDocumento_numeroDocumento_key" ON "clientes"("tipoDocumento", "numeroDocumento");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_username_key" ON "usuarios"("username");
