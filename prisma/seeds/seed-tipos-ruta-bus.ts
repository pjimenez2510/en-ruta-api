// prisma/seeds/tipos-ruta-bus.seed.ts
import { PrismaClient } from '@prisma/client';

export async function seedTiposRutaBus(prisma: PrismaClient, tenants: any[]) {
  const tiposRutaBus = [];

  for (let tenantIndex = 0; tenantIndex < tenants.length; tenantIndex++) {
    const tenant = tenants[tenantIndex];
    
    // Crear tipos de ruta específicos para cada cooperativa
    if (tenantIndex === 0) { // Flota Pelileo
      tiposRutaBus.push(
        await prisma.tipoRutaBus.create({
          data: {
            tenantId: tenant.id,
            nombre: 'Interprovincial',
          },
        }),
        await prisma.tipoRutaBus.create({
          data: {
            tenantId: tenant.id,
            nombre: 'Intercantonal',
          },
        })
      );
    } else if (tenantIndex === 1) { // Transportes Baños
      tiposRutaBus.push(
        await prisma.tipoRutaBus.create({
          data: {
            tenantId: tenant.id,
            nombre: 'Turístico',
          },
        }),
        await prisma.tipoRutaBus.create({
          data: {
            tenantId: tenant.id,
            nombre: 'Interprovincial',
          },
        })
      );
    } else { // Expreso Riobamba
      tiposRutaBus.push(
        await prisma.tipoRutaBus.create({
          data: {
            tenantId: tenant.id,
            nombre: 'Interprovincial',
          },
        }),
        await prisma.tipoRutaBus.create({
          data: {
            tenantId: tenant.id,
            nombre: 'Ejecutivo',
          },
        })
      );
    }
  }

  console.log(`✅ Creados ${tiposRutaBus.length} tipos de ruta de bus`);
  return tiposRutaBus;
} 