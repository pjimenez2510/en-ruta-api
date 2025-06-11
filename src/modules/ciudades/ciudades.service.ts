import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CIUDAD_SELECT } from './constants/ciudad-select';
import { CreateCiudadDto, UpdateCiudadDto } from './dto';

@Injectable()
export class CiudadesService {
  constructor(private prisma: PrismaService) {}

  async obtenerCiudades(
    filtro: Prisma.CiudadWhereInput,
    args: Prisma.CiudadSelect = CIUDAD_SELECT,
  ) {
    return await this.prisma.ciudad.findMany({
      where: filtro,
      orderBy: { nombre: 'asc' },
      select: args,
    });
  }

  async obtenerCiudad(
    filtro: Prisma.CiudadWhereUniqueInput,
    args: Prisma.CiudadSelect = CIUDAD_SELECT,
  ) {
    const ciudad = await this.prisma.ciudad.findUnique({
      where: filtro,
      select: args,
    });

    if (!ciudad) {
      throw new NotFoundException(
        `Ciudad con el filtro ${JSON.stringify(filtro)} no encontrada`,
      );
    }

    return ciudad;
  }

  async crearCiudad(datos: CreateCiudadDto, tx?: Prisma.TransactionClient) {
    // Verificar si ya existe una ciudad con el mismo nombre y provincia
    const existente = await this.prisma.ciudad.findFirst({
      where: {
        nombre: datos.nombre,
        provincia: datos.provincia,
      },
    });

    if (existente) {
      throw new ConflictException(
        `Ya existe una ciudad con el nombre ${datos.nombre} en la provincia ${datos.provincia}`,
      );
    }

    return await (tx || this.prisma).ciudad.create({
      data: {
        ...datos,
        activo: true,
      },
      select: CIUDAD_SELECT,
    });
  }

  async actualizarCiudad(
    id: number,
    datos: UpdateCiudadDto,
    tx?: Prisma.TransactionClient,
  ) {
    await this.obtenerCiudad({ id });

    if (datos.nombre && datos.provincia) {
      const existente = await this.prisma.ciudad.findFirst({
        where: {
          nombre: datos.nombre,
          provincia: datos.provincia,
          NOT: [{ id: id }],
        },
      });

      if (existente) {
        throw new ConflictException(
          `Ya existe una ciudad con el nombre ${datos.nombre} en la provincia ${datos.provincia}`,
        );
      }
    }

    return await (tx || this.prisma).ciudad.update({
      where: { id },
      data: datos,
      select: CIUDAD_SELECT,
    });
  }

  async desactivarCiudad(id: number, tx?: Prisma.TransactionClient) {
    await this.obtenerCiudad({ id });

    return await (tx || this.prisma).ciudad.update({
      where: { id },
      data: { activo: false },
      select: CIUDAD_SELECT,
    });
  }
}
