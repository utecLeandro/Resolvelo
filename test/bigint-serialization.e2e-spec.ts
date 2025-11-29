import { Test } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

class BigIntSerializerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const serialize = (v: any): any => {
      if (typeof v === 'bigint') return v.toString();
      if (Array.isArray(v)) return v.map(serialize);
      if (v && typeof v === 'object') {
        const out: any = {};
        for (const k of Object.keys(v)) out[k] = serialize(v[k]);
        return out;
      }
      return v;
    };
    return next.handle().pipe(map((data) => serialize(data)));
  }
}

class FakePrismaService {
  publicacion = {
    findMany: async (_args: any) => {
      return [
        {
          id: BigInt(1001),
          titulo: 'Guitarra Eléctrica',
          descripcion: 'Guitarra de alta gama',
          categoria: 'GUITARRA',
          precioPorDia: 25.5,
          propietario: {
            id: BigInt(2001),
            nombre: 'Ana',
            apellido: 'López',
            email: 'ana@example.com',
          },
          imagenes: [
            {
              id: BigInt(3001),
              url: 'https://cdn/img1.jpg',
              esPrincipal: true,
            },
          ],
          _count: { reservas: 0, calificaciones: 0 },
        },
      ];
    },
    count: async (_args: any) => 1,
  };

  usuario = {
    findUnique: async (_args: any) => {
      return {
        id: BigInt(9001),
        nombre: 'Carlos',
        apellido: 'Pérez',
        email: 'carlos@example.com',
        telefono: '099123456',
        direccion: 'Av. Siempre Viva 123',
        ciudad: 'Montevideo',
        departamento: 'Montevideo',
        codigoPostal: '11000',
        avatarUrl: null,
        perfilPublico: true,
        estadoVerificacion: 'VERIFICADO',
        documentoIdentidad: '5.123.456-7',
      };
    },
  };
}

describe('Serialización BigInt en respuestas (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(new FakePrismaService())
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalInterceptors(new BigIntSerializerInterceptor());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/publicaciones convierte BigInt a string', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/publicaciones')
      .expect(200);
    const pubs = res.body.publicaciones;
    expect(Array.isArray(pubs)).toBe(true);
    expect(typeof pubs[0].id).toBe('string');
    expect(typeof pubs[0].propietario.id).toBe('string');
    expect(typeof pubs[0].imagenes[0].id).toBe('string');
  });

  it('GET /api/usuarios/:id convierte BigInt a string', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/usuarios/9001')
      .expect(200);
    const usuario = res.body;
    expect(typeof usuario.id).toBe('string');
  });
});
