import { PrismaClient, TipoUsuario } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ciudades } from './data/ciudades';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.usuario.upsert({
    where: {
      username: 'admin',
    },
    update: {
      passwordHash: bcrypt.hashSync('admin', 10),
    },
    create: {
      username: 'admin',
      passwordHash: bcrypt.hashSync('admin', 10),
      tipoUsuario: TipoUsuario.ADMIN_SISTEMA,
    },
  });

  await prisma.ciudad.deleteMany();

  await prisma.ciudad.createMany({
    data: ciudades,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
