// prisma/seeds/tenants.seed.ts
import { PrismaClient, TipoUsuario } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedTenants(prisma: PrismaClient) {
  // Crear usuario administrador del sistema
  const adminSistema = await prisma.usuario.create({
    data: {
      username: 'admin',
      passwordHash: bcrypt.hashSync('admin', 10),
      tipoUsuario: TipoUsuario.ADMIN_SISTEMA,
    },
  });

  // Crear tenants (cooperativas)
  const tenants = await Promise.all([
    prisma.tenant.create({
      data: {
        nombre: 'Cooperativa Flota Pelileo',
        identificador: 'flota-pelileo',
        logoUrl: 'https://example.com/logo-pelileo.png',
        colorPrimario: '#1E40AF',
        colorSecundario: '#F59E0B',
        sitioWeb: 'https://flotapelileo.com',
        emailContacto: 'info@flotapelileo.com',
        telefono: '+593987654321',
      },
    }),
    prisma.tenant.create({
      data: {
        nombre: 'Transportes Baños',
        identificador: 'transportes-banos',
        logoUrl: 'https://example.com/logo-banos.png',
        colorPrimario: '#059669',
        colorSecundario: '#DC2626',
        sitioWeb: 'https://transportesbanos.com',
        emailContacto: 'contacto@transportesbanos.com',
        telefono: '+593987654322',
      },
    }),
    prisma.tenant.create({
      data: {
        nombre: 'Expreso Riobamba',
        identificador: 'expreso-riobamba',
        logoUrl: 'https://example.com/logo-riobamba.png',
        colorPrimario: '#7C2D12',
        colorSecundario: '#F97316',
        sitioWeb: 'https://expresoriobamba.com',
        emailContacto: 'ventas@expresoriobamba.com',
        telefono: '+593987654323',
      },
    }),
  ]);

  return { adminSistema, tenants };
}