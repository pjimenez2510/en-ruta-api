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
import { ClientesService } from './clientes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TipoUsuario, RolUsuario } from '@prisma/client';
import { CreateClienteDto, UpdateClienteDto, FiltroClienteDto } from './dto';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { filtroClienteBuild } from './utils/filtro-cliente-build';

@ApiTags('clientes')
@ApiBearerAuth()
@Controller('clientes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @ApiOperation({ summary: 'Obtener todos los clientes' })
  @Get()
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
    TipoUsuario.CLIENTE
  )
  async obtenerClientes(@Query() filtro: FiltroClienteDto) {
    const clientes = await this.clientesService.obtenerClientes(
      filtroClienteBuild(filtro),
    );
    return clientes;
  }

  @ApiOperation({ summary: 'Obtener cliente por ID' })
  @Get(':id')
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
    TipoUsuario.CLIENTE
  )
  async obtenerClientePorId(@Param('id', ParseIntPipe) id: number) {
    const cliente = await this.clientesService.obtenerCliente({ id });
    return cliente;
  }

  @ApiOperation({ summary: 'Crear nuevo cliente' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
    TipoUsuario.CLIENTE
  )
  async crearCliente(@Body() createClienteDto: CreateClienteDto) {
    const cliente = await this.clientesService.crearCliente(createClienteDto);
    return cliente;
  }

  @ApiOperation({ summary: 'Actualizar cliente' })
  @Put(':id')
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
    TipoUsuario.CLIENTE
  )
  async actualizarCliente(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClienteDto: UpdateClienteDto,
  ) {
    const cliente = await this.clientesService.actualizarCliente(
      id,
      updateClienteDto,
    );
    return cliente;
  }

  @ApiOperation({ summary: 'Desactivar cliente' })
  @Delete(':id')
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
    TipoUsuario.CLIENTE
  )
  async desactivarCliente(@Param('id', ParseIntPipe) id: number) {
    const cliente = await this.clientesService.desactivarCliente(id);
    return cliente;
  }
}
