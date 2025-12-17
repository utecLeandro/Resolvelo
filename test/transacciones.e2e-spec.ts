import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('Transacciones (E2E)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let tokenArrendatario: string;

  // Mock Data
  const mockUsuarios = [
    {
      id: 1n,
      email: 'arrendatario@test.com',
      nombre: 'Arrendatario',
      apellido: 'Test',
    },
    {
      id: 2n,
      email: 'propietario@test.com',
      nombre: 'Propietario',
      apellido: 'Test',
    },
  ];

  const mockPublicacion = {
    id: 1n,
    titulo: 'Cámara DSLR',
    precioPorDia: 50,
    propietarioId: 2n,
  };

  const mockReserva = {
    id: 1n,
    usuarioId: 1n,
    publicacionId: 1n,
    propietarioId: 2n,
    fechaInicio: new Date('2024-01-01'),
    fechaFin: new Date('2024-01-03'), // 3 días -> 150 total
    estado: 'CONFIRMADA',
    usuario: mockUsuarios[0],
    publicacion: mockPublicacion,
  };

  const mockTransacciones: any[] = [];

  const fakePrismaService = {
    reserva: {
      findUnique: async ({ where, include }: any) => {
        console.log('🔍 [MOCK] reserva.findUnique where:', where);
        if (where.id && where.id.toString() === mockReserva.id.toString()) {
          console.log('✅ [MOCK] Reserva encontrada');
          const res = { ...mockReserva };
          // Incluir datos si se solicitan
          if (include?.publicacion) res['publicacion'] = mockPublicacion;
          if (include?.usuario) res['usuario'] = mockUsuarios[0];
          return res;
        }
        console.log('❌ [MOCK] Reserva NO encontrada');
        return null;
      },
      update: async ({ where, data }: any) => {
        if (where.id.toString() === mockReserva.id.toString()) {
          if (data.estado) mockReserva.estado = data.estado;
          return mockReserva;
        }
        return null;
      },
    },
    transaccion: {
      findFirst: async ({ where }: any) => {
        return mockTransacciones.find(
          (t) =>
            t.reservaId.toString() === where.reservaId.toString() &&
            t.estado === where.estado,
        );
      },
      create: async ({ data }: any) => {
        const nuevaTransaccion = {
          id: BigInt(mockTransacciones.length + 1),
          ...data,
          reservaId: data.reservaId,
        };
        mockTransacciones.push(nuevaTransaccion);
        return nuevaTransaccion;
      },
      update: async ({ where, data }: any) => {
        const index = mockTransacciones.findIndex(
          (t) => t.id.toString() === where.id.toString(),
        );
        if (index !== -1) {
          mockTransacciones[index] = { ...mockTransacciones[index], ...data };
          return mockTransacciones[index];
        }
        return null;
      },
    },
    usuario: {
      findUnique: async ({ where }: any) => {
        const user = mockUsuarios.find(
          (u) => u.id.toString() === where.id.toString(),
        );
        return user || null;
      },
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(fakePrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');

    // Configurar JWT para generar tokens
    jwtService = moduleFixture.get<JwtService>(JwtService);
    tokenArrendatario = jwtService.sign(
      {
        sub: '1',
        email: 'arrendatario@test.com',
        rol: 'USUARIO',
      },
      { secret: process.env.JWT_SECRET || 'secretKey' },
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/transacciones/procesar-pago (POST) - Procesar pago exitosamente', async () => {
    const procesarPagoDto = {
      reservaId: '1',
      metodoPago: 'TARJETA_CREDITO',
      descripcion: 'Pago de prueba',
    };

    const res = await request(app.getHttpServer())
      .post('/api/transacciones/procesar-pago')
      .set('Authorization', `Bearer ${tokenArrendatario}`)
      .send(procesarPagoDto)
      .expect(201);

    expect(res.body).toHaveProperty('exito', true);
    expect(res.body).toHaveProperty('transaccionId');
    expect(res.body.mensaje).toContain('simulado');

    // Verificar que la transacción se creó y completó en el mock
    const transaccion = mockTransacciones.find(
      (t) => t.reservaId.toString() === '1',
    );
    expect(transaccion).toBeDefined();
    expect(transaccion.estado).toBe('COMPLETADA');
    expect(transaccion.monto).toBe(150); // 3 días * 50
  });

  it('/api/transacciones/procesar-pago (POST) - Fallar si ya existe pago', async () => {
    // Intentar pagar de nuevo la misma reserva
    const procesarPagoDto = {
      reservaId: '1',
      metodoPago: 'TARJETA_CREDITO',
    };

    await request(app.getHttpServer())
      .post('/api/transacciones/procesar-pago')
      .set('Authorization', `Bearer ${tokenArrendatario}`)
      .send(procesarPagoDto)
      .expect(400); // Bad Request porque ya existe
  });
});
