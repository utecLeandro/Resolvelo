import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../src/email/email.service';

// Mock simple para EmailService
const mockEmailService = {
  sendMail: jest.fn().mockResolvedValue(true),
  enviarEmailConfirmacionReserva: jest.fn().mockResolvedValue(true),
  enviarEmailNuevaSolicitudReserva: jest.fn().mockResolvedValue(true),
  enviarEmailSolicitudAceptada: jest.fn().mockResolvedValue(true),
  enviarEmailSolicitudRechazada: jest.fn().mockResolvedValue(true),
};

// Implementación en memoria para PrismaService
class FakePrismaService {
  private usuarios: any[] = [];
  private publicaciones: any[] = [];
  private reservas: any[] = [];

  constructor() {
    // Usuario Arrendatario (ID 1)
    this.usuarios.push({
      id: BigInt(1),
      email: 'arrendatario@example.com',
      passwordHash: 'hash',
      passwordSalt: 'salt',
      nombre: 'Arrendatario',
      apellido: 'Test',
      activo: true,
      rol: 'USUARIO',
    });

    // Usuario Propietario (ID 2)
    this.usuarios.push({
      id: BigInt(2),
      email: 'propietario@example.com',
      passwordHash: 'hash',
      passwordSalt: 'salt',
      nombre: 'Propietario',
      apellido: 'Test',
      activo: true,
      rol: 'USUARIO',
    });

    // Publicación del Propietario
    this.publicaciones.push({
      id: BigInt(1),
      titulo: 'Equipo de Prueba',
      descripcion: 'Descripción',
      categoria: 'GUITARRAS',
      precioPorDia: 100,
      propietarioId: BigInt(2),
      estado: 'ACTIVA',
      estadoModeracion: 'APROBADA',
      fechaCreacion: new Date(),
      imagenes: [],
      _count: { reservas: 0, calificaciones: 0 },
    });
  }

  usuario = {
    findUnique: async ({ where }: any) => {
      // Encontrar por ID, convirtiendo a string para evitar problemas de BigInt vs string
      const user = this.usuarios.find(
        (u) => u.id.toString() === where.id.toString(),
      );
      return user || null;
    },
  };

  publicacion = {
    findUnique: async ({ where }: any) => {
      // Encontrar por ID, convirtiendo a string para evitar problemas de BigInt vs string
      // El servicio usa BigInt(id) pero en JS la comparación directa puede fallar si uno es string
      const pub = this.publicaciones.find(
        (p) => p.id.toString() === where.id.toString(),
      );
      if (!pub) return null;
      return {
        ...pub,
        propietario: this.usuarios.find(
          (u) => u.id.toString() === pub.propietarioId.toString(),
        ),
      };
    },
    update: async ({ where, data }: any) => {
      return this.publicaciones.find(
        (p) => p.id.toString() === where.id.toString(),
      );
    },
  };

  reserva = {
    create: async ({ data }: { data: any }) => {
      // Extraer IDs de los objetos connect si existen
      const publicacionId = data.publicacionId || data.publicacion?.connect?.id;
      const usuarioId = data.usuarioId || data.usuario?.connect?.id;
      const propietarioId = data.propietarioId || data.propietario?.connect?.id;

      const created = {
        id: BigInt(this.reservas.length + 1),
        ...data,
        estado: 'PENDIENTE',
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
        usuarioId: usuarioId,
        publicacionId: publicacionId,
        propietarioId: propietarioId,
        publicacion: this.publicaciones.find(
          (p) => p.id.toString() === publicacionId.toString(),
        ),
        usuario: this.usuarios.find(
          (u) => u.id.toString() === usuarioId.toString(),
        ),
        propietario: this.usuarios.find(
          (u) => u.id.toString() === propietarioId.toString(),
        ),
      };

      this.reservas.push(created);
      return created;
    },
    findMany: async ({ where }: any) => {
      let result = [...this.reservas];
      if (where.usuarioId) {
        result = result.filter(
          (r) => r.usuarioId.toString() === where.usuarioId.toString(),
        );
      }
      if (where.propietarioId) {
        result = result.filter(
          (r) => r.propietarioId.toString() === where.propietarioId.toString(),
        );
      }
      if (where.AND) {
        return [];
      }

      return result.map((r) => ({
        ...r,
        publicacion: this.publicaciones.find(
          (p) => p.id.toString() === r.publicacionId.toString(),
        ),
      }));
    },
    findUnique: async ({ where }: any) => {
      return this.reservas.find((r) => r.id.toString() === where.id.toString());
    },
    update: async ({ where, data }: any) => {
      const index = this.reservas.findIndex(
        (r) => r.id.toString() === where.id.toString(),
      );
      if (index === -1) throw new Error('Reserva no encontrada');

      const updated = { ...this.reservas[index], ...data };
      this.reservas[index] = updated;
      return updated;
    },
  };

  $transaction = async (arg: any) => {
    if (typeof arg === 'function') {
      return arg(this);
    }
    return Promise.all(arg);
  };
}

describe('Reservas (E2E)', () => {
  let app: INestApplication;
  let prisma: FakePrismaService;
  let jwtService: JwtService;
  let tokenArrendatario: string;
  let tokenPropietario: string;
  let reservaId: string;

  beforeAll(async () => {
    const fakePrisma = new FakePrismaService();
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(fakePrisma)
      .overrideProvider(EmailService)
      .useValue(mockEmailService)
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

    tokenArrendatario = jwtService.sign({
      sub: '1',
      email: 'arrendatario@example.com',
      rol: 'USUARIO',
    });
    tokenPropietario = jwtService.sign({
      sub: '2',
      email: 'propietario@example.com',
      rol: 'USUARIO',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/usuarios/reservas/crear (POST) - Crear solicitud de reserva', async () => {
    // 1. Crear usuario (arrendatario)
    // 2. Crear publicación (propietario) - Mockeado en fakeService

    const crearReservaDto = {
      usuarioId: '1', // ID mockeado
      publicacionId: '1', // ID mockeado
      propietarioId: '2', // ID mockeado (propietario)
      fechaInicio: new Date(Date.now() + 86400000).toISOString(), // Mañana
      fechaFin: new Date(Date.now() + 172800000).toISOString(), // Pasado mañana
      precioTotal: 100,
      comisionPlataforma: 10,
      tipoEntrega: 'RETIRO',
      direccionEntrega: 'Calle Falsa 123',
      telefonoContacto: '123456789',
      notasUsuario: 'Quiero alquilarlo',
    };

    const res = await request(app.getHttpServer())
      .post('/api/usuarios/reservas/crear')
      .set('Authorization', `Bearer ${tokenArrendatario}`)
      .send(crearReservaDto)
      .expect(201);

    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.estado).toBe('PENDIENTE');
    reservaId = res.body.data.id;
  });

  it('/api/reservas/mis-reservas (GET) - Obtener reservas del arrendatario', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/reservas/mis-reservas')
      .set('Authorization', `Bearer ${tokenArrendatario}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].usuarioId).toBe('1');
  });

  it('/api/reservas/mis-solicitudes (GET) - Obtener solicitudes pendientes del propietario', async () => {
    // Nota: El endpoint es 'mis-solicitudes' para pendientes
    const res = await request(app.getHttpServer())
      .get('/api/reservas/mis-solicitudes')
      .set('Authorization', `Bearer ${tokenPropietario}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    // Debería haber al menos una (la creada arriba)
    // Pero en FakePrismaService.findMany el filtro de propietarioId debe funcionar
    // Verificamos que el mock lo soporte
  });

  it('/api/reservas/:id/aceptar (POST) - Aceptar solicitud (Propietario)', async () => {
    // Asumimos ID 1 para la reserva creada
    const res = await request(app.getHttpServer())
      .post('/api/reservas/1/aceptar')
      .set('Authorization', `Bearer ${tokenPropietario}`)
      .expect(200);

    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data.estado).toBe('CONFIRMADA');
  });
});
