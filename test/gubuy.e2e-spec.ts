import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
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
    findUnique: async ({
      where,
    }: {
      where: { id?: string; email?: string };
    }) => {
      if (where.id) return this.usuarios.find((u) => u.id === where.id) || null;
      if (where.email)
        return this.usuarios.find((u) => u.email === where.email) || null;
      return null;
    },
    findFirst: async ({ where }: { where: any }) => {
      if (!where) return this.usuarios[0] || null;
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

describe('Auth - GubUy Simulado (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.GUBUY_SIMULATED = 'true';
    const fake = new FakePrismaService();
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(fake)
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Debería completar authorize -> token -> profile', async () => {
    const redirectUri = 'http://localhost/callback';
    const authorize = await request(app.getHttpServer())
      .get(
        `/api/auth/gubuy/authorize?redirect_uri=${encodeURIComponent(redirectUri)}&state=abc`,
      )
      .expect(302);

    const location = authorize.header['location'] as string;
    expect(location).toContain(redirectUri);
    const codeMatch = location.match(/[?&]code=([^&]+)/);
    expect(codeMatch).not.toBeNull();
    const code = decodeURIComponent(codeMatch![1]);

    const email = `gubuy_${code}@resolvelo.local`;
    const prisma = app.get(PrismaService) as any;
    await prisma.usuario.create({
      data: {
        id: 'usr_e2e_gubuy',
        nombre: 'Usuario',
        apellido: 'Gubuy',
        email,
        documentoIdentidad: '1.111.111-1',
        rol: 'USUARIO',
        passwordHash: 'hash',
        passwordSalt: 'salt',
        estadoVerificacion: 'VERIFICADA',
        emailVerificado: true,
        telefonoVerificado: false,
        perfilPublico: true,
        activo: true,
      },
    });

    const tokenRes = await request(app.getHttpServer())
      .post('/api/auth/gubuy/token')
      .send({ code, redirect_uri: redirectUri })
      .expect(200);

    expect(tokenRes.body).toHaveProperty('access_token');
    expect(tokenRes.body).toHaveProperty('user.email');

    const profileRes = await request(app.getHttpServer())
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${tokenRes.body.access_token}`)
      .expect(200);

    expect(profileRes.body).toHaveProperty('id');
    expect(profileRes.body).toHaveProperty('email');
  });

  it('Debería retornar 403 si usuario no verificado', async () => {
    const redirectUri = 'http://localhost/callback';
    const authorize = await request(app.getHttpServer())
      .get(
        `/api/auth/gubuy/authorize?redirect_uri=${encodeURIComponent(redirectUri)}&state=xyz`,
      )
      .expect(302);

    const location = authorize.header['location'] as string;
    const codeMatch = location.match(/[?&]code=([^&]+)/);
    const code = decodeURIComponent(codeMatch![1]);
    const email = `gubuy_${code}@resolvelo.local`;

    const prisma = app.get(PrismaService) as any;
    await prisma.usuario.create({
      data: {
        id: 'usr_e2e_gubuy_pend',
        nombre: 'Usuario',
        apellido: 'Gubuy',
        email,
        documentoIdentidad: '1.234.567-2',
        rol: 'USUARIO',
        passwordHash: 'hash',
        passwordSalt: 'salt',
        estadoVerificacion: 'PENDIENTE',
        emailVerificado: true,
        telefonoVerificado: false,
        perfilPublico: true,
        activo: true,
      },
    });

    await request(app.getHttpServer())
      .post('/api/auth/gubuy/token')
      .send({ code, redirect_uri: redirectUri })
      .expect(403);
  });
});
