import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

// Implementación en memoria para PrismaService
class FakePrismaService {
  private usuarios: any[] = [];
  private publicaciones: any[] = [];
  private imagenes: any[] = [];

  constructor() {
    // Usuario de prueba
    this.usuarios.push({
      id: BigInt(1),
      email: 'test@example.com',
      passwordHash: 'hash',
      passwordSalt: 'salt',
      nombre: 'Test',
      apellido: 'User',
      activo: true,
      rol: 'USUARIO',
    });
  }

  usuario = {
    findUnique: async ({ where }: { where: any }) => {
      if (where.id) {
        return this.usuarios.find((u) => u.id === where.id) || null;
      }
      if (where.email) {
        return this.usuarios.find((u) => u.email === where.email) || null;
      }
      return null;
    },
  };

  publicacion = {
    create: async ({ data }: { data: any }) => {
      const created = {
        id: BigInt(this.publicaciones.length + 1),
        ...data,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        imagenes: [],
        reservas: [],
        propietario: this.usuarios.find((u) => u.id === data.propietarioId),
        _count: { reservas: 0, calificaciones: 0 },
      };
      this.publicaciones.push(created);
      return created;
    },
    findMany: async ({ where, skip, take }: any) => {
      // Filtrado simple para tests
      let result = [...this.publicaciones];
      if (where.propietarioId) {
        result = result.filter((p) => p.propietarioId === where.propietarioId);
      }
      // Paginación
      if (skip !== undefined && take !== undefined) {
        result = result.slice(skip, skip + take);
      }
      return result;
    },
    count: async ({ where }: any) => {
      let result = [...this.publicaciones];
      if (where.propietarioId) {
        result = result.filter((p) => p.propietarioId === where.propietarioId);
      }
      return result.length;
    },
    findUnique: async ({ where }: any) => {
      const pub = this.publicaciones.find((p) => p.id === where.id);
      if (!pub) return null;
      return {
        ...pub,
        imagenes: this.imagenes.filter((i) => i.publicacionId === pub.id),
      };
    },
    update: async ({ where, data }: any) => {
      const index = this.publicaciones.findIndex((p) => p.id === where.id);
      if (index === -1) throw new Error('Not found');
      const updated = { ...this.publicaciones[index], ...data };
      this.publicaciones[index] = updated;
      return updated;
    },
  };

  imagenPublicacion = {
    create: async ({ data }: any) => {
      const created = {
        id: BigInt(this.imagenes.length + 1),
        ...data,
      };
      this.imagenes.push(created);
      return created;
    },
    findMany: async ({ where }: any) => {
      return this.imagenes.filter(
        (i) => i.publicacionId === where.publicacionId,
      );
    },
    delete: async ({ where }: any) => {
      const index = this.imagenes.findIndex((i) => i.id === where.id);
      if (index > -1) {
        this.imagenes.splice(index, 1);
        return { id: where.id };
      }
      throw new Error('Image not found');
    },
  };
}

describe('Publicaciones (E2E)', () => {
  let app: INestApplication;
  let prisma: FakePrismaService;
  let jwtService: JwtService;
  let token: string;

  beforeAll(async () => {
    const fakePrisma = new FakePrismaService();
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(fakePrisma)
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );

    // Configurar serialización de BigInt
    (BigInt.prototype as any).toJSON = function () {
      return this.toString();
    };

    await app.init();

    prisma = app.get(PrismaService) as unknown as FakePrismaService;
    jwtService = app.get(JwtService);

    // Generar token para usuario de prueba (ID 1)
    token = jwtService.sign({
      sub: '1',
      email: 'test@example.com',
      rol: 'USUARIO',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/publicaciones (POST) - Crear publicación', async () => {
    const nuevaPublicacion = {
      titulo: 'Guitarra Fender Stratocaster',
      descripcion: 'Guitarra eléctrica en excelente estado',
      categoria: 'GUITARRAS',
      precioPorDia: 500,
      direccion: 'Av. 18 de Julio 1234',
      ciudad: 'Montevideo',
      departamento: 'Montevideo',
      estadoEquipo: 'USADO',
      entregaDomicilio: true,
      retiroLocal: true,
    };

    const res = await request(app.getHttpServer())
      .post('/api/publicaciones')
      .set('Authorization', `Bearer ${token}`)
      .send(nuevaPublicacion)
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.titulo).toBe(nuevaPublicacion.titulo);
    expect(res.body.propietarioId).toBe('1');
  });

  it('/api/publicaciones (GET) - Listar publicaciones', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/publicaciones')
      .expect(200);

    expect(res.body).toHaveProperty('publicaciones');
    expect(Array.isArray(res.body.publicaciones)).toBe(true);
    expect(res.body.publicaciones.length).toBeGreaterThan(0);
    expect(res.body.paginacion).toBeDefined();
  });

  it('/api/publicaciones/:id (GET) - Obtener publicación por ID', async () => {
    // Asumiendo que la publicación creada tiene ID 1
    const res = await request(app.getHttpServer())
      .get('/api/publicaciones/1')
      .expect(200);

    expect(res.body).toHaveProperty('id', '1');
    expect(res.body).toHaveProperty('titulo');
  });

  it('/api/publicaciones/mis-publicaciones (GET) - Mis publicaciones', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/publicaciones/mis-publicaciones')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].propietarioId).toBe('1');
  });

  it('/api/publicaciones/:id (PATCH) - Actualizar publicación', async () => {
    const actualizacion = {
      titulo: 'Guitarra Fender Stratocaster Modificada',
      precioPorDia: 600,
    };

    const res = await request(app.getHttpServer())
      .patch('/api/publicaciones/1')
      .set('Authorization', `Bearer ${token}`)
      .send(actualizacion)
      .expect(200);

    expect(res.body.titulo).toBe(actualizacion.titulo);
    expect(Number(res.body.precioPorDia)).toBe(actualizacion.precioPorDia);
  });
});
