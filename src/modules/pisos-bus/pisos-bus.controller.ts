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
import { createApiOperation, CommonDescriptions } from '../../common/utils/swagger-descriptions.util';
import { filtroPisoBusBuild } from './utils/filtro-piso-bus-build';

@ApiTags('pisos-bus')
@ApiBearerAuth()
@Controller('pisos-bus')
export class PisosBusController {
  constructor(private readonly pisosBusService: PisosBusService) {}

  @ApiOperation(
    CommonDescriptions.getAll('pisos de bus', [TipoUsuario.ADMIN_SISTEMA, TipoUsuario.PERSONAL_COOPERATIVA], 
    'Lista todos los pisos de buses de la cooperativa actual. Incluye información de distribución, capacidad y configuración de asientos.')
  )
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

  @ApiOperation(
    CommonDescriptions.getPublic('pisos de bus', 
    'Lista todos los pisos de buses disponibles. Endpoint público útil para mostrar distribuciones de asientos en aplicaciones cliente.')
  )
  @Get('publico')
  async obtenerPisosBusPublico(@Query() filtro: FiltroPisoBusDto) {
    return await this.pisosBusService.obtenerPisosBus({
      filtro: filtroPisoBusBuild(filtro),
    });
  }

  @ApiOperation(
    CommonDescriptions.getPublic('piso de bus específico', 
    'Obtiene los detalles de un piso de bus por su ID. Incluye distribución de asientos y configuraciones específicas.')
  )
  @Get('publico/:id')
  async obtenerPisoBusPublicoPorId(@Param('id', ParseIntPipe) id: number) {
    return await this.pisosBusService.obtenerPisoBus({
      filtro: { id },
    });
  }

  @ApiOperation(
    CommonDescriptions.getById('piso de bus', [TipoUsuario.ADMIN_SISTEMA, TipoUsuario.PERSONAL_COOPERATIVA], 
    'Obtiene los detalles completos de un piso de bus de la cooperativa actual. Verifica permisos antes de mostrar la información.')
  )
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

  @ApiOperation(
    CommonDescriptions.create('piso de bus', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA], 
    'Crea un nuevo piso en un bus. Define la distribución y configuración de asientos según una plantilla o configuración personalizada.')
  )
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

  @ApiOperation(
    CommonDescriptions.update('piso de bus', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA], 
    'Actualiza un piso de bus existente. Permite modificar distribución, configuración y asignación de plantillas.')
  )
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

  @ApiOperation(
    CommonDescriptions.delete('piso de bus', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA], 
    'Elimina un piso de bus del sistema. CUIDADO: Esta acción eliminará todos los asientos asociados a este piso.')
  )
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
