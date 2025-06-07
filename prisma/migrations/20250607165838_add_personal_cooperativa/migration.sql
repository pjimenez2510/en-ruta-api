-- CreateTable
CREATE TABLE "personal_cooperativa" (
    "id" SERIAL NOT NULL,
    "usuarioTenantId" INTEGER NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "tipoDocumento" "TipoDocumento" NOT NULL DEFAULT 'CEDULA',
    "numeroDocumento" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "fechaNacimiento" TIMESTAMP(3),
    "direccion" TEXT,
    "ciudadResidencia" TEXT,
    "genero" TEXT,
    "fotoPerfil" TEXT,
    "licenciaConducir" TEXT,
    "tipoLicencia" TEXT,
    "fechaExpiracionLicencia" TIMESTAMP(3),
    "fechaContratacion" TIMESTAMP(3),
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimaActualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "personal_cooperativa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "personal_cooperativa_usuarioTenantId_key" ON "personal_cooperativa"("usuarioTenantId");

-- AddForeignKey
ALTER TABLE "personal_cooperativa" ADD CONSTRAINT "personal_cooperativa_usuarioTenantId_fkey" FOREIGN KEY ("usuarioTenantId") REFERENCES "usuarios_tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
