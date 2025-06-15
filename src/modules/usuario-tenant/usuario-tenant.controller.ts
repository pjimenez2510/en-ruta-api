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
import { createApiOperation, CommonDescriptions } from '../../common/utils/swagger-descriptions.util';
import { filtroUsuarioTenantBuild } from './utils/filtro-usuario-tenant-build';
import { CreatePersonalCooperativaDto } from '../personal-cooperativa/dto';

@ApiTags('usuario-tenant')
@ApiBearerAuth()
@Controller('usuario-tenant')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuarioTenantController {
  constructor(private readonly usuarioTenantService: UsuarioTenantService) {}

  @ApiOperation(
    CommonDescriptions.getAll('relaciones usuario-cooperativa', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA], 
    'Lista todas las relaciones entre usuarios y la cooperativa actual. Incluye roles asignados, estado y información personal.')
  )
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

  @ApiOperation(
    CommonDescriptions.getById('relación usuario-cooperativa', [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA], 
    'Obtiene los detalles de una relación específica entre usuario y cooperativa. Incluye rol, permisos y datos personales.')
  )
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

  @ApiOperation(
    createApiOperation({
      summary: 'Crear usuario con asignación a cooperativa',
      description: 'Crea un nuevo usuario, lo asigna a la cooperativa con un rol específico y guarda sus datos personales. Proceso integral de alta de personal.',
      roles: [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA],
    })
  )
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

  @ApiOperation(
    createApiOperation({
      summary: 'Actualizar usuario y su relación con cooperativa',
      description: 'Actualiza en una sola operación los datos del usuario, su relación con la cooperativa y su información personal. Permite cambios de rol y datos.',
      roles: [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA],
    })
  )
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

  @ApiOperation(
    createApiOperation({
      summary: 'Asignar información personal a usuario-cooperativa',
      description: 'Asigna o actualiza la información personal y laboral de un usuario en la cooperativa. Incluye datos de contacto, cargo y detalles específicos del trabajo.',
      roles: [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA],
    })
  )
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

  @ApiOperation(
    createApiOperation({
      summary: 'Desactivar relación usuario-cooperativa',
      description: 'Desactiva la relación entre un usuario y la cooperativa. El usuario no podrá acceder a recursos de la cooperativa pero se mantiene en el sistema para integridad histórica.',
      roles: [TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA],
    })
  )
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
