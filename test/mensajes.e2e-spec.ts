import { Test } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  CanActivate,
  ExecutionContext,
  NestInterceptor,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { MensajesModule } from '../src/mensajes/mensajes.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';

class FakePrismaService {
  mensajes: any[] = [];
  reservas: any[] = [
    {
      id: BigInt(1),
      usuarioId: BigInt(10),
      propietarioId: BigInt(20),
      publicacionId: BigInt(100),
    },
  ];
  usuarios: any[] = [
    { id: '10', email: 'borrower@test.com', nombre: 'Borrower' },
    { id: '20', email: 'owner@test.com', nombre: 'Owner' },
  ];

  mensaje = {
    count: async ({ where: { reservaId } }: any) =>
      this.mensajes.filter((m) => m.reservaId === reservaId).length,
    create: async ({ data }: any) => {
      const msg = {
        id: `msg_${Date.now()}`,
        fechaCreacion: new Date().toISOString(),
        leido: false,
        ...data,
      };
      this.mensajes.push(msg);
      return msg;
    },
    updateMany: async ({
      where: { reservaId, receptorId, leido },
      data: { leido: nuevoLeido, fechaLectura },
    }: any) => {
      const upd = this.mensajes.filter(
        (m) =>
          m.reservaId === reservaId &&
          m.receptorId === receptorId &&
          m.leido === leido,
      );
      upd.forEach((m) => {
        m.leido = nuevoLeido;
        m.fechaLectura = fechaLectura;
      });
      return { count: upd.length };
    },
    findMany: async ({ where: { reservaId }, orderBy }: any) => {
      const arr = this.mensajes.filter((m) => m.reservaId === reservaId);
      if (orderBy?.fechaCreacion === 'asc')
        arr.sort((a, b) => a.fechaCreacion.localeCompare(b.fechaCreacion));
      if (orderBy?.fechaCreacion === 'desc')
        arr.sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion));
      return arr;
    },
  };

  reserva = {
    findUnique: async ({ where: { id }, select, include }: any) => {
      const key = typeof id === 'bigint' ? id : BigInt(id);
      const r = this.reservas.find((r) => r.id === key);
      if (!r) return null;
      if (include?.publicacion)
        return { ...r, publicacion: { titulo: 'Dummy Pub' } };
      if (select) {
        const picked: any = {};
        Object.keys(select).forEach((k) => {
          if (select[k]) picked[k] = (r as any)[k];
        });
        return picked;
      }
      return r;
    },
  };

  usuario = {
    findUnique: async ({ where: { id }, select }: any) => {
      const key = String(id);
      const u = this.usuarios.find((u) => u.id === key);
      if (!u) return null;
      if (select) {
        const picked: any = {};
        Object.keys(select).forEach((k) => {
          if (select[k]) picked[k] = (u as any)[k];
        });
        return picked;
      }
      return u;
    },
  };
}

class AllowGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = { id: '10' };
    return true;
  }
}

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

describe('Mensajes (E2E)', () => {
  let app: INestApplication;
  let _prisma: FakePrismaService;
  const _jwtService = { sign: (p: any) => 'fake_token_' + p.sub };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, MensajesModule],
    })
      .overrideProvider(PrismaService)
      .useClass(FakePrismaService)
      .overrideGuard(JwtAuthGuard)
      .useClass(AllowGuard)
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalInterceptors(new BigIntSerializerInterceptor());
    await app.init();

    _prisma = app.get(PrismaService) as unknown as FakePrismaService;
  });

  afterAll(async () => {
    await app.close();
  });

  it('debería listar vacío al inicio', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/mensajes/reserva/1')
      .expect(200);
    expect(res.body).toHaveProperty('mensajes');
    expect(Array.isArray(res.body.mensajes)).toBe(true);
    expect(res.body.mensajes.length).toBe(0);
  });

  it('debería enviar y devolver el mensaje creado', async () => {
    const payload = { reservaId: '1', contenido: 'Hola desde E2E' };
    const res = await request(app.getHttpServer())
      .post('/api/mensajes/enviar')
      .send(payload)
      .expect(201);
    expect(res.body).toHaveProperty('mensaje');
    expect(res.body.mensaje.contenido).toBe(payload.contenido);
    expect(res.body.mensaje.reservaId).toBe(payload.reservaId);
    expect(res.body.mensaje.emisorId).toBe('10');
  });

  it('debería listar el mensaje después del envío', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/mensajes/reserva/1')
      .expect(200);
    expect(res.body.mensajes.length).toBe(1);
    expect(res.body.mensajes[0].contenido).toBe('Hola desde E2E');
  });
});
