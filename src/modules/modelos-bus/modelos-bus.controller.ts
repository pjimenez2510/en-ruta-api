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
import { filtroModeloBusBuild } from './utils/filtro-modelo-bus-build';

@ApiTags('modelos-bus')
@ApiBearerAuth()
@Controller('modelos-bus')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ModelosBusController {
  constructor(private readonly modelosBusService: ModelosBusService) {}

  @ApiOperation({ summary: 'Obtener todos los modelos de bus' })
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Get()
  async obtenerModelosBus(@Query() filtro: FiltroModeloBusDto) {
    const modelosBus = await this.modelosBusService.obtenerModelosBus(
      filtroModeloBusBuild(filtro),
    );
    return modelosBus;
  }

  @ApiOperation({ summary: 'Obtener un modelo de bus por ID' })
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Get(':id')
  async obtenerModeloBusPorId(@Param('id', ParseIntPipe) id: number) {
    const modeloBus = await this.modelosBusService.obtenerModeloBus({ id });
    return modeloBus;
  }

  @ApiOperation({ summary: 'Crear un nuevo modelo de bus' })
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crearModeloBus(@Body() createModeloBusDto: CreateModeloBusDto) {
    const modeloBus =
      await this.modelosBusService.crearModeloBus(createModeloBusDto);
    return modeloBus;
  }

  @ApiOperation({ summary: 'Actualizar un modelo de bus' })
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

  @ApiOperation({ summary: 'Eliminar un modelo de bus' })
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Delete(':id')
  async eliminarModeloBus(@Param('id', ParseIntPipe) id: number) {
    const modeloBus = await this.modelosBusService.eliminarModeloBus(id);
    return modeloBus;
  }
}
