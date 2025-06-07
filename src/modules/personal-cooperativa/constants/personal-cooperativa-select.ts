import { Prisma } from '@prisma/client';
import { USUARIO_TENANT_SELECT } from 'src/modules/usuario-tenant/constants/usuario-tenant';

export const PERSONAL_COOPERATIVA_SELECT: Prisma.PersonalCooperativaSelect = {
  id: true,
  usuarioTenantId: true,
  nombres: true,
  apellidos: true,
  tipoDocumento: true,
  numeroDocumento: true,
  telefono: true,
  email: true,
  fechaNacimiento: true,
  direccion: true,
  ciudadResidencia: true,
  genero: true,
  fotoPerfil: true,
  licenciaConducir: true,
  tipoLicencia: true,
  fechaExpiracionLicencia: true,
  fechaContratacion: true,
  fechaRegistro: true,
  ultimaActualizacion: true,
  activo: true,
};
