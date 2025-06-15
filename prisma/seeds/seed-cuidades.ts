// prisma/seeds/ciudades.seed.ts
import { PrismaClient } from '@prisma/client';
import { ciudades } from '../data/ciudades';

export async function seedCiudades(prisma: PrismaClient) {
  await prisma.ciudad.createMany({
    data: ciudades,
  });
  
  console.log(`✅ Creadas ${ciudades.length} ciudades`);
}