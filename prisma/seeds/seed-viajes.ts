import { PrismaClient, EstadoViaje, TipoGeneracion } from '@prisma/client';

export async function seedViajes(prisma: PrismaClient, tenants: any[]) {
  const viajes = [];

  // Generar viajes para los próximos 30 días
  const fechaInicio = new Date();
  const fechaFin = new Date();
  fechaFin.setDate(fechaFin.getDate() + 30);

  // Obtener todos los horarios de rutas activos
  const horariosRutas = await prisma.horarioRuta.findMany({
    where: { activo: true },
    include: {
      ruta: {
        include: {
          tenant: true,
          tipoRutaBus: true,
        },
      },
    },
  });

  // Obtener buses disponibles por tenant
  const busesPorTenant = await prisma.bus.findMany({
    where: { estado: 'ACTIVO' },
    include: {
      tenant: true,
      tipoRutaBus: true,
    },
  });

  // Obtener conductores y ayudantes disponibles
  const personalDisponible = await prisma.usuarioTenant.findMany({
    where: {
      activo: true,
      rol: { in: ['CONDUCTOR', 'AYUDANTE'] },
    },
    include: {
      tenant: true,
    },
  });

  // Agrupar buses por tenant y tipo de ruta
  const busesPorTenantYTipo = new Map<string, any[]>();
  for (const bus of busesPorTenant) {
    const key = `${bus.tenantId}-${bus.tipoRutaBusId}`;
    if (!busesPorTenantYTipo.has(key)) {
      busesPorTenantYTipo.set(key, []);
    }
    busesPorTenantYTipo.get(key)!.push(bus);
  }

  // Agrupar horarios por tenant y tipo de ruta
  const horariosPorTenantYTipo = new Map<string, any[]>();
  for (const horario of horariosRutas) {
    const key = `${horario.ruta.tenantId}-${horario.ruta.tipoRutaBusId}`;
    if (!horariosPorTenantYTipo.has(key)) {
      horariosPorTenantYTipo.set(key, []);
    }
    horariosPorTenantYTipo.get(key)!.push(horario);
  }

  for (const [key, horariosDelTipo] of horariosPorTenantYTipo.entries()) {
    const [tenantId, tipoRutaBusId] = key.split('-').map(Number);
    const busesDelTipo = busesPorTenantYTipo.get(key) || [];

    if (busesDelTipo.length === 0) {
      console.log(`⚠️ No hay buses disponibles para el tenant ${tenantId} y tipo de ruta ${tipoRutaBusId}`);
      continue;
    }

    // Obtener personal del tenant
    const personalTenant = personalDisponible.filter(p => p.tenantId === tenantId);
    const conductores = personalTenant.filter(p => p.rol === 'CONDUCTOR');
    const ayudantes = personalTenant.filter(p => p.rol === 'AYUDANTE');

    // Generar viajes para cada horario del tipo
    for (const horarioRuta of horariosDelTipo) {
      // Generar viajes para cada día en el rango
      const fechaActual = new Date(fechaInicio);
      while (fechaActual <= fechaFin) {
        // Verificar si el horario opera en este día de la semana
        const diaSemana = fechaActual.getDay(); // 0 = domingo, 1 = lunes, etc.
        const diasSemana = horarioRuta.diasSemana;
        
        // Convertir el día de la semana a la posición en el string (domingo = 0, lunes = 1, etc.)
        const posicionDia = diaSemana === 0 ? 6 : diaSemana - 1; // Ajustar para que domingo sea posición 6
        
        if (diasSemana[posicionDia] === '1') {
          // Seleccionar bus aleatoriamente del mismo tipo
          const busIndex = Math.floor(Math.random() * busesDelTipo.length);
          const bus = busesDelTipo[busIndex];

          // Seleccionar conductor y ayudante aleatoriamente
          const conductor = conductores.length > 0 ? conductores[Math.floor(Math.random() * conductores.length)] : null;
          const ayudante = ayudantes.length > 0 ? ayudantes[Math.floor(Math.random() * ayudantes.length)] : null;

          // Crear hora de salida real combinando fecha y hora
          const [hora, minuto] = horarioRuta.horaSalida.split(':');
          const horaSalidaReal = new Date(fechaActual);
          horaSalidaReal.setHours(parseInt(hora), parseInt(minuto), 0, 0);

          // Determinar estado del viaje basado en la fecha
          let estado: EstadoViaje;
          const hoy = new Date();
          const fechaViaje = new Date(fechaActual);
          
          if (fechaViaje < hoy) {
            estado = EstadoViaje.COMPLETADO;
          } else if (fechaViaje.getDate() === hoy.getDate() && fechaViaje.getMonth() === hoy.getMonth() && fechaViaje.getFullYear() === hoy.getFullYear()) {
            estado = EstadoViaje.EN_RUTA;
          } else {
            estado = EstadoViaje.PROGRAMADO;
          }

          const viaje = await prisma.viaje.create({
            data: {
              tenantId: Number(tenantId),
              horarioRutaId: horarioRuta.id,
              busId: bus.id,
              conductorId: conductor?.id || null,
              ayudanteId: ayudante?.id || null,
              fecha: fechaActual,
              horaSalidaReal,
              estado,
              capacidadTotal: bus.totalAsientos,
              asientosOcupados: 0,
              generacion: TipoGeneracion.AUTOMATICA,
            },
          });

          viajes.push(viaje);
        }

        // Avanzar al siguiente día
        fechaActual.setDate(fechaActual.getDate() + 1);
      }
    }
  }

  console.log(`✅ Creados ${viajes.length} viajes para los próximos 30 días`);
  
  // Mostrar estadísticas por tenant
  for (const tenant of tenants) {
    const viajesTenant = viajes.filter(v => v.tenantId === tenant.id);
    const programados = viajesTenant.filter(v => v.estado === EstadoViaje.PROGRAMADO).length;
    const enRuta = viajesTenant.filter(v => v.estado === EstadoViaje.EN_RUTA).length;
    const completados = viajesTenant.filter(v => v.estado === EstadoViaje.COMPLETADO).length;
    
    console.log(`   - ${tenant.nombre}: ${viajesTenant.length} viajes (${programados} programados, ${enRuta} en ruta, ${completados} completados)`);
  }

  return viajes;
} 