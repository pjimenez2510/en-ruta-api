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
import { createApiOperation, CommonDescriptions } from '../../common/utils/swagger-descriptions.util';
import { filtroClienteBuild } from './utils/filtro-cliente-build';

@ApiTags('clientes')
@ApiBearerAuth()
@Controller('clientes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @ApiOperation(
    CommonDescriptions.getAll('clientes', [
      TipoUsuario.ADMIN_SISTEMA,
      RolUsuario.ADMIN_COOPERATIVA,
      RolUsuario.OFICINISTA,
      TipoUsuario.CLIENTE
    ], 'Lista todos los clientes del sistema con filtros por documento, nombre, email, etc. Los clientes solo pueden ver su propia información.')
  )
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

  @ApiOperation(
    CommonDescriptions.getById('cliente', [
      TipoUsuario.ADMIN_SISTEMA,
      RolUsuario.ADMIN_COOPERATIVA,
      RolUsuario.OFICINISTA,
      TipoUsuario.CLIENTE
    ], 'Obtiene los detalles completos de un cliente específico. Incluye información personal, historial de compras y preferencias.')
  )
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

  @ApiOperation(
    CommonDescriptions.create('cliente', [
      TipoUsuario.ADMIN_SISTEMA,
      RolUsuario.ADMIN_COOPERATIVA,
      RolUsuario.OFICINISTA,
      TipoUsuario.CLIENTE
    ], 'Crea un nuevo cliente en el sistema. Requiere información personal básica como documento, nombre, email y teléfono. Los clientes pueden registrarse a sí mismos.')
  )
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

  @ApiOperation(
    CommonDescriptions.update('cliente', [
      TipoUsuario.ADMIN_SISTEMA,
      RolUsuario.ADMIN_COOPERATIVA,
      RolUsuario.OFICINISTA,
      TipoUsuario.CLIENTE
    ], 'Actualiza la información de un cliente existente como datos personales, contacto o preferencias. Los clientes pueden actualizar su propia información.')
  )
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

  @ApiOperation(
    CommonDescriptions.delete('cliente', [
      TipoUsuario.ADMIN_SISTEMA,
      RolUsuario.ADMIN_COOPERATIVA,
      RolUsuario.OFICINISTA,
      TipoUsuario.CLIENTE
    ], 'Desactiva un cliente del sistema. El cliente no se elimina físicamente sino que se marca como inactivo para mantener integridad del historial.')
  )
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
