/**
 * Punto de entrada de la aplicación NestJS.
 * Se configura la app con buenas prácticas de seguridad y CORS.
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar validaciones globales
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Elimina propiedades no definidas en el DTO
    forbidNonWhitelisted: true, // Lanza error si hay propiedades no permitidas
    transform: true, // Transforma automáticamente los tipos
    disableErrorMessages: false, // Mantiene mensajes de error detallados
  }));

  // Habilitar CORS siguiendo configuración de entorno
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  });

  // Prefijo global para la API
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT || 3000);
}
bootstrap();