import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateClienteDto, UpdateClienteDto } from './dto';
import { CLIENTE_SELECT } from './constants/clientes-select';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  async obtenerClientes(
    filtro: Prisma.ClienteWhereInput,
    args: Prisma.ClienteSelect = CLIENTE_SELECT,
  ) {
    return await this.prisma.cliente.findMany({
      where: filtro,
      orderBy: { apellidos: 'asc' },
      select: args,
    });
  }

  async obtenerCliente(
    filtro: Prisma.ClienteWhereUniqueInput,
    args: Prisma.ClienteSelect = CLIENTE_SELECT,
  ) {
    const cliente = await this.prisma.cliente.findUnique({
      where: filtro,
      select: args,
    });

    if (!cliente) {
      throw new NotFoundException(
        `Cliente con el filtro ${JSON.stringify(filtro)} no encontrado`,
      );
    }

    return cliente;
  }

  async crearCliente(
    datos: CreateClienteDto,
    tx?: Prisma.TransactionClient,
    userId?: number,
  ) {
    const existente = await this.prisma.cliente.findFirst({
      where: {
        tipoDocumento: datos.tipoDocumento,
        numeroDocumento: datos.numeroDocumento,
      },
    });

    if (existente) {
      throw new ConflictException(
        `Ya existe un cliente con el tipo de documento ${datos.tipoDocumento} y número ${datos.numeroDocumento}`,
      );
    }

    return await (tx || this.prisma).cliente.create({
      data: {
        ...datos,
        fechaRegistro: new Date(),
        ultimaActualizacion: new Date(),
        activo: true,
        usuarioId: userId,
      },
      select: CLIENTE_SELECT,
    });
  }

  async actualizarCliente(
    id: number,
    datos: UpdateClienteDto,
    tx?: Prisma.TransactionClient,
  ) {
    await this.obtenerCliente({ id });

    if (datos.tipoDocumento && datos.numeroDocumento) {
      const existente = await this.prisma.cliente.findFirst({
        where: {
          tipoDocumento: datos.tipoDocumento,
          numeroDocumento: datos.numeroDocumento,
          NOT: [{ id: id }],
        },
      });

      if (existente) {
        throw new ConflictException(
          `Ya existe un cliente con el tipo de documento ${datos.tipoDocumento} y número ${datos.numeroDocumento}`,
        );
      }
    }

    return await (tx || this.prisma).cliente.update({
      where: { id },
      data: {
        ...datos,
        ultimaActualizacion: new Date(),
      },
      select: CLIENTE_SELECT,
    });
  }

  async desactivarCliente(id: number, tx?: Prisma.TransactionClient) {
    await this.obtenerCliente({ id });

    return await (tx || this.prisma).cliente.update({
      where: { id },
      data: { activo: false },
      select: CLIENTE_SELECT,
    });
  }
}
