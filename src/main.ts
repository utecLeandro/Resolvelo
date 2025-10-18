/**
 * Punto de entrada de la aplicación NestJS.
 * Se configura la app con buenas prácticas de seguridad y CORS.
 */
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import cors from 'cors';
import type { Request, Response, NextFunction } from 'express';

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
  // Si CORS_ORIGIN no está definido, reflejamos el origen en desarrollo para evitar bloqueos
  const corsOriginEnv = process.env.CORS_ORIGIN;
  const allowedOrigins = corsOriginEnv ? corsOriginEnv.split(',').map(o => o.trim()) : [];

  if (allowedOrigins.length > 0) {
    // Producción / configuración explícita
    app.enableCors({
      origin: allowedOrigins,
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      allowedHeaders: 'Content-Type, Authorization',
    });
  } else {
    // Desarrollo: reflejar el origen para que el navegador reciba Access-Control-Allow-Origin correcto
    app.enableCors({
      origin: true, // refleja el Origin recibido
      credentials: false,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      allowedHeaders: 'Content-Type, Authorization',
    });
  }

  // Prefijo global para la API
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT || 3000);
}
bootstrap();