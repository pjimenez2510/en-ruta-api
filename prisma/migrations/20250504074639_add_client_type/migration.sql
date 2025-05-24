/*
  Warnings:

  - The values [ADMIN_SISTEMA,CLIENTE] on the enum `RolUsuario` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('CLIENTE', 'ADMIN_SISTEMA', 'PERSONAL_COOPERATIVA');

-- AlterEnum
BEGIN;
CREATE TYPE "RolUsuario_new" AS ENUM ('ADMIN_COOPERATIVA', 'OFICINISTA', 'CONDUCTOR', 'AYUDANTE');
ALTER TABLE "usuarios_tenants" ALTER COLUMN "rol" TYPE "RolUsuario_new" USING ("rol"::text::"RolUsuario_new");
ALTER TYPE "RolUsuario" RENAME TO "RolUsuario_old";
ALTER TYPE "RolUsuario_new" RENAME TO "RolUsuario";
DROP TYPE "RolUsuario_old";
COMMIT;

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "tipoUsuario" "TipoUsuario" NOT NULL DEFAULT 'CLIENTE';
