import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

class FakePrismaService {
  private usuarios: any[] = [];

  usuario = {
    create: async ({ data }: { data: any }) => {
      const created = { id: `usr_${Date.now()}`, rol: 'USUARIO', ...data };
      this.usuarios.push(created);
      return created;
    },
    findUnique: async ({ where }: { where: { email?: string } }) => {
      if (where.email)
        return this.usuarios.find((u) => u.email === where.email) || null;
      return null;
    },
    findFirst: async ({ where }: { where: any }) => {
      const keys = Object.keys(where);
      return (
        this.usuarios.find((u) => keys.every((k) => u[k] === where[k])) || null
      );
    },
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const idx = this.usuarios.findIndex((u) => u.id === where.id);
      if (idx === -1) return null;
      this.usuarios[idx] = { ...this.usuarios[idx], ...data };
      return this.usuarios[idx];
    },
  };
}

describe('Auth - GubUy Validate (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const fake = new FakePrismaService();
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(fake)
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    const prisma = app.get(PrismaService) as any;
    const hash = await bcrypt.hash('JuanTest2024!', 12);
    await prisma.usuario.create({
      data: {
        nombre: 'Juan',
        apellido: 'Perez',
        email: 'juan@test.com',
        documentoIdentidad: '1234567-8',
        passwordHash: hash,
        passwordSalt: 'salt',
        estadoVerificacion: 'VERIFICADA',
        emailVerificado: true,
        activo: true,
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('Debería validar datos completos y devolver token', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/gubuy/validate')
      .send({
        nombre: 'Juan',
        apellido: 'Perez',
        documentoIdentidad: '1234567-8',
        email: 'juan@test.com',
        password: 'JuanTest2024!',
      })
      .expect(200);

    expect(res.body).toHaveProperty('access_token');
    expect(res.body).toHaveProperty('user.email', 'juan@test.com');
  });

  it('Debería rechazar acceso si estadoVerificacion PENDIENTE', async () => {
    const prisma = app.get(PrismaService) as any;
    const hash = await bcrypt.hash('MariaTest2024!', 12);
    await prisma.usuario.create({
      data: {
        nombre: 'Maria',
        apellido: 'Gomez',
        email: 'maria@test.com',
        documentoIdentidad: '9876543-1',
        passwordHash: hash,
        passwordSalt: 'salt',
        estadoVerificacion: 'PENDIENTE',
        emailVerificado: true,
        activo: true,
      },
    });

    const res = await request(app.getHttpServer())
      .post('/api/auth/gubuy/validate')
      .send({
        nombre: 'Maria',
        apellido: 'Gomez',
        documentoIdentidad: '9876543-1',
        email: 'maria@test.com',
        password: 'MariaTest2024!',
      })
      .expect(403);

    expect(res.body).toHaveProperty('message');
  });
});
