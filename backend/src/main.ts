import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Trust proxy — necesario detrás de un load balancer para obtener IPs reales
  app.getHttpAdapter().getInstance().set('trust proxy', true);

  // 2. Prefijo global — todas las rutas comienzan con /api
  app.setGlobalPrefix('api');

  // 3. Validación global — rechaza propiedades desconocidas automáticamente
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // Elimina propiedades no declaradas en el DTO
      forbidNonWhitelisted: true,   // Lanza error si llegan propiedades extra
    }),
  );

  // 4. CORS — habilitado para todos los orígenes
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: false,
  });

  // 5. Swagger / OpenAPI
  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('Documentacion de la API')
    .setVersion('1.0')
    .addTag('api')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        description:
          'Introduce el token devuelto por /api/auth/login en el formato: Bearer <token>',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,  // El token se mantiene en el navegador al recargar
    },
  });

  // Endpoint para descargar el JSON del Swagger
  app.getHttpAdapter().get('/api/docs-json', (req, res) => {
    res.json(document);
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Aplicación corriendo en: http://localhost:${process.env.PORT ?? 3000}/api`);
  console.log(`Swagger UI: http://localhost:${process.env.PORT ?? 3000}/api/docs`);
}
bootstrap();
