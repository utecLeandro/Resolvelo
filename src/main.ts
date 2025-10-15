/**
 * Punto de entrada de la aplicación NestJS.
 * Se configura la app con buenas prácticas de seguridad y CORS.
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as cors from 'cors';

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
    // Desarrollo: permitir cualquier origen (sin credenciales)
    app.use(cors({
      origin: '*',
      credentials: false,
      methods: ['GET','HEAD','PUT','PATCH','POST','DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }));

    // Middleware adicional para asegurar que el header Access-Control-Allow-Origin se envíe
    app.use((req, res, next) => {
      const origin = req.headers.origin as string | undefined;
      res.header('Access-Control-Allow-Origin', origin || '*');
      res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      // Aunque credentials estén deshabilitados en desarrollo, algunos navegadores requieren el header definido
      res.header('Access-Control-Allow-Credentials', 'true');
      next();
    });
  }

  // Prefijo global para la API
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT || 3000);
}
bootstrap();