import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception';
import { PrismaClientExceptionFilter } from './common/filters/prisma-exception';
import { TransformInterceptor } from './common/interceptors/transform';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new PrismaClientExceptionFilter());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('API de EnRuta')
    .setDescription('API para el sistema de cooperativas de transporte EnRuta')
    .setVersion('1.0')
    .addTag('auth', 'Autenticación y autorización')
    .addTag('tenants', 'Gestión de cooperativas')
    .addTag('usuarios', 'Gestión de usuarios')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: '*',
  });

  Logger.log(
    `API En Ruta escuchando en el puerto ${process.env.PORT ?? 3000}`,
    'En Ruta API',
  );
  Logger.log(
    `Documentacion en http://localhost:${process.env.PORT ?? 3000}/api`,
    'En Ruta API',
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
