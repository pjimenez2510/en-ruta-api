// prisma/seeds/modelos-buses.seed.ts
import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export async function seedModelosBuses(prisma: PrismaClient, tenants: any[]) {
  // Crear tipos de asientos para cada tenant
  const tiposAsiento = [];
  for (let i = 0; i < tenants.length; i++) {
    const tenant = tenants[i];
    
    if (i === 0) { // Flota Pelileo
      tiposAsiento.push(
        await prisma.tipoAsiento.create({
          data: {
            tenantId: tenant.id,
            nombre: 'Ejecutivo',
            descripcion: 'Asiento ejecutivo con mayor comodidad',
            factorPrecio: new Decimal('1.50'),
            color: '#1E40AF',
            icono: 'executive-seat',
          },
        }),
        await prisma.tipoAsiento.create({
          data: {
            tenantId: tenant.id,
            nombre: 'Económico',
            descripcion: 'Asiento estándar económico',
            factorPrecio: new Decimal('1.00'),
            color: '#6B7280',
            icono: 'standard-seat',
          },
        })
      );
    } else if (i === 1) { // Transportes Baños
      tiposAsiento.push(
        await prisma.tipoAsiento.create({
          data: {
            tenantId: tenant.id,
            nombre: 'VIP',
            descripcion: 'Asiento VIP con servicios premium',
            factorPrecio: new Decimal('2.00'),
            color: '#059669',
            icono: 'vip-seat',
          },
        }),
        await prisma.tipoAsiento.create({
          data: {
            tenantId: tenant.id,
            nombre: 'Regular',
            descripcion: 'Asiento regular',
            factorPrecio: new Decimal('1.00'),
            color: '#9CA3AF',
            icono: 'regular-seat',
          },
        })
      );
    } else { // Expreso Riobamba
      tiposAsiento.push(
        await prisma.tipoAsiento.create({
          data: {
            tenantId: tenant.id,
            nombre: 'Premium',
            descripcion: 'Asiento premium de lujo',
            factorPrecio: new Decimal('1.75'),
            color: '#7C2D12',
            icono: 'premium-seat',
          },
        }),
        await prisma.tipoAsiento.create({
          data: {
            tenantId: tenant.id,
            nombre: 'Estándar',
            descripcion: 'Asiento estándar cómodo',
            factorPrecio: new Decimal('1.00'),
            color: '#94A3B8',
            icono: 'standard-seat',
          },
        })
      );
    }
  }

  // Crear modelos de bus más variados
  const modelosBus = await Promise.all([
    // Buses de 1 piso - configuración 2+2
    prisma.modeloBus.create({
      data: {
        marca: 'Mercedes-Benz',
        modelo: 'OF-1721',
        tipoChasis: 'Chasis largo',
        tipoCarroceria: 'Carrocería Urbano',
        anioModelo: 2020,
        numeroPisos: 1,
        descripcion: 'Bus interprovincial de alta gama - 44 asientos',
        esPublico: true,
      },
    }),
    // Buses de 1 piso - configuración 2+1
    prisma.modeloBus.create({
      data: {
        marca: 'Chevrolet',
        modelo: 'NPR',
        tipoChasis: 'Chasis mediano',
        tipoCarroceria: 'Carrocería Mixta',
        anioModelo: 2019,
        numeroPisos: 1,
        descripcion: 'Bus para rutas intercantonales - 36 asientos',
        esPublico: true,
      },
    }),
    // Buses de 2 pisos
    prisma.modeloBus.create({
      data: {
        marca: 'Volvo',
        modelo: 'B7R',
        tipoChasis: 'Chasis premium',
        tipoCarroceria: 'Carrocería Ejecutiva',
        anioModelo: 2021,
        numeroPisos: 2,
        descripcion: 'Bus de dos pisos para rutas largas - 68 asientos',
        esPublico: true,
      },
    }),
    // Bus compacto
    prisma.modeloBus.create({
      data: {
        marca: 'Isuzu',
        modelo: 'FRR',
        tipoChasis: 'Chasis compacto',
        tipoCarroceria: 'Carrocería Turística',
        anioModelo: 2020,
        numeroPisos: 1,
        descripcion: 'Bus compacto para rutas turísticas - 30 asientos',
        esPublico: true,
      },
    }),
    // Bus ejecutivo
    prisma.modeloBus.create({
      data: {
        marca: 'Scania',
        modelo: 'K320',
        tipoChasis: 'Chasis premium',
        tipoCarroceria: 'Carrocería Ejecutiva',
        anioModelo: 2022,
        numeroPisos: 1,
        descripcion: 'Bus ejecutivo de lujo - 40 asientos',
        esPublico: true,
      },
    }),
    // Bus económico
    prisma.modeloBus.create({
      data: {
        marca: 'Hyundai',
        modelo: 'Universe',
        tipoChasis: 'Chasis estándar',
        tipoCarroceria: 'Carrocería Estándar',
        anioModelo: 2019,
        numeroPisos: 1,
        descripcion: 'Bus económico para rutas urbanas - 42 asientos',
        esPublico: true,
      },
    }),
  ]);

  // Crear plantillas de piso
  const plantillasPiso = await Promise.all([
    // Mercedes-Benz OF-1721 (1 piso, 2+2)
    prisma.plantillaPiso.create({
      data: {
        modeloBusId: modelosBus[0].id,
        numeroPiso: 1,
        filas: 11,
        columnas: 4,
        descripcion: 'Configuración estándar 11x4 - 44 asientos',
        esPublico: true,
      },
    }),
    // Chevrolet NPR (1 piso, 2+1)
    prisma.plantillaPiso.create({
      data: {
        modeloBusId: modelosBus[1].id,
        numeroPiso: 1,
        filas: 12,
        columnas: 3,
        descripcion: 'Configuración compacta 12x3 - 36 asientos',
        esPublico: true,
      },
    }),
    // Volvo B7R (2 pisos)
    prisma.plantillaPiso.create({
      data: {
        modeloBusId: modelosBus[2].id,
        numeroPiso: 1,
        filas: 8,
        columnas: 4,
        descripcion: 'Piso inferior 8x4 - 32 asientos',
        esPublico: true,
      },
    }),
    prisma.plantillaPiso.create({
      data: {
        modeloBusId: modelosBus[2].id,
        numeroPiso: 2,
        filas: 9,
        columnas: 4,
        descripcion: 'Piso superior 9x4 - 36 asientos',
        esPublico: true,
      },
    }),
    // Isuzu FRR (1 piso, compacto)
    prisma.plantillaPiso.create({
      data: {
        modeloBusId: modelosBus[3].id,
        numeroPiso: 1,
        filas: 10,
        columnas: 3,
        descripcion: 'Configuración compacta 10x3 - 30 asientos',
        esPublico: true,
      },
    }),
    // Scania K320 (1 piso, ejecutivo)
    prisma.plantillaPiso.create({
      data: {
        modeloBusId: modelosBus[4].id,
        numeroPiso: 1,
        filas: 10,
        columnas: 4,
        descripcion: 'Configuración ejecutiva 10x4 - 40 asientos',
        esPublico: true,
      },
    }),
    // Hyundai Universe (1 piso, económico)
    prisma.plantillaPiso.create({
      data: {
        modeloBusId: modelosBus[5].id,
        numeroPiso: 1,
        filas: 10,
        columnas: 4,
        descripcion: 'Configuración económica 10x4 - 40 asientos (2 asientos adicionales)',
        esPublico: true,
      },
    }),
  ]);

  // Crear ubicaciones de asientos en plantillas
  for (const plantilla of plantillasPiso) {
    const ubicaciones = [];
    for (let fila = 1; fila <= plantilla.filas; fila++) {
      if (plantilla.columnas === 3) {
        // Configuración 2+1 (pasillo después de columna 2)
        for (let columna = 1; columna <= 3; columna++) {
          if (columna === 3) {
            // Solo 1 asiento al lado derecho
            ubicaciones.push({
              plantillaPisoId: plantilla.id,
              fila,
              columna: 3,
              estaHabilitado: true,
            });
          } else {
            // 2 asientos al lado izquierdo
            ubicaciones.push({
              plantillaPisoId: plantilla.id,
              fila,
              columna,
              estaHabilitado: true,
            });
          }
        }
      } else {
        // Configuración 2+2 (pasillo entre columnas 2 y 3)
        for (let columna = 1; columna <= 4; columna++) {
          ubicaciones.push({
            plantillaPisoId: plantilla.id,
            fila,
            columna,
            estaHabilitado: true,
          });
        }
      }
    }
    
    await prisma.ubicacionAsientoPlantilla.createMany({
      data: ubicaciones,
    });
  }

  return { modelosBus, plantillasPiso, tiposAsiento };
}