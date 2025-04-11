/*
  Warnings:

  - You are about to drop the `permisos_usuario` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "permisos_usuario" DROP CONSTRAINT "permisos_usuario_usuarioTenantId_fkey";

-- DropTable
DROP TABLE "permisos_usuario";

-- AddForeignKey
ALTER TABLE "frecuencias_asignadas" ADD CONSTRAINT "frecuencias_asignadas_resolucionId_fkey" FOREIGN KEY ("resolucionId") REFERENCES "resoluciones_ant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "frecuencias_asignadas" ADD CONSTRAINT "frecuencias_asignadas_ciudadOrigenId_fkey" FOREIGN KEY ("ciudadOrigenId") REFERENCES "ciudades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "frecuencias_asignadas" ADD CONSTRAINT "frecuencias_asignadas_ciudadDestinoId_fkey" FOREIGN KEY ("ciudadDestinoId") REFERENCES "ciudades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paradas_frecuencia" ADD CONSTRAINT "paradas_frecuencia_ciudadId_fkey" FOREIGN KEY ("ciudadId") REFERENCES "ciudades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "precios_tramos" ADD CONSTRAINT "precios_tramos_ciudadOrigenId_fkey" FOREIGN KEY ("ciudadOrigenId") REFERENCES "ciudades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "precios_tramos" ADD CONSTRAINT "precios_tramos_ciudadDestinoId_fkey" FOREIGN KEY ("ciudadDestinoId") REFERENCES "ciudades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hoja_trabajo" ADD CONSTRAINT "hoja_trabajo_conductorId_fkey" FOREIGN KEY ("conductorId") REFERENCES "usuarios_tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hoja_trabajo" ADD CONSTRAINT "hoja_trabajo_ayudanteId_fkey" FOREIGN KEY ("ayudanteId") REFERENCES "usuarios_tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boletos" ADD CONSTRAINT "boletos_ciudadOrigenId_fkey" FOREIGN KEY ("ciudadOrigenId") REFERENCES "ciudades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boletos" ADD CONSTRAINT "boletos_ciudadDestinoId_fkey" FOREIGN KEY ("ciudadDestinoId") REFERENCES "ciudades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
