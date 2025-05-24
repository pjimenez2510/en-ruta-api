import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { StandarResponse } from '../interfaces/standar-response.interface';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  private readonly errorHandlers: Record<
    string,
    (exception: Prisma.PrismaClientKnownRequestError) => {
      statusCode: number;
      error: string[];
      message: string;
    }
  > = {
    P2002: (exception: Prisma.PrismaClientKnownRequestError) => ({
      statusCode: HttpStatus.CONFLICT,
      error: [
        `Entrada duplicada detectada en el campo ${exception.meta?.target}`,
      ],
      message: 'Conflicto',
    }),

    P2003: (exception: Prisma.PrismaClientKnownRequestError) => ({
      statusCode: HttpStatus.BAD_REQUEST,
      error: [
        `Violación de restricción de clave externa en el campo ${exception.meta?.field_name}`,
      ],
      message: 'Clave externa inválida',
    }),

    P2025: (exception: Prisma.PrismaClientKnownRequestError) => ({
      statusCode: HttpStatus.NOT_FOUND,
      error: [
        `El recurso no fue encontrado para el parámetro de búsqueda en ${exception.meta?.modelName}`,
      ],
      message: 'No encontrado',
    }),

    P2016: (exception: Prisma.PrismaClientKnownRequestError) => ({
      statusCode: HttpStatus.BAD_REQUEST,
      error: ['El registro solicitado no existe en la base de datos'],
      message: 'Registro no encontrado',
    }),

    P2011: (exception: Prisma.PrismaClientKnownRequestError) => ({
      statusCode: HttpStatus.BAD_REQUEST,
      error: ['Valores null no permitidos en los campos especificados'],
      message: 'Campos no válidos',
    }),

    P2017: (exception: Prisma.PrismaClientKnownRequestError) => ({
      statusCode: HttpStatus.BAD_REQUEST,
      error: [
        'La consulta resultó en múltiples registros, cuando se esperaba solo uno',
      ],
      message: 'Resultado inesperado',
    }),

    P1000: (exception: Prisma.PrismaClientKnownRequestError) => ({
      statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      error: ['Autenticación fallida en la base de datos'],
      message: 'Conexión fallida',
    }),

    P1001: (exception: Prisma.PrismaClientKnownRequestError) => ({
      statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      error: [
        'No se pudo conectar a la base de datos antes de que se agotara el tiempo de espera',
      ],
      message: 'Timeout en la conexión',
    }),

    P1010: (exception: Prisma.PrismaClientKnownRequestError) => ({
      statusCode: HttpStatus.BAD_REQUEST,
      error: ['Error en la URL de conexión a la base de datos'],
      message: 'URL de conexión inválida',
    }),

    P2036: (exception: Prisma.PrismaClientKnownRequestError) => ({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: ['La transacción falló debido a un error inesperado'],
      message: 'Error de transacción',
    }),

    P2014: (exception: Prisma.PrismaClientKnownRequestError) => ({
      statusCode: HttpStatus.BAD_REQUEST,
      error: [
        'La modificación de varias tablas falló debido a una violación de integridad referencial',
      ],
      message: 'Integridad referencial',
    }),

    P2004: (exception: Prisma.PrismaClientKnownRequestError) => ({
      statusCode: HttpStatus.BAD_REQUEST,
      error: [
        'Consulta fallida debido a que se encontraron datos incorrectos en la base de datos',
      ],
      message: 'Datos incorrectos',
    }),

    P2005: (exception: Prisma.PrismaClientKnownRequestError) => ({
      statusCode: HttpStatus.BAD_REQUEST,
      error: [`El valor proporcionado para el campo es inválido`],
      message: 'Valor no válido',
    }),

    P2006: (exception: Prisma.PrismaClientKnownRequestError) => ({
      statusCode: HttpStatus.BAD_REQUEST,
      error: ['El valor proporcionado para un campo específico no es válido'],
      message: 'Valor inválido',
    }),

    P2007: (exception: Prisma.PrismaClientKnownRequestError) => ({
      statusCode: HttpStatus.BAD_REQUEST,
      error: ['Los datos proporcionados son inválidos para esta operación'],
      message: 'Datos inválidos',
    }),

    P2008: (exception: Prisma.PrismaClientKnownRequestError) => ({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: ['Fallo en la interpretación de la consulta'],
      message: 'Error de interpretación',
    }),

    P2009: (exception: Prisma.PrismaClientKnownRequestError) => ({
      statusCode: HttpStatus.BAD_REQUEST,
      error: ['La consulta enviada al servidor de base de datos no es válida'],
      message: 'Consulta inválida',
    }),

    P2012: (exception: Prisma.PrismaClientKnownRequestError) => ({
      statusCode: HttpStatus.BAD_REQUEST,
      error: ['La consulta especifica campos mutualmente excluyentes'],
      message: 'Campos no compatibles',
    }),
  };

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    console.log(exception);
    const handler = this.errorHandlers[exception.code];
    const { statusCode, message, error } = handler
      ? handler(exception)
      : {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Ocurrió un error inesperado',
          error: 'Error en el servidor',
        };

    const responseData = {
      statusCode,
      data: null,
      error,
      message,
    } as StandarResponse;

    response.status(statusCode).json(responseData);
  }
}
