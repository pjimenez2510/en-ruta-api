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
} from '@nestjs/common';
import { ModelosBusService } from './modelos-bus.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TipoUsuario, RolUsuario } from '@prisma/client';
import {
  CreateModeloBusDto,
  UpdateModeloBusDto,
  FiltroModeloBusDto,
} from './dto';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { createApiOperation, CommonDescriptions } from '../../common/utils/swagger-descriptions.util';
import { filtroModeloBusBuild } from './utils/filtro-modelo-bus-build';

@ApiTags('modelos-bus')
@ApiBearerAuth()
@Controller('modelos-bus')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ModelosBusController {
  constructor(private readonly modelosBusService: ModelosBusService) {}

  @ApiOperation(
    CommonDescriptions.getAll('modelos de bus', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA], 
    'Lista todos los modelos de bus disponibles en el sistema. Incluye información de marca, capacidad, características y plantillas de asientos.')
  )
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA)
  @Get()
  async obtenerModelosBus(@Query() filtro: FiltroModeloBusDto) {
    const modelosBus = await this.modelosBusService.obtenerModelosBus(
      filtroModeloBusBuild(filtro),
    );
    return modelosBus;
  }

  @ApiOperation(
    CommonDescriptions.getById('modelo de bus', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA], 
    'Obtiene los detalles completos de un modelo de bus específico incluyendo especificaciones técnicas y configuraciones disponibles.')
  )
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA, RolUsuario.OFICINISTA)
  @Get(':id')
  async obtenerModeloBusPorId(@Param('id', ParseIntPipe) id: number) {
    const modeloBus = await this.modelosBusService.obtenerModeloBus({ id });
    return modeloBus;
  }

  @ApiOperation(
    CommonDescriptions.create('modelo de bus', [TipoUsuario.ADMIN_SISTEMA], 
    'Crea un nuevo modelo de bus en el sistema. Solo administradores del sistema pueden crear modelos que estarán disponibles para todas las cooperativas.')
  )
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crearModeloBus(@Body() createModeloBusDto: CreateModeloBusDto) {
    const modeloBus =
      await this.modelosBusService.crearModeloBus(createModeloBusDto);
    return modeloBus;
  }

  @ApiOperation(
    CommonDescriptions.update('modelo de bus', [TipoUsuario.ADMIN_SISTEMA], 
    'Actualiza un modelo de bus existente. Solo administradores del sistema pueden modificar modelos de bus.')
  )
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Put(':id')
  async actualizarModeloBus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateModeloBusDto: UpdateModeloBusDto,
  ) {
    const modeloBus = await this.modelosBusService.actualizarModeloBus(
      id,
      updateModeloBusDto,
    );
    return modeloBus;
  }

  @ApiOperation(
    CommonDescriptions.delete('modelo de bus', [TipoUsuario.ADMIN_SISTEMA], 
    'Elimina un modelo de bus del sistema. CUIDADO: Esta acción puede afectar buses existentes que usen este modelo.')
  )
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Delete(':id')
  async eliminarModeloBus(@Param('id', ParseIntPipe) id: number) {
    const modeloBus = await this.modelosBusService.eliminarModeloBus(id);
    return modeloBus;
  }
}
