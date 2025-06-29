// prisma/seeds/rutas.seed.ts
import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export async function seedRutas(prisma: PrismaClient, tenants: any[], tiposRutaBus: any[]) {
  // Crear resoluciones ANT
  const resolucionesANT = await Promise.all([
    prisma.resolucionANT.create({
      data: {
        numeroResolucion: 'ANT-2025-001',
        fechaEmision: new Date('2025-01-15'),
        fechaVigencia: new Date('2028-01-15'),
        documentoUrl: 'https://www.ant.gob.ec/wp-content/uploads/2025/01/Reglamento_Homologacion_Tecnica_sistemas_Pos_Satelital.pdf',
        descripcion: 'Resolución para rutas interprovinciales zona central',
        activo: true,
      },
    }),
    prisma.resolucionANT.create({
      data: {
        numeroResolucion: 'ANT-2025-002',
        fechaEmision: new Date('2025-02-20'),
        fechaVigencia: new Date('2028-02-20'),
        documentoUrl: 'https://www.ant.gob.ec/wp-content/uploads/2025/01/Reglamento_Homologacion_Tecnica_sistemas_Pos_Satelital.pdf',
        descripcion: 'Resolución para rutas turísticas zona sierra',
        activo: true,
      },
    }),
    prisma.resolucionANT.create({
      data: {
        numeroResolucion: 'ANT-2025-003',
        fechaEmision: new Date('2025-03-10'),
        fechaVigencia: new Date('2028-03-10'),
        documentoUrl: 'https://www.ant.gob.ec/wp-content/uploads/2025/01/Reglamento_Homologacion_Tecnica_sistemas_Pos_Satelital.pdf',
        descripcion: 'Resolución para rutas intercantonales',
        activo: true,
      },
    }),
  ]);

  // Obtener ciudades necesarias
  const ciudades = await prisma.ciudad.findMany();
  const getCiudadByName = (nombre: string) => ciudades.find(c => c.nombre === nombre);

  const rutas = [];

  // RUTAS PARA FLOTA PELILEO (5 rutas)
  const rutasFlotaPelileo = [
    {
      nombre: 'Pelileo - Ambato - Quito',
      descripcion: 'Ruta interprovincial desde Pelileo hasta Quito con parada en Ambato',
      tipoRuta: 'Interprovincial',
      paradas: [
        { ciudad: 'Pelileo', orden: 0, distancia: 0, tiempo: 0, precio: 0 },
        { ciudad: 'Ambato', orden: 1, distancia: 18.5, tiempo: 25, precio: 1.5 },
        { ciudad: 'Quito', orden: 2, distancia: 158.3, tiempo: 180, precio: 8.5 },
      ],
      horarios: [
        { hora: '06:00', dias: '1111111' },
        { hora: '14:30', dias: '1111111' },
      ],
    },
    {
      nombre: 'Pelileo - Riobamba',
      descripcion: 'Ruta intercantonal directa desde Pelileo hasta Riobamba',
      tipoRuta: 'Intercantonal',
      paradas: [
        { ciudad: 'Pelileo', orden: 0, distancia: 0, tiempo: 0, precio: 0 },
        { ciudad: 'Riobamba', orden: 1, distancia: 65.2, tiempo: 90, precio: 3.5 },
      ],
      horarios: [
        { hora: '08:00', dias: '1111100' },
        { hora: '16:00', dias: '1111100' },
      ],
    },
    {
      nombre: 'Pelileo - Latacunga - Quito',
      descripcion: 'Ruta alternativa hacia Quito vía Latacunga',
      tipoRuta: 'Interprovincial',
      paradas: [
        { ciudad: 'Pelileo', orden: 0, distancia: 0, tiempo: 0, precio: 0 },
        { ciudad: 'Ambato', orden: 1, distancia: 18.5, tiempo: 25, precio: 1.5 },
        { ciudad: 'Latacunga', orden: 2, distancia: 65.8, tiempo: 85, precio: 3.2 },
        { ciudad: 'Quito', orden: 3, distancia: 158.3, tiempo: 180, precio: 8.5 },
      ],
      horarios: [
        { hora: '10:00', dias: '0000011' },
      ],
    },
    {
      nombre: 'Pelileo - Cuenca',
      descripcion: 'Ruta hacia el sur del país',
      tipoRuta: 'Interprovincial',
      paradas: [
        { ciudad: 'Pelileo', orden: 0, distancia: 0, tiempo: 0, precio: 0 },
        { ciudad: 'Riobamba', orden: 1, distancia: 65.2, tiempo: 90, precio: 3.5 },
        { ciudad: 'Azogues', orden: 2, distancia: 155.3, tiempo: 210, precio: 7.8 },
        { ciudad: 'Cuenca', orden: 3, distancia: 175.6, tiempo: 240, precio: 9.2 },
      ],
      horarios: [
        { hora: '07:30', dias: '1111111' },
        { hora: '15:00', dias: '1111111' },
      ],
    },
    {
      nombre: 'Ambato - Guaranda',
      descripcion: 'Ruta intercantonal hacia Bolívar',
      tipoRuta: 'Intercantonal',
      paradas: [
        { ciudad: 'Ambato', orden: 0, distancia: 0, tiempo: 0, precio: 0 },
        { ciudad: 'Guaranda', orden: 1, distancia: 62.4, tiempo: 95, precio: 3.8 },
      ],
      horarios: [
        { hora: '09:30', dias: '1111100' },
      ],
    },
  ];

  // RUTAS PARA TRANSPORTES BAÑOS (5 rutas)
  const rutasTransportesBanos = [
    {
      nombre: 'Baños - Puyo - Tena',
      descripcion: 'Ruta turística amazónica desde Baños hasta Tena',
      tipoRuta: 'Turístico',
      paradas: [
        { ciudad: 'Baños', orden: 0, distancia: 0, tiempo: 0, precio: 0 },
        { ciudad: 'Puyo', orden: 1, distancia: 61.4, tiempo: 75, precio: 2.75 },
        { ciudad: 'Tena', orden: 2, distancia: 167.8, tiempo: 195, precio: 6.25 },
      ],
      horarios: [
        { hora: '07:30', dias: '1111111' },
        { hora: '15:00', dias: '0000011' },
      ],
    },
    {
      nombre: 'Baños - Ambato - Latacunga',
      descripcion: 'Ruta interprovincial hacia el norte',
      tipoRuta: 'Interprovincial',
      paradas: [
        { ciudad: 'Baños', orden: 0, distancia: 0, tiempo: 0, precio: 0 },
        { ciudad: 'Ambato', orden: 1, distancia: 42.3, tiempo: 55, precio: 2.25 },
        { ciudad: 'Latacunga', orden: 2, distancia: 89.6, tiempo: 120, precio: 4.5 },
      ],
      horarios: [
        { hora: '09:15', dias: '1111111' },
        { hora: '17:45', dias: '1111111' },
      ],
    },
    {
      nombre: 'Baños - Riobamba - Alausí',
      descripcion: 'Ruta turística hacia la Nariz del Diablo',
      tipoRuta: 'Turístico',
      paradas: [
        { ciudad: 'Baños', orden: 0, distancia: 0, tiempo: 0, precio: 0 },
        { ciudad: 'Riobamba', orden: 1, distancia: 85.7, tiempo: 110, precio: 4.2 },
        { ciudad: 'Alausí', orden: 2, distancia: 142.3, tiempo: 180, precio: 7.1 },
      ],
      horarios: [
        { hora: '08:00', dias: '1111111' },
        { hora: '14:30', dias: '0000011' },
      ],
    },
    {
      nombre: 'Baños - Quito',
      descripcion: 'Ruta directa hacia la capital',
      tipoRuta: 'Interprovincial',
      paradas: [
        { ciudad: 'Baños', orden: 0, distancia: 0, tiempo: 0, precio: 0 },
        { ciudad: 'Ambato', orden: 1, distancia: 42.3, tiempo: 55, precio: 2.25 },
        { ciudad: 'Latacunga', orden: 2, distancia: 89.6, tiempo: 120, precio: 4.5 },
        { ciudad: 'Machachi', orden: 3, distancia: 135.2, tiempo: 160, precio: 6.8 },
        { ciudad: 'Quito', orden: 4, distancia: 185.4, tiempo: 220, precio: 9.3 },
      ],
      horarios: [
        { hora: '06:00', dias: '1111111' },
      ],
    },
    {
      nombre: 'Baños - Shell',
      descripcion: 'Ruta corta hacia Shell Mera',
      tipoRuta: 'Turístico',
      paradas: [
        { ciudad: 'Baños', orden: 0, distancia: 0, tiempo: 0, precio: 0 },
        { ciudad: 'Shell', orden: 1, distancia: 18.2, tiempo: 25, precio: 1.25 },
      ],
      horarios: [
        { hora: '11:00', dias: '1111111' },
        { hora: '16:30', dias: '1111111' },
      ],
    },
  ];

  // RUTAS PARA EXPRESO RIOBAMBA (5 rutas)
  const rutasExpresoRiobamba = [
    {
      nombre: 'Riobamba - Guayaquil',
      descripcion: 'Ruta interprovincial hacia la costa',
      tipoRuta: 'Interprovincial',
      paradas: [
        { ciudad: 'Riobamba', orden: 0, distancia: 0, tiempo: 0, precio: 0 },
        { ciudad: 'Alausí', orden: 1, distancia: 56.6, tiempo: 75, precio: 2.8 },
        { ciudad: 'La Troncal', orden: 2, distancia: 142.8, tiempo: 180, precio: 7.1 },
        { ciudad: 'Milagro', orden: 3, distancia: 198.5, tiempo: 240, precio: 9.9 },
        { ciudad: 'Guayaquil', orden: 4, distancia: 243.7, tiempo: 290, precio: 12.2 },
      ],
      horarios: [
        { hora: '05:30', dias: '1111111' },
        { hora: '22:00', dias: '1111111' },
      ],
    },
    {
      nombre: 'Riobamba - Quito',
      descripcion: 'Ruta directa hacia la capital',
      tipoRuta: 'Interprovincial',
      paradas: [
        { ciudad: 'Riobamba', orden: 0, distancia: 0, tiempo: 0, precio: 0 },
        { ciudad: 'Ambato', orden: 1, distancia: 47.2, tiempo: 65, precio: 2.4 },
        { ciudad: 'Latacunga', orden: 2, distancia: 94.5, tiempo: 125, precio: 4.7 },
        { ciudad: 'Quito', orden: 3, distancia: 198.8, tiempo: 240, precio: 9.9 },
      ],
      horarios: [
        { hora: '07:00', dias: '1111111' },
        { hora: '15:30', dias: '1111111' },
      ],
    },
    {
      nombre: 'Riobamba - Cuenca',
      descripcion: 'Ruta hacia la región austral',
      tipoRuta: 'Interprovincial',
      paradas: [
        { ciudad: 'Riobamba', orden: 0, distancia: 0, tiempo: 0, precio: 0 },
        { ciudad: 'Azogues', orden: 1, distancia: 90.1, tiempo: 120, precio: 4.5 },
        { ciudad: 'Cuenca', orden: 2, distancia: 110.4, tiempo: 150, precio: 5.5 },
      ],
      horarios: [
        { hora: '08:30', dias: '1111111' },
        { hora: '16:00', dias: '1111111' },
      ],
    },
    {
      nombre: 'Riobamba - Macas',
      descripcion: 'Ruta hacia la amazonia sur',
      tipoRuta: 'Interprovincial',
      paradas: [
        { ciudad: 'Riobamba', orden: 0, distancia: 0, tiempo: 0, precio: 0 },
        { ciudad: 'Macas', orden: 1, distancia: 142.6, tiempo: 210, precio: 7.1 },
      ],
      horarios: [
        { hora: '06:30', dias: '1111100' },
      ],
    },
    {
      nombre: 'Riobamba - Guaranda - Babahoyo',
      descripcion: 'Ruta hacia Los Ríos vía Guaranda',
      tipoRuta: 'Ejecutivo',
      paradas: [
        { ciudad: 'Riobamba', orden: 0, distancia: 0, tiempo: 0, precio: 0 },
        { ciudad: 'Guaranda', orden: 1, distancia: 68.3, tiempo: 85, precio: 3.4 },
        { ciudad: 'Babahoyo', orden: 2, distancia: 156.7, tiempo: 195, precio: 7.8 },
      ],
      horarios: [
        { hora: '10:00', dias: '1111100' },
        { hora: '18:00', dias: '0000011' },
      ],
    },
  ];

  // Crear rutas para cada tenant
  const allRutas = [rutasFlotaPelileo, rutasTransportesBanos, rutasExpresoRiobamba];
  
  for (let tenantIndex = 0; tenantIndex < tenants.length; tenantIndex++) {
    const tenant = tenants[tenantIndex];
    const rutasTenant = allRutas[tenantIndex];
    const tiposRutaBusTenant = tiposRutaBus.filter(trb => trb.tenantId === tenant.id);
    
    for (const rutaData of rutasTenant) {
      // Encontrar el tipo de ruta correspondiente
      const tipoRutaBus = tiposRutaBusTenant.find(trb => trb.nombre === rutaData.tipoRuta);
      
      // Crear la ruta
      const ruta = await prisma.ruta.create({
        data: {
          tenantId: tenant.id,
          tipoRutaBusId: tipoRutaBus.id,
          nombre: rutaData.nombre,
          resolucionId: resolucionesANT[tenantIndex % resolucionesANT.length].id,
          descripcion: rutaData.descripcion,
          activo: true,
        },
      });
      rutas.push(ruta);

      // Crear paradas de la ruta
      for (const paradaData of rutaData.paradas) {
        const ciudad = getCiudadByName(paradaData.ciudad);
        if (ciudad) {
          await prisma.paradaRuta.create({
            data: {
              rutaId: ruta.id,
              ciudadId: ciudad.id,
              orden: paradaData.orden,
              distanciaAcumulada: new Decimal(paradaData.distancia.toString()),
              tiempoAcumulado: paradaData.tiempo,
              precioAcumulado: new Decimal(paradaData.precio.toString()),
            },
          });
        }
      }

      // Crear horarios de la ruta
      for (const horarioData of rutaData.horarios) {
        await prisma.horarioRuta.create({
          data: {
            rutaId: ruta.id,
            horaSalida: horarioData.hora,
            diasSemana: horarioData.dias,
            activo: true,
          },
        });
      }
    }
  }

  console.log(`✅ Creadas ${rutas.length} rutas con sus paradas y horarios`);
  return rutas;
}