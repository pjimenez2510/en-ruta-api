import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('En Ruta API')
    .addBearerAuth()
    .addSecurityRequirements('bearerAuth')
    .setDescription('API para la gestión de transporte interprovincial')
    .setVersion('1.0')
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
  //documentacion
  Logger.log(
    `Documentacion en http://localhost:${process.env.PORT ?? 3000}/api`,
    'En Ruta API',
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
