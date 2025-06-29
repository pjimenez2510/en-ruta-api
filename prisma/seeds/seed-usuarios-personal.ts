// prisma/seeds/usuarios.seed.ts
import {
  PrismaClient,
  TipoUsuario,
  RolUsuario,
  TipoDocumento,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Función para generar información personal
function generatePersonalInfo(
  usuarioTenantId: number,
  rol: RolUsuario,
  tenantName: string,
  index: number,
  nombre?: string,
) {
  const ciudades = {
    flota: 'Pelileo',
    transportes: 'Baños',
    expreso: 'Riobamba',
  };

  const dominios = {
    flota: 'flotapelileo.com',
    transportes: 'transportesbanos.com',
    expreso: 'expresoriobamba.com',
  };

  const direcciones = {
    flota: [
      'Av. Amazonas',
      'Calle Sucre',
      'Av. Los Andes',
      'Calle Bolívar',
      'Av. El Oro',
    ],
    transportes: [
      'Calle Bolívar',
      'Av. Montalvo',
      'Calle Ambato',
      'Av. Amazonas',
      'Calle Oriente',
    ],
    expreso: [
      'Av. Los Libertadores',
      'Calle Primera Constituyente',
      'Av. Daniel León Borja',
      'Calle Guayaquil',
      'Av. Lizarzaburu',
    ],
  };

  // Nombres y apellidos según el rol
  const nombresPorRol = {
    [RolUsuario.ADMIN_COOPERATIVA]: {
      nombres: [
        'Miguel Antonio',
        'Ana María',
        'Carlos Eduardo',
        'Patricia Elena',
        'Roberto Luis',
      ],
      apellidos: [
        'Pérez González',
        'Rodríguez Vásquez',
        'Morales Castro',
        'Silva Herrera',
        'López Mendoza',
      ],
    },
    [RolUsuario.OFICINISTA]: {
      nombres: [
        'María José',
        'Luis Fernando',
        'Andrea Paola',
        'Jorge Andrés',
        'Cristina Isabel',
      ],
      apellidos: [
        'García Morales',
        'Hernández Silva',
        'Vargas López',
        'Ruiz Pérez',
        'Castillo Torres',
      ],
    },
    [RolUsuario.CONDUCTOR]: {
      nombres: [
        'Juan Carlos',
        'Carlos Alberto',
        'Luis Miguel',
        'Miguel Ángel',
        'Roberto Daniel',
        'Pedro Antonio',
        'Jorge Luis',
        'Francisco Javier',
        'Rafael Eduardo',
        'Antonio José',
      ],
      apellidos: [
        'Morales Vásquez',
        'Jiménez Ruiz',
        'González López',
        'Ramírez Castro',
        'Herrera Silva',
        'Mendoza Torres',
        'Vargas Morales',
        'Cruz Hernández',
        'Sánchez Pérez',
        'Flores García',
      ],
    },
    [RolUsuario.AYUDANTE]: {
      nombres: [
        'David Alexander',
        'Andrés Felipe',
        'Sebastián José',
        'Mario Alberto',
        'Daniel Eduardo',
        'Cristian David',
        'Eduardo Rafael',
        'Patricio Luis',
        'Rodrigo Antonio',
        'Héctor Manuel',
      ],
      apellidos: [
        'Torres Vásquez',
        'Moreno Silva',
        'Castillo López',
        'Herrera García',
        'Silva Morales',
        'López Torres',
        'García Hernández',
        'Ruiz Castillo',
        'Pérez Moreno',
        'Mendoza García',
      ],
    },
  };

  const baseDocumento = 1804567890 + index;
  const baseTelefono = 987123450 + index;
  const fechasNacimiento = [
    new Date('1975-01-15'),
    new Date('1978-03-22'),
    new Date('1980-05-10'),
    new Date('1982-07-18'),
    new Date('1976-09-25'),
    new Date('1979-11-30'),
    new Date('1981-02-14'),
    new Date('1977-04-08'),
    new Date('1983-06-12'),
    new Date('1974-08-20'),
    new Date('1985-10-05'),
    new Date('1972-12-28'),
  ];

  const generos = ['M', 'F'];
  const fechaContratacion = new Date(2015 + (index % 8), index % 12, 1);

  const info = {
    usuarioTenantId,
    nombres:
      nombre ||
      nombresPorRol[rol].nombres[index % nombresPorRol[rol].nombres.length],
    apellidos:
      nombresPorRol[rol].apellidos[index % nombresPorRol[rol].apellidos.length],
    tipoDocumento: TipoDocumento.CEDULA,
    numeroDocumento: baseDocumento.toString(),
    telefono: `+593${baseTelefono}`,
    email: `${nombre ? nombre.toLowerCase().replace(' ', '.') : 'usuario' + index}@${dominios[tenantName as keyof typeof dominios]}`,
    fechaNacimiento: fechasNacimiento[index % fechasNacimiento.length],
    direccion: `${direcciones[tenantName as keyof typeof direcciones][index % direcciones[tenantName as keyof typeof direcciones].length]} ${100 + index * 10}`,
    ciudadResidencia: ciudades[tenantName as keyof typeof ciudades],
    genero: generos[index % 2],
    fechaContratacion,
  };

  // Agregar información de licencia para conductores
  if (rol === RolUsuario.CONDUCTOR) {
    const tiposLicencia = ['C1', 'C', 'D1', 'D'];
    const tipoLicencia = tiposLicencia[index % tiposLicencia.length];

    return {
      ...info,
      licenciaConducir: `${tipoLicencia}-${Math.floor(100000000 + Math.random() * 900000000)}`,
      tipoLicencia,
      fechaExpiracionLicencia: new Date(2025 + (index % 5), index % 12, 1),
    };
  }

  return info;
}

export async function seedUsuarios(prisma: PrismaClient, tenants: any[]) {
  // Crear usuarios del personal para cada tenant
  const usuariosPersonal = [];
  const usuariosTenant = [];
  const personalInfoArray = [];
  let globalIndex = 0;

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

    // Crear información personal para admin
    personalInfoArray.push(
      generatePersonalInfo(
        adminTenant.id,
        RolUsuario.ADMIN_COOPERATIVA,
        tenantName,
        globalIndex++,
      ),
    );

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

      // Crear información personal para oficinista
      personalInfoArray.push(
        generatePersonalInfo(
          oficinistaTenant.id,
          RolUsuario.OFICINISTA,
          tenantName,
          globalIndex++,
        ),
      );
    }

    // 10 Conductores por cooperativa
    const conductorNames = [
      'Juan',
      'Carlos',
      'Luis',
      'Miguel',
      'Roberto',
      'Pedro',
      'Jorge',
      'Francisco',
      'Rafael',
      'Antonio',
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

      // Crear información personal para conductor
      personalInfoArray.push(
        generatePersonalInfo(
          conductorTenant.id,
          RolUsuario.CONDUCTOR,
          tenantName,
          globalIndex++,
          conductorNames[i],
        ),
      );
    }

    // 10 Ayudantes por cooperativa
    const ayudanteNames = [
      'David',
      'Andrés',
      'Sebastián',
      'Mario',
      'Daniel',
      'Cristian',
      'Eduardo',
      'Patricio',
      'Rodrigo',
      'Héctor',
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

      // Crear información personal para ayudante
      personalInfoArray.push(
        generatePersonalInfo(
          ayudanteTenant.id,
          RolUsuario.AYUDANTE,
          tenantName,
          globalIndex++,
          ayudanteNames[i],
        ),
      );
    }
  }

  // Crear toda la información personal de una vez
  await prisma.personalCooperativa.createMany({
    data: personalInfoArray,
  });

  console.log(
    `Creados ${usuariosPersonal.length} usuarios con información personal completa`,
  );
  console.log(
    `Distribución por cooperativa: ${usuariosPersonal.length / tenants.length} usuarios cada una`,
  );

  return { usuariosPersonal, usuariosTenant };
}
