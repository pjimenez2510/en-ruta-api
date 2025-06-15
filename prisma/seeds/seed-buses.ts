// prisma/seeds/buses.seed.ts
import { PrismaClient, EstadoBus, EstadoAsiento } from '@prisma/client';

export async function seedBuses(prisma: PrismaClient, tenants: any[], modelosBus: any[], plantillasPiso: any[], tiposAsiento: any[]) {
  const buses = [];
  const pisosBus = [];

  for (let tenantIndex = 0; tenantIndex < tenants.length; tenantIndex++) {
    const tenant = tenants[tenantIndex];
    const tenantPrefix = tenantIndex === 0 ? 'TPE' : tenantIndex === 1 ? 'TBA' : 'TRB';
    
    // Obtener tipos de asiento para este tenant
    const tiposAsientoTenant = tiposAsiento.filter(ta => ta.tenantId === tenant.id);
    
    for (let busIndex = 1; busIndex <= 12; busIndex++) {
      // Alternar entre diferentes modelos
      const modeloIndex = (busIndex - 1) % modelosBus.length;
      const modelo = modelosBus[modeloIndex];
      
      // Calcular asientos según el modelo
      let totalAsientos;
      switch (modeloIndex) {
        case 0: totalAsientos = 44; break; // Mercedes-Benz
        case 1: totalAsientos = 36; break; // Chevrolet
        case 2: totalAsientos = 68; break; // Volvo (2 pisos)
        case 3: totalAsientos = 30; break; // Isuzu
        case 4: totalAsientos = 40; break; // Scania
        case 5: totalAsientos = 42; break; // Hyundai
        default: totalAsientos = 40;
      }

      const bus = await prisma.bus.create({
        data: {
          tenantId: tenant.id,
          modeloBusId: modelo.id,
          numero: (tenantIndex * 100) + 100 + busIndex,
          placa: `${tenantPrefix}-${String(1000 + busIndex).slice(1)}`,
          anioFabricacion: 2018 + (busIndex % 5),
          totalAsientos,
          fotoUrl: `https://example.com/bus-${tenantIndex}-${busIndex}.jpg`,
          tipoCombustible: busIndex % 3 === 0 ? 'GNV' : 'Diésel',
          fechaIngreso: new Date(2020 + (busIndex % 4), (busIndex % 12) + 1, 1),
          estado: busIndex === 12 ? EstadoBus.MANTENIMIENTO : EstadoBus.ACTIVO,
        },
      });
      buses.push(bus);

      // Crear pisos para el bus según su modelo
      const plantillasModelo = plantillasPiso.filter(p => p.modeloBusId === modelo.id);
      
      for (const plantilla of plantillasModelo) {
        const pisoBus = await prisma.pisoBus.create({
          data: {
            busId: bus.id,
            numeroPiso: plantilla.numeroPiso,
            plantillaPisoId: plantilla.id,
          },
        });
        pisosBus.push(pisoBus);

        // Crear asientos para este piso
        const asientos = [];
        let numeroAsiento = plantilla.numeroPiso === 1 ? 1 : 
                           plantilla.numeroPiso === 2 && modeloIndex === 2 ? 33 : 1; // Volvo 2do piso empieza en 33

        for (let fila = 1; fila <= plantilla.filas; fila++) {
          if (plantilla.columnas === 3) {
            // Configuración 2+1 (Chevrolet NPR, Isuzu FRR)
            for (let columna = 1; columna <= 3; columna++) {
              // Alternar tipos de asiento por fila
              const tipoAsiento = fila % 2 === 1 ? tiposAsientoTenant[0] : tiposAsientoTenant[1];
              
              asientos.push({
                pisoBusId: pisoBus.id,
                numero: `${numeroAsiento.toString().padStart(2, '0')}`,
                fila,
                columna,
                tipoId: tipoAsiento?.id || tiposAsientoTenant[0]?.id,
                estado: EstadoAsiento.DISPONIBLE,
              });
              
              numeroAsiento++;
            }
          } else {
            // Configuración 2+2 (Mercedes-Benz, Volvo, Scania, Hyundai)
            for (let columna = 1; columna <= 4; columna++) {
              // Alternar tipos de asiento por fila
              const tipoAsiento = fila % 2 === 1 ? tiposAsientoTenant[0] : tiposAsientoTenant[1];
              
              asientos.push({
                pisoBusId: pisoBus.id,
                numero: `${numeroAsiento.toString().padStart(2, '0')}`,
                fila,
                columna,
                tipoId: tipoAsiento?.id || tiposAsientoTenant[0]?.id,
                estado: EstadoAsiento.DISPONIBLE,
              });
              
              numeroAsiento++;
            }
          }
        }

        // Para el modelo Hyundai (índice 5), agregar 2 asientos extra al final
        if (modeloIndex === 5) {
          asientos.push(
            {
              pisoBusId: pisoBus.id,
              numero: `${numeroAsiento.toString().padStart(2, '0')}`,
              fila: plantilla.filas + 1,
              columna: 2,
              tipoId: tiposAsientoTenant[1]?.id || tiposAsientoTenant[0]?.id,
              estado: EstadoAsiento.DISPONIBLE,
            },
            {
              pisoBusId: pisoBus.id,
              numero: `${(numeroAsiento + 1).toString().padStart(2, '0')}`,
              fila: plantilla.filas + 1,
              columna: 3,
              tipoId: tiposAsientoTenant[1]?.id || tiposAsientoTenant[0]?.id,
              estado: EstadoAsiento.DISPONIBLE,
            }
          );
        }

        await prisma.asiento.createMany({
          data: asientos,
        });
      }

      // Agregar características aleatorias al bus
      const caracteristicas = [
        { 
          nombre: 'Aire Acondicionado', 
          valor: busIndex % 2 === 0 ? 'Sí' : 'No' 
        },
        { 
          nombre: 'WiFi', 
          valor: busIndex > 6 ? 'Sí' : 'No' 
        },
        { 
          nombre: 'TV', 
          valor: busIndex % 3 === 0 ? 'Sí' : 'No' 
        },
        { 
          nombre: 'Baño', 
          valor: totalAsientos > 40 ? 'Sí' : 'No' 
        },
        { 
          nombre: 'USB por asiento', 
          valor: busIndex > 8 ? 'Sí' : 'No' 
        },
        { 
          nombre: 'Sistema de audio', 
          valor: 'Sí' 
        },
      ];

      // Agregar características especiales según el modelo
      if (modeloIndex === 2) { // Volvo (2 pisos)
        caracteristicas.push({ nombre: 'Dos pisos', valor: 'Sí' });
        caracteristicas.push({ nombre: 'Vista panorámica', valor: 'Sí' });
      }
      
      if (modeloIndex === 4) { // Scania (ejecutivo)
        caracteristicas.push({ nombre: 'Asientos reclinables', valor: 'Sí' });
        caracteristicas.push({ nombre: 'Servicio a bordo', valor: 'Sí' });
      }
      
      if (modeloIndex === 3) { // Isuzu (turístico)
        caracteristicas.push({ nombre: 'Ventanas amplias', valor: 'Sí' });
        caracteristicas.push({ nombre: 'Portaequipajes extra', valor: 'Sí' });
      }

      for (const caracteristica of caracteristicas) {
        await prisma.caracteristicaBus.create({
          data: {
            busId: bus.id,
            nombre: caracteristica.nombre,
            valor: caracteristica.valor,
          },
        });
      }
    }
  }

  console.log(`✅ Creados ${buses.length} buses con ${pisosBus.length} pisos y todos sus asientos`);
  console.log(`📊 Distribución por tenant:`);
  
  for (let i = 0; i < tenants.length; i++) {
    const busesTenant = buses.filter(b => b.tenantId === tenants[i].id);
    console.log(`   - ${tenants[i].nombre}: ${busesTenant.length} buses`);
  }
  
  return { buses, pisosBus };
}