import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PisosBusService } from './pisos-bus.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TipoUsuario, RolUsuario } from '@prisma/client';
import { TenantActual } from '../../common/decorators/tenant-actual.decorator';
import { CreatePisoBusDto, UpdatePisoBusDto, FiltroPisoBusDto } from './dto';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { filtroPisoBusBuild } from './utils/filtro-piso-bus-build';

@ApiTags('pisos-bus')
@ApiBearerAuth()
@Controller('pisos-bus')
export class PisosBusController {
  constructor(private readonly pisosBusService: PisosBusService) {}

  @ApiOperation({
    summary: 'Obtener todos los pisos de buses con filtros opcionales',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, TipoUsuario.PERSONAL_COOPERATIVA)
  @Get()
  async obtenerPisosBus(
    @Query() filtro: FiltroPisoBusDto,
    @TenantActual() tenantActual,
  ) {
    return await this.pisosBusService.obtenerPisosBus({
      filtro: filtroPisoBusBuild(filtro, tenantActual.id),
    });
  }

  @ApiOperation({
    summary:
      'Obtener todos los pisos de buses con filtros opcionales (público)',
  })
  @Get('publico')
  async obtenerPisosBusPublico(@Query() filtro: FiltroPisoBusDto) {
    return await this.pisosBusService.obtenerPisosBus({
      filtro: filtroPisoBusBuild(filtro),
    });
  }

  @ApiOperation({
    summary: 'Obtener un piso de bus por su ID (público)',
  })
  @Get('publico/:id')
  async obtenerPisoBusPublicoPorId(@Param('id', ParseIntPipe) id: number) {
    return await this.pisosBusService.obtenerPisoBus({
      filtro: { id },
    });
  }

  @ApiOperation({
    summary: 'Obtener un piso de bus por su ID',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, TipoUsuario.PERSONAL_COOPERATIVA)
  @Get(':id')
  async obtenerPisoBusPorId(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    // Primero obtenemos el piso con sus relaciones completas para verificar permisos
    const pisoBusCompleto = await this.pisosBusService[
      'prisma'
    ].pisoBus.findUnique({
      where: { id },
      include: {
        bus: true,
      },
    });

    if (!pisoBusCompleto) {
      throw new NotFoundException(`No se encontró el piso de bus con ID ${id}`);
    }

    if (pisoBusCompleto.bus.tenantId !== tenantActual.id) {
      throw new ForbiddenException(
        'No tienes permisos para ver este piso de bus',
      );
    }

    return await this.pisosBusService.obtenerPisoBus({
      filtro: { id },
    });
  }

  @ApiOperation({ summary: 'Crear un nuevo piso de bus' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crearPisoBus(
    @Body() createPisoBusDto: CreatePisoBusDto,
    @TenantActual() tenantActual,
  ) {
    const bus = await this.pisosBusService['prisma'].bus.findUnique({
      where: { id: createPisoBusDto.busId },
    });

    if (!bus || bus.tenantId !== tenantActual.id) {
      throw new ForbiddenException(
        'No tienes permisos para crear pisos en este bus',
      );
    }

    return await this.pisosBusService.crearPisoBus(createPisoBusDto);
  }

  @ApiOperation({ summary: 'Actualizar un piso de bus existente' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Put(':id')
  async actualizarPisoBus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePisoBusDto: UpdatePisoBusDto,
    @TenantActual() tenantActual,
  ) {
    const pisoBus = await this.pisosBusService['prisma'].pisoBus.findUnique({
      where: { id },
      include: { bus: true },
    });

    if (!pisoBus || pisoBus.bus.tenantId !== tenantActual.id) {
      throw new ForbiddenException(
        'No tienes permisos para actualizar este piso de bus',
      );
    }

    if (updatePisoBusDto.busId && updatePisoBusDto.busId !== pisoBus.busId) {
      const nuevoBus = await this.pisosBusService['prisma'].bus.findUnique({
        where: { id: updatePisoBusDto.busId },
      });

      if (!nuevoBus || nuevoBus.tenantId !== tenantActual.id) {
        throw new ForbiddenException(
          'No tienes permisos para asignar este piso al bus especificado',
        );
      }
    }

    return await this.pisosBusService.actualizarPisoBus(id, updatePisoBusDto);
  }

  @ApiOperation({ summary: 'Eliminar un piso de bus' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Delete(':id')
  async eliminarPisoBus(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenantActual,
  ) {
    const pisoBus = await this.pisosBusService['prisma'].pisoBus.findUnique({
      where: { id },
      include: { bus: true },
    });

    if (!pisoBus || pisoBus.bus.tenantId !== tenantActual.id) {
      throw new ForbiddenException(
        'No tienes permisos para eliminar este piso de bus',
      );
    }

    return await this.pisosBusService.eliminarPisoBus(id);
  }
}
