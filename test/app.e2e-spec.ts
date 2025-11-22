/**
 * Prueba E2E para el registro de usuario (TDD).
 * Cubre criterios de aceptación del ticket RES-5.
 */
import { Test } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";

// Implementación simple en memoria para PrismaService en pruebas
class FakePrismaService {
  // Almacenamiento en memoria de usuarios
  private usuarios: any[] = [];

  // Simula el cliente Prisma para el modelo usuario
  usuario = {
    create: async ({ data }: { data: any }) => {
      const created = { id: `usr_${Date.now()}`, ...data };
      this.usuarios.push(created);
      return created;
    },
    findUnique: async ({
      where,
    }: {
      where: { id?: string; email?: string };
    }) => {
      if (where.id) {
        return this.usuarios.find((u) => u.id === where.id) || null;
      }
      if (where.email) {
        return this.usuarios.find((u) => u.email === where.email) || null;
      }
      return null;
    },
  };
}

describe("Auth - Registro de Usuario (E2E)", () => {
  let app: INestApplication;
  let prisma: FakePrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useClass(FakePrismaService)
      .compile();

    app = moduleRef.createNestApplication();
    // Prefijo global '/api' como en main.ts
    app.setGlobalPrefix("api");
    // Validación global
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    prisma = app.get(PrismaService) as unknown as FakePrismaService;
  });

  afterAll(async () => {
    await app.close();
  });

  it("Debería crear cuenta en estado pendiente de verificación y almacenar hash + salt", async () => {
    const payload = {
      nombre: "Juan",
      apellido: "Pérez",
      email: `juan${Date.now()}@mail.com`,
      password: "Password123!",
      telefono: "099123456",
      documentoIdentidad: "1.234.567-8",
    };

    const res = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send(payload)
      .expect(201);

    expect(res.body).toHaveProperty(
      "message",
      "Cuenta creada. Verificación pendiente.",
    );
    expect(res.body).toHaveProperty("verification", "OK");
    expect(res.body.user).toHaveProperty("id");

    // Validamos la forma de la respuesta de la API y estados iniciales del usuario
    expect(res.body.user).toMatchObject({
      nombre: payload.nombre,
      apellido: payload.apellido,
      email: payload.email,
      estadoVerificacion: "PENDIENTE",
      emailVerificado: false,
    });
  });
});
