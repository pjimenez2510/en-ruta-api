import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import { UsuarioTenantService } from './usuario-tenant.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolUsuario, TipoUsuario } from '@prisma/client';
import { TenantActual } from '../../common/decorators/tenant-actual.decorator';
import {
  UpdateUsuarioTenantDto,
  FiltroUsuarioTenantDto,
  CreateUsuarioTenantDto,
} from './dto';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { filtroUsuarioTenantBuild } from './utils/filtro-usuario-tenant-build';
import { CreatePersonalCooperativaDto } from '../personal-cooperativa/dto';

@ApiTags('usuario-tenant')
@ApiBearerAuth()
@Controller('usuario-tenant')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuarioTenantController {
  constructor(private readonly usuarioTenantService: UsuarioTenantService) {}

  @ApiOperation({ summary: 'Obtener todas las relaciones usuario-tenant' })
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Get()
  async obtenerUsuariosTenant(
    @Query() filtro: FiltroUsuarioTenantDto,
    @TenantActual() tenant,
  ) {
    const usuariosTenant =
      await this.usuarioTenantService.obtenerUsuariosTenant({
        filtro: filtroUsuarioTenantBuild(filtro, tenant.id),
      });
    return usuariosTenant;
  }

  @ApiOperation({ summary: 'Obtener una relación usuario-tenant por ID' })
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Get(':id')
  async obtenerUsuarioTenantPorId(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenant,
  ) {
    const usuarioTenant = await this.usuarioTenantService.obtenerUsuarioTenant({
      filtro: { id },
    });

    if (usuarioTenant.tenantId !== tenant.id) {
      throw new NotFoundException(
        `Usuario-tenant con ID ${id} no encontrado en este tenant`,
      );
    }
    return usuarioTenant;
  }

  @ApiOperation({
    summary: 'Crear un usuario con relación a tenant y datos personales',
    description:
      'Crea un nuevo usuario, lo asigna a un tenant con un rol específico y guarda sus datos personales',
  })
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async crearUsuarioTenant(
    @Body() datos: CreateUsuarioTenantDto,
    @TenantActual() tenant,
  ) {
    datos.tenantId = tenant.id;

    const resultado = await this.usuarioTenantService.crearUsuarioTenant(datos);
    return resultado;
  }

  @ApiOperation({
    summary:
      'Actualizar un usuario con su relación a tenant y datos personales',
    description:
      'Actualiza en una sola operación los datos del usuario, su relación con el tenant y su información personal',
  })
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Put(':id')
  async actualizarUsuarioTenant(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: UpdateUsuarioTenantDto,
    @TenantActual() tenant,
  ) {
    const usuarioTenant = await this.usuarioTenantService.obtenerUsuarioTenant({
      filtro: { id },
    });

    if (usuarioTenant.tenantId !== tenant.id) {
      throw new NotFoundException(
        `Usuario-tenant con ID ${id} no encontrado en este tenant`,
      );
    }

    const resultado = await this.usuarioTenantService.actualizarUsuarioTenant(
      id,
      datos,
    );
    return resultado;
  }

  @ApiOperation({
    summary: 'Asignar información personal a un usuario-tenant',
  })
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Post(':id/asignar-info-personal')
  async asignarInfoPersonal(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: CreatePersonalCooperativaDto,
    @TenantActual() tenant,
  ) {
    const usuarioTenant = await this.usuarioTenantService.obtenerUsuarioTenant({
      filtro: { id },
    });

    if (usuarioTenant.tenantId !== tenant.id) {
      throw new NotFoundException(
        `Usuario-tenant con ID ${id} no encontrado en este tenant`,
      );
    }

    const resultado =
      await this.usuarioTenantService.asignarPersonalCooperativa(id, datos);
    return resultado;
  }

  @ApiOperation({ summary: 'Desactivar una relación usuario-tenant' })
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Delete(':id')
  async desactivarUsuarioTenant(
    @Param('id', ParseIntPipe) id: number,
    @TenantActual() tenant,
  ) {
    const usuarioTenant = await this.usuarioTenantService.obtenerUsuarioTenant({
      filtro: { id },
    });

    if (usuarioTenant.tenantId !== tenant.id) {
      throw new NotFoundException(
        `Usuario-tenant con ID ${id} no encontrado en este tenant`,
      );
    }

    const resultado =
      await this.usuarioTenantService.desactivarUsuarioTenant(id);
    return resultado;
  }
}
