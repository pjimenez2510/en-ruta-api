/*
  Warnings:

  - A unique constraint covering the columns `[pisoBusId,fila,columna]` on the table `asientos` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "asientos_pisoBusId_fila_columna_key" ON "asientos"("pisoBusId", "fila", "columna");
