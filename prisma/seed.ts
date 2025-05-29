import { PrismaClient, TipoUsuario } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.usuario.upsert({
    where: {
      email: 'admin@admin.com',
    },
    update: {
      passwordHash: bcrypt.hashSync('admin', 10),
    },
    create: {
      email: 'admin@admin.com',
      passwordHash: bcrypt.hashSync('admin', 10),
      tipoUsuario: TipoUsuario.ADMIN_SISTEMA,
    },
  });

  console.log(user);
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
