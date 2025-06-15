import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  Request,
  UnauthorizedException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from '../../common/guards/local-auth.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UsuarioActual } from '../../common/decorators/usuario-actual.decorator';
import {
  LoginDto,
  RegistroClienteDto,
  RegistroCooperativaDto,
  CambiarTenantDto,
} from './dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { createApiOperation, CommonDescriptions } from '../../common/utils/swagger-descriptions.util';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Usuario autenticado correctamente',
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
  })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req, @Body() loginDto: LoginDto) {
    return this.authService.login(req.user);
  }

  @ApiOperation({ summary: 'Registrar un nuevo cliente' })
  @ApiBody({ type: RegistroClienteDto })
  @ApiResponse({
    status: 201,
    description: 'Cliente registrado correctamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o correo ya registrado',
  })
  @Post('registro/cliente')
  @HttpCode(HttpStatus.CREATED)
  async registrarCliente(@Body() registroDto: RegistroClienteDto) {
    return this.authService.registrarCliente(registroDto);
  }

  @ApiOperation({ summary: 'Registrar una nueva cooperativa' })
  @ApiBody({ type: RegistroCooperativaDto })
  @ApiResponse({
    status: 201,
    description: 'Cooperativa registrada correctamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o identificador/correo ya registrado',
  })
  @Post('registro/cooperativa')
  @HttpCode(HttpStatus.CREATED)
  async registrarCooperativa(@Body() registroDto: RegistroCooperativaDto) {
    return this.authService.registrarUsuarioConTenant(registroDto);
  }

  @ApiOperation({ summary: 'Cambiar entre tenants' })
  @ApiBody({ type: CambiarTenantDto })
  @ApiResponse({
    status: 200,
    description: 'Cambio de tenant realizado correctamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No tiene acceso a ese tenant',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('cambiar-tenant')
  @HttpCode(HttpStatus.OK)
  async cambiarTenant(
    @UsuarioActual() usuario,
    @Body() cambiarTenantDto: CambiarTenantDto,
  ) {
    if (!cambiarTenantDto.tenantId) {
      throw new UnauthorizedException('Tenant ID requerido');
    }

    return this.authService.cambiarTenant(
      usuario.sub,
      cambiarTenantDto.tenantId,
    );
  }
}
