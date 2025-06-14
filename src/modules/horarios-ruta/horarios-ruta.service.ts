import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateHorarioRutaDto, UpdateHorarioRutaDto, FiltroHorarioRutaDto } from './dto';
import { HORARIO_RUTA_SELECT_WITH_RELATIONS } from './constants/horario-ruta-select';

@Injectable()
export class HorariosRutaService {
  constructor(private prisma: PrismaService) {}

  async obtenerHorariosRuta(
    filtro: Prisma.HorarioRutaWhereInput,
    args: Prisma.HorarioRutaSelect = HORARIO_RUTA_SELECT_WITH_RELATIONS,
    filtroDto?: FiltroHorarioRutaDto,
  ) {
    let horarios = await this.prisma.horarioRuta.findMany({
      where: filtro,
      orderBy: { horaSalida: 'asc' },
      select: args,
    });

    // Filtrar por día específico en memoria si es necesario
    if (filtroDto?.diaSemana !== undefined && filtroDto.diaSemana >= 1 && filtroDto.diaSemana <= 7) {
      const posicion = filtroDto.diaSemana - 1;
      horarios = horarios.filter(horario => 
        horario.diasSemana && horario.diasSemana[posicion] === '1'
      );
    }

    return horarios;
  }

  async obtenerHorarioRuta(
    filtro: Prisma.HorarioRutaWhereUniqueInput,
    args: Prisma.HorarioRutaSelect = HORARIO_RUTA_SELECT_WITH_RELATIONS,
  ) {
    const horario = await this.prisma.horarioRuta.findUnique({
      where: filtro,
      select: args,
    });

    if (!horario) {
      throw new NotFoundException(
        `Horario de ruta con el filtro ${JSON.stringify(filtro)} no encontrado`,
      );
    }

    return horario;
  }

  async crearHorarioRuta(
    datos: CreateHorarioRutaDto,
    tenantId: number,
    tx?: Prisma.TransactionClient,
  ) {
    const ruta = await this.prisma.ruta.findUnique({
      where: { id: datos.rutaId, tenantId },
    });

    if (!ruta) {
      throw new NotFoundException(`La ruta con ID ${datos.rutaId} no existe o no pertenece al tenant ${tenantId}`);
    }
    
    const existente = await this.prisma.horarioRuta.findFirst({
      where: {
        rutaId: datos.rutaId,
        horaSalida: datos.horaSalida,
        diasSemana: datos.diasSemana,
      },
    });

    if (existente) {
      throw new ConflictException(
        `Ya existe un horario similar para esta ruta en el mismo horario y días de la semana`,
      );
    }

    return await (tx || this.prisma).horarioRuta.create({
      data: {
        rutaId: datos.rutaId,
        horaSalida: datos.horaSalida,
        diasSemana: datos.diasSemana,
        activo: datos.activo ?? true,
      },
      select: HORARIO_RUTA_SELECT_WITH_RELATIONS,
    });
  }

  async actualizarHorarioRuta(
    id: number,
    datos: UpdateHorarioRutaDto,
    tenantId: number,
    tx?: Prisma.TransactionClient,
  ) {
    await this.obtenerHorarioRuta({ id, ruta: { tenantId } });

    if (datos.rutaId) {
      const ruta = await this.prisma.ruta.findUnique({
        where: { id: datos.rutaId, tenantId },
      });

      if (!ruta) {
        throw new NotFoundException(`La ruta con ID ${datos.rutaId} no existe o no pertenece al tenant ${tenantId}`);
      }
    }

    if (datos.rutaId || datos.horaSalida || datos.diasSemana) {
      const horarioActual = await this.prisma.horarioRuta.findUnique({
        where: { id },
      });

      const existente = await this.prisma.horarioRuta.findFirst({
        where: {
          rutaId: datos.rutaId ?? horarioActual?.rutaId,
          horaSalida: datos.horaSalida,
          diasSemana: datos.diasSemana ?? horarioActual?.diasSemana,
          NOT: {
            id,
          },
        },
      });

      if (existente) {
        throw new ConflictException(
          `Ya existe un horario similar para esta ruta en el mismo horario y días de la semana`,
        );
      }
    }

    return await (tx || this.prisma).horarioRuta.update({
      where: { id },
      data: datos,
      select: HORARIO_RUTA_SELECT_WITH_RELATIONS,
    });
  }

  async desactivarHorarioRuta(
    id: number,
    tenantId: number,
    tx?: Prisma.TransactionClient,
  ) {
    await this.obtenerHorarioRuta({ id, ruta: { tenantId } });

    return await (tx || this.prisma).horarioRuta.update({
      where: { id },
      data: { activo: false },
      select: HORARIO_RUTA_SELECT_WITH_RELATIONS,
    });
  }

  async activarHorarioRuta(
    id: number,
    tenantId: number,
    tx?: Prisma.TransactionClient,
  ) {
    await this.obtenerHorarioRuta({ id, ruta: { tenantId } });

    return await (tx || this.prisma).horarioRuta.update({
      where: { id },
      data: { activo: true },
      select: HORARIO_RUTA_SELECT_WITH_RELATIONS,
    });
  }

  async eliminarHorarioRuta(
    id: number,
    tenantId: number,
    tx?: Prisma.TransactionClient,
  ) {
    await this.obtenerHorarioRuta({ id, ruta: { tenantId } });

    const viajesAsociados = await this.prisma.viaje.count({
      where: { horarioRutaId: id },
    });

    if (viajesAsociados > 0) {
      throw new ConflictException(
        `No se puede eliminar el horario porque tiene ${viajesAsociados} viaje(s) asociado(s)`,
      );
    }

    return await (tx || this.prisma).horarioRuta.delete({
      where: { id },
      select: HORARIO_RUTA_SELECT_WITH_RELATIONS,
    });
  }
} 