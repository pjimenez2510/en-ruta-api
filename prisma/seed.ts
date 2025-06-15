// prisma/seeds/index.ts - Archivo principal
import { PrismaClient } from '@prisma/client';
import { seedModelosBuses } from './seeds/seed-modelo-buses-tipos-de-asientos';
import { seedTenants } from './seeds/seed-tenants';
import { seedUsuarios } from './seeds/seed-usuarios-personal';
import { seedBuses } from './seeds/seed-buses';
import { seedCiudades } from './seeds/seed-cuidades';
import { seedRutas } from './seeds/seed-ruta-horario';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Limpiando base de datos...');
  await cleanDatabase();

  console.log('📍 Creando ciudades...');
  await seedCiudades(prisma);

  console.log('👨‍💼 Creando usuarios y tenants...');
  const { adminSistema, tenants } = await seedTenants(prisma);
  const { usuariosPersonal, usuariosTenant } = await seedUsuarios(prisma, tenants);

  console.log('🚌 Creando modelos de buses...');
  const { modelosBus, plantillasPiso, tiposAsiento } = await seedModelosBuses(prisma, tenants);

  console.log('🚐 Creando buses...');
  await seedBuses(prisma, tenants, modelosBus, plantillasPiso, tiposAsiento);

  console.log('🛣️ Creando rutas...');
  const rutas = await seedRutas(prisma, tenants);

  console.log('✅ Seed completado exitosamente!');
}

async function cleanDatabase() {
  // Eliminar en orden inverso a las dependencias
  await prisma.ocupacionAsiento.deleteMany();
  await prisma.registroAbordaje.deleteMany();
  await prisma.boleto.deleteMany();
  await prisma.venta.deleteMany();
  await prisma.viaje.deleteMany();
  await prisma.horarioRuta.deleteMany();
  await prisma.paradaRuta.deleteMany();
  await prisma.ruta.deleteMany();
  await prisma.asiento.deleteMany();
  await prisma.pisoBus.deleteMany();
  await prisma.caracteristicaBus.deleteMany();
  await prisma.bus.deleteMany();
  await prisma.tipoAsiento.deleteMany();
  await prisma.ubicacionAsientoPlantilla.deleteMany();
  await prisma.plantillaPiso.deleteMany();
  await prisma.modeloBus.deleteMany();
  await prisma.resolucionANT.deleteMany();
  await prisma.personalCooperativa.deleteMany();
  await prisma.usuarioTenant.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.configuracion.deleteMany();
  await prisma.configuracionDescuento.deleteMany();
  await prisma.metodoPago.deleteMany();
  await prisma.notificacion.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.ciudad.deleteMany();
  await prisma.usuario.deleteMany();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error en seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
