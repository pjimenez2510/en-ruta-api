import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailSchedulerService } from './email-scheduler.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TipoUsuario, RolUsuario } from '@prisma/client';
import { TenantActual } from '../../common/decorators/tenant-actual.decorator';
import { 
  SendEmailDto,
  VentaIdParamDto,
  BoletoIdParamDto,
  BoletoEstadoParamDto,
  EmailTestDto,
  EstadisticasQueryDto,
  EmailResponseDto,
  EstadisticasResponseDto,
} from './dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('emails')
@ApiBearerAuth()
@Controller('emails')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly emailSchedulerService: EmailSchedulerService,
  ) {}

  @ApiOperation({
    summary: 'Enviar email genérico con plantilla',
    description: 'Permite enviar un email usando cualquier plantilla disponible. Solo para administradores.',
  })
  @ApiResponse({
    status: 200,
    description: 'Email enviado exitosamente',
    type: EmailResponseDto,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Post('enviar')
  @HttpCode(HttpStatus.OK)
  async enviarEmail(@Body() sendEmailDto: SendEmailDto): Promise<EmailResponseDto> {
    const resultado = await this.emailService.sendEmail(sendEmailDto);
    
    return {
      success: resultado,
      message: resultado 
        ? 'Email enviado exitosamente' 
        : 'Error al enviar el email',
    };
  }

  @ApiOperation({
    summary: 'Reenviar confirmación de venta',
    description: 'Reenvía el email de confirmación de una venta específica al cliente.',
  })
  @ApiParam({
    name: 'ventaId',
    description: 'ID de la venta',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Confirmación reenviada exitosamente',
    type: EmailResponseDto,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Post('venta/:ventaId/confirmacion')
  @HttpCode(HttpStatus.OK)
  async reenviarConfirmacionVenta(
    @Param() params: VentaIdParamDto,
    @TenantActual() tenantActual,
  ): Promise<EmailResponseDto> {
    const resultado = await this.emailService.enviarConfirmacionVenta(params.ventaId);
    
    return {
      success: resultado,
      message: resultado 
        ? 'Confirmación de venta reenviada exitosamente' 
        : 'Error al reenviar la confirmación de venta',
    };
  }

  @ApiOperation({
    summary: 'Reenviar boleto individual',
    description: 'Reenvía un boleto específico por email al cliente.',
  })
  @ApiParam({
    name: 'boletoId',
    description: 'ID del boleto',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Boleto reenviado exitosamente',
    type: EmailResponseDto,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Post('boleto/:boletoId/reenviar')
  @HttpCode(HttpStatus.OK)
  async reenviarBoleto(
    @Param() params: BoletoIdParamDto,
    @TenantActual() tenantActual,
  ): Promise<EmailResponseDto> {
    const resultado = await this.emailService.enviarBoleto(params.boletoId);
    
    return {
      success: resultado,
      message: resultado 
        ? 'Boleto reenviado exitosamente' 
        : 'Error al reenviar el boleto',
    };
  }

  @ApiOperation({
    summary: 'Enviar recordatorio de viaje',
    description: 'Envía un recordatorio de viaje para un boleto específico.',
  })
  @ApiParam({
    name: 'boletoId',
    description: 'ID del boleto',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Recordatorio enviado exitosamente',
    type: EmailResponseDto,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Post('boleto/:boletoId/recordatorio')
  @HttpCode(HttpStatus.OK)
  async enviarRecordatorio(
    @Param() params: BoletoIdParamDto,
    @TenantActual() tenantActual,
  ): Promise<EmailResponseDto> {
    const resultado = await this.emailService.enviarRecordatorioViaje(params.boletoId);
    
    return {
      success: resultado,
      message: resultado 
        ? 'Recordatorio enviado exitosamente' 
        : 'Error al enviar el recordatorio',
    };
  }

  @ApiOperation({
    summary: 'Notificar cambio de estado de boleto',
    description: 'Envía una notificación al cliente sobre el cambio de estado de su boleto.',
  })
  @ApiParam({
    name: 'boletoId',
    description: 'ID del boleto',
    type: 'number',
  })
  @ApiParam({
    name: 'estado',
    description: 'Nuevo estado del boleto',
    enum: ['PENDIENTE', 'CONFIRMADO', 'ABORDADO', 'NO_SHOW', 'CANCELADO'],
  })
  @ApiResponse({
    status: 200,
    description: 'Notificación enviada exitosamente',
    type: EmailResponseDto,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Post('boleto/:boletoId/notificar-estado/:estado')
  @HttpCode(HttpStatus.OK)
  async notificarCambioEstado(
    @Param() params: BoletoEstadoParamDto,
    @TenantActual() tenantActual,
  ): Promise<EmailResponseDto> {
    const resultado = await this.emailService.enviarCambioEstadoBoleto(params.boletoId, params.estado);
    
    return {
      success: resultado,
      message: resultado 
        ? 'Notificación de cambio de estado enviada exitosamente' 
        : 'Error al enviar la notificación',
    };
  }

  @ApiOperation({
    summary: 'Enviar email de prueba',
    description: 'Envía un email de prueba para verificar la configuración del servidor de correo.',
  })
  @ApiResponse({
    status: 200,
    description: 'Email de prueba enviado exitosamente',
    type: EmailResponseDto,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Post('test')
  @HttpCode(HttpStatus.OK)
  async enviarEmailPrueba(
    @Body() emailTestDto: EmailTestDto,
  ): Promise<EmailResponseDto> {
    const resultado = await this.emailService.sendEmail({
      to: emailTestDto.email,
      subject: 'Email de Prueba - EnRuta API',
      template: 'test-email',
      context: {
        fecha: new Date().toLocaleDateString('es-ES'),
        hora: new Date().toLocaleTimeString('es-ES'),
      },
    });
    
    return {
      success: resultado,
      message: resultado 
        ? 'Email de prueba enviado exitosamente' 
        : 'Error al enviar el email de prueba',
    };
  }

  @ApiOperation({
    summary: 'Probar envío de confirmación de venta (para debugging)',
    description: 'Permite reenviar manualmente la confirmación de una venta para debugging.',
  })
  @ApiParam({
    name: 'ventaId',
    description: 'ID de la venta',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Test ejecutado',
    type: EmailResponseDto,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA, RolUsuario.ADMIN_COOPERATIVA)
  @Post('debug/venta/:ventaId/test-confirmacion')
  @HttpCode(HttpStatus.OK)
  async testConfirmacionVenta(
    @Param() params: VentaIdParamDto,
  ): Promise<EmailResponseDto> {
    try {
      // Primero verificar que la venta existe
      const ventaExists = await this.emailService['prisma'].venta.findUnique({
        where: { id: params.ventaId },
        include: { boletos: true },
      });

      if (!ventaExists) {
        return {
          success: false,
          message: `❌ Venta ${params.ventaId} no encontrada en la base de datos`,
        };
      }

      console.log(`[DEBUG] Venta ${params.ventaId} encontrada con ${ventaExists.boletos.length} boletos`);

      const resultado = await this.emailService.enviarConfirmacionVenta(params.ventaId);
      
      return {
        success: resultado,
        message: resultado 
          ? `✅ Confirmación de venta ${params.ventaId} enviada exitosamente (modo debug)` 
          : `❌ Error al enviar la confirmación de venta ${params.ventaId} (modo debug)`,
      };
    } catch (error) {
      console.error('[DEBUG] Error en test de confirmación:', error);
      return {
        success: false,
        message: `❌ Error ejecutando test: ${error.message}`,
      };
    }
  }

  @ApiOperation({
    summary: 'Obtener estadísticas de emails',
    description: 'Devuelve estadísticas de envío de emails para un período específico.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
    type: EstadisticasResponseDto,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    TipoUsuario.ADMIN_SISTEMA,
    RolUsuario.ADMIN_COOPERATIVA,
    RolUsuario.OFICINISTA,
  )
  @Get('estadisticas')
  async obtenerEstadisticasEmails(
    @Query() query: EstadisticasQueryDto,
  ): Promise<EstadisticasResponseDto> {
    const estadisticas = await this.emailSchedulerService.obtenerEstadisticasEmails(query.dias);
    
    return {
      success: true,
      data: estadisticas,
    };
  }

  @ApiOperation({
    summary: 'Ejecutar envío de recordatorios manualmente',
    description: 'Permite ejecutar manualmente el proceso de envío de recordatorios de viaje.',
  })
  @ApiResponse({
    status: 200,
    description: 'Proceso de recordatorios iniciado exitosamente',
    type: EmailResponseDto,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TipoUsuario.ADMIN_SISTEMA)
  @Post('recordatorios/ejecutar')
  @HttpCode(HttpStatus.OK)
  async ejecutarRecordatorios(): Promise<EmailResponseDto> {
    // Ejecutar de forma asíncrona para no bloquear la respuesta
    setImmediate(() => {
      this.emailSchedulerService.enviarRecordatoriosViaje();
    });
    
    return {
      success: true,
      message: 'Proceso de recordatorios iniciado en segundo plano',
    };
  }
} 