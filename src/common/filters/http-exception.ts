import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { StandarResponse } from '../interfaces/standar-response.interface';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly typesError: Record<number, string> = {
    400: 'Mala solicitud',
    401: 'No autorizado',
    402: 'Pago no autorizado',
    403: 'Prohibido',
    404: 'No encontrado',
    405: 'Método no permitido',
    406: 'No aceptado',
    407: 'Autenticación de proxy requerida',
    408: 'Tiempo de espera excedido',
    409: 'Conflicto',
    410: 'No disponible',
    411: 'Tamaño requerido',
    412: 'Precondición requerida',
    413: 'Solicitud demasiado larga',
    414: 'URI demasiado larga',
    415: 'Tipo de medio no soportado',
    416: 'Rango no satisfactorio',
    417: 'Especificación de lenguaje requerida',
    418: 'URI no específico',
    421: 'URI no encontrado',
    422: 'Entidad validación',
    423: 'Cerrado',
    500: 'Error interno del servidor',
    501: 'No implementado',
    502: 'Paso de la red',
    503: 'Servicio no disponible',
    504: 'Tiempo de espera excedido',
    505: 'Versión HTTP no soportada',
    506: 'Variante negociada no disponible',
    507: 'Archivo de error interno',
    508: 'Loop detectado',
    510: 'Nota de respuesta',
  };
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const errorResponse = exception.getResponse() as any;
    const error = errorResponse?.message;
    const message = this.typesError[status] || errorResponse?.error;

    const responseData = {
      statusCode: status,
      error,
      message,
      data: null,
    } as StandarResponse;

    response.status(status).json(responseData);
  }
}
