// prisma/seeds/usuarios.seed.ts
import { PrismaClient, TipoUsuario, RolUsuario, TipoDocumento } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export async function seedUsuarios(prisma: PrismaClient, tenants: any[]) {
  // Crear usuarios del personal para cada tenant
  const usuariosPersonal = [];
  const usuariosTenant = [];

  // Para cada cooperativa, crear usuarios con diferentes roles
  for (let tenantIndex = 0; tenantIndex < tenants.length; tenantIndex++) {
    const tenant = tenants[tenantIndex];
    const tenantName = tenant.identificador.split('-')[0]; // flota, transportes, expreso

    // 1 Admin por cooperativa
    const adminUser = await prisma.usuario.create({
      data: {
        username: `admin.${tenantName}`,
        passwordHash: bcrypt.hashSync('password123', 10),
        tipoUsuario: TipoUsuario.PERSONAL_COOPERATIVA,
      },
    });
    usuariosPersonal.push(adminUser);

    const adminTenant = await prisma.usuarioTenant.create({
      data: {
        usuarioId: adminUser.id,
        tenantId: tenant.id,
        rol: RolUsuario.ADMIN_COOPERATIVA,
      },
    });
    usuariosTenant.push(adminTenant);

    // 2 Oficinistas por cooperativa
    for (let i = 1; i <= 2; i++) {
      const oficinistaUser = await prisma.usuario.create({
        data: {
          username: `oficinista${i}.${tenantName}`,
          passwordHash: bcrypt.hashSync('password123', 10),
          tipoUsuario: TipoUsuario.PERSONAL_COOPERATIVA,
        },
      });
      usuariosPersonal.push(oficinistaUser);

      const oficinistaTenant = await prisma.usuarioTenant.create({
        data: {
          usuarioId: oficinistaUser.id,
          tenantId: tenant.id,
          rol: RolUsuario.OFICINISTA,
        },
      });
      usuariosTenant.push(oficinistaTenant);
    }

    // 10 Conductores por cooperativa
    const conductorNames = [
      'Juan', 'Carlos', 'Luis', 'Miguel', 'Roberto', 
      'Pedro', 'Jorge', 'Francisco', 'Rafael', 'Antonio'
    ];
    
    for (let i = 0; i < 10; i++) {
      const conductorUser = await prisma.usuario.create({
        data: {
          username: `${conductorNames[i].toLowerCase()}.conductor.${tenantName}`,
          passwordHash: bcrypt.hashSync('password123', 10),
          tipoUsuario: TipoUsuario.PERSONAL_COOPERATIVA,
        },
      });
      usuariosPersonal.push(conductorUser);

      const conductorTenant = await prisma.usuarioTenant.create({
        data: {
          usuarioId: conductorUser.id,
          tenantId: tenant.id,
          rol: RolUsuario.CONDUCTOR,
        },
      });
      usuariosTenant.push(conductorTenant);
    }

    // 10 Ayudantes por cooperativa
    const ayudanteNames = [
      'David', 'Andrés', 'Sebastián', 'Mario', 'Daniel',
      'Cristian', 'Eduardo', 'Patricio', 'Rodrigo', 'Héctor'
    ];
    
    for (let i = 0; i < 10; i++) {
      const ayudanteUser = await prisma.usuario.create({
        data: {
          username: `${ayudanteNames[i].toLowerCase()}.ayudante.${tenantName}`,
          passwordHash: bcrypt.hashSync('password123', 10),
          tipoUsuario: TipoUsuario.PERSONAL_COOPERATIVA,
        },
      });
      usuariosPersonal.push(ayudanteUser);

      const ayudanteTenant = await prisma.usuarioTenant.create({
        data: {
          usuarioId: ayudanteUser.id,
          tenantId: tenant.id,
          rol: RolUsuario.AYUDANTE,
        },
      });
      usuariosTenant.push(ayudanteTenant);
    }
  }

  // Crear información personal para algunos usuarios (ejemplo para los admins y algunos conductores)
  const personalInfo = [
    // Admins
    {
      usuarioTenantId: usuariosTenant[0].id, // Admin Flota Pelileo
      nombres: 'Miguel Antonio',
      apellidos: 'Pérez González',
      tipoDocumento: TipoDocumento.CEDULA,
      numeroDocumento: '1804567890',
      telefono: '+593987123456',
      email: 'miguel.perez@flotapelileo.com',
      fechaNacimiento: new Date('1980-05-15'),
      direccion: 'Av. Amazonas 123, Pelileo',
      ciudadResidencia: 'Pelileo',
      genero: 'M',
      fechaContratacion: new Date('2020-01-01'),
    },
    {
      usuarioTenantId: usuariosTenant[13].id, // Admin Transportes Baños
      nombres: 'Ana María',
      apellidos: 'Rodríguez Vásquez',
      tipoDocumento: TipoDocumento.CEDULA,
      numeroDocumento: '1804567891',
      telefono: '+593987123457',
      email: 'ana.rodriguez@transportesbanos.com',
      fechaNacimiento: new Date('1982-08-22'),
      direccion: 'Calle Bolívar 456, Baños',
      ciudadResidencia: 'Baños',
      genero: 'F',
      fechaContratacion: new Date('2019-03-01'),
    },
    {
      usuarioTenantId: usuariosTenant[26].id, // Admin Expreso Riobamba
      nombres: 'Carlos Eduardo',
      apellidos: 'Morales Castro',
      tipoDocumento: TipoDocumento.CEDULA,
      numeroDocumento: '1804567892',
      telefono: '+593987123458',
      email: 'carlos.morales@expresoriobamba.com',
      fechaNacimiento: new Date('1978-12-10'),
      direccion: 'Av. Los Libertadores 789, Riobamba',
      ciudadResidencia: 'Riobamba',
      genero: 'M',
      fechaContratacion: new Date('2018-06-01'),
    },
    // Algunos conductores con licencias
    {
      usuarioTenantId: usuariosTenant[3].id, // Primer conductor Flota Pelileo
      nombres: 'Juan Carlos',
      apellidos: 'Morales Vásquez',
      tipoDocumento: TipoDocumento.CEDULA,
      numeroDocumento: '1804567893',
      telefono: '+593987123459',
      email: 'juan.morales@flotapelileo.com',
      fechaNacimiento: new Date('1975-08-22'),
      direccion: 'Calle Sucre 321, Pelileo',
      ciudadResidencia: 'Pelileo',
      genero: 'M',
      licenciaConducir: 'C1-123456789',
      tipoLicencia: 'C1',
      fechaExpiracionLicencia: new Date('2025-08-22'),
      fechaContratacion: new Date('2018-03-01'),
    },
    {
      usuarioTenantId: usuariosTenant[16].id, // Primer conductor Transportes Baños
      nombres: 'Carlos Alberto',
      apellidos: 'Jiménez Ruiz',
      tipoDocumento: TipoDocumento.CEDULA,
      numeroDocumento: '1804567894',
      telefono: '+593987123460',
      email: 'carlos.jimenez@transportesbanos.com',
      fechaNacimiento: new Date('1973-11-15'),
      direccion: 'Av. Montalvo 654, Baños',
      ciudadResidencia: 'Baños',
      genero: 'M',
      licenciaConducir: 'C1-987654321',
      tipoLicencia: 'C1',
      fechaExpiracionLicencia: new Date('2026-11-15'),
      fechaContratacion: new Date('2017-09-01'),
    },
  ];

  await prisma.personalCooperativa.createMany({
    data: personalInfo,
  });

  return { usuariosPersonal, usuariosTenant };
}