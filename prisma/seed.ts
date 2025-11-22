/**
 * Script de seed para poblar la base de datos con datos de prueba.
 * Ejecutar con: npx prisma db seed
 */
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de la base de datos...");

  // Limpiar datos existentes
  await prisma.transaccion.deleteMany();
  await prisma.reserva.deleteMany();
  await prisma.publicacion.deleteMany();
  await prisma.usuario.deleteMany();

  // Crear usuarios de prueba
  const passwordHashJuan = await bcrypt.hash("JuanTest2024!", 10);
  const passwordSaltJuan = await bcrypt.genSalt(10);
  const passwordHashMaria = await bcrypt.hash("MariaTest2024!", 10);
  const passwordSaltMaria = await bcrypt.genSalt(10);
  const passwordHashLolo = await bcrypt.hash("LoloTest2024!", 10);
  const passwordSaltLolo = await bcrypt.genSalt(10);
  const passwordHashFederico = await bcrypt.hash("FedericoTest2024!", 10);
  const passwordSaltFederico = await bcrypt.genSalt(10);

  const usuario1 = await prisma.usuario.create({
    data: {
      nombre: "Juan",
      apellido: "Pérez",
      email: "juan@test.com",
      passwordHash: passwordHashJuan,
      passwordSalt: passwordSaltJuan,
      documentoIdentidad: "1.234.567-8",
      telefono: "+59899123456",
      estadoVerificacion: "VERIFICADA",
      emailVerificado: true,
    },
  });

  const usuario2 = await prisma.usuario.create({
    data: {
      nombre: "María",
      apellido: "García",
      email: "maria@test.com",
      passwordHash: passwordHashMaria,
      passwordSalt: passwordSaltMaria,
      documentoIdentidad: "8.765.432-1",
      telefono: "+59898765432",
      estadoVerificacion: "VERIFICADA",
      emailVerificado: true,
    },
  });

  const usuario3 = await prisma.usuario.create({
    data: {
      nombre: "Lolo",
      apellido: "Rivero",
      email: "lolo@test.com",
      passwordHash: passwordHashLolo,
      passwordSalt: passwordSaltLolo,
      documentoIdentidad: "2.345.678-9",
      telefono: "+59897654321",
      estadoVerificacion: "VERIFICADA",
      emailVerificado: true,
    },
  });

  const usuario4 = await prisma.usuario.create({
    data: {
      nombre: "Federico",
      apellido: "Gutierrez",
      email: "gtbump2012@gmail.com",
      passwordHash: passwordHashFederico,
      passwordSalt: passwordSaltFederico,
      documentoIdentidad: "3.456.789-0",
      telefono: "+59896543210",
      estadoVerificacion: "VERIFICADA",
      emailVerificado: true,
    },
  });

  // Crear publicaciones de prueba
  const publicacion1 = await prisma.publicacion.create({
    data: {
      titulo: "Guitarra Acústica Yamaha FG800",
      descripcion:
        "Guitarra acústica en excelente estado, ideal para principiantes y músicos intermedios.",
      categoria: "GUITARRAS",
      marca: "Yamaha",
      modelo: "FG800",
      anioFabricacion: 2020,
      precioPorDia: 25.0,
      direccion: "Av. 18 de Julio 1234",
      ciudad: "Montevideo",
      departamento: "Montevideo",
      estadoEquipo: "Excelente",
      estado: "ACTIVA",
      estadoModeracion: "APROBADA",
      propietarioId: usuario1.id,
      imagenes: {
        create: [
          {
            url: "https://example.com/guitarra1.jpg",
            descripcion: "Vista frontal de la guitarra",
            orden: 1,
          },
          {
            url: "https://example.com/guitarra2.jpg",
            descripcion: "Vista lateral de la guitarra",
            orden: 2,
          },
        ],
      },
    },
  });

  const publicacion2 = await prisma.publicacion.create({
    data: {
      titulo: "Batería Pearl Export Series",
      descripcion:
        "Batería completa de 5 piezas, perfecta para ensayos y presentaciones.",
      categoria: "BATERIAS",
      marca: "Pearl",
      modelo: "Export Series",
      anioFabricacion: 2019,
      precioPorDia: 50.0,
      direccion: "Bvar. Artigas 567",
      ciudad: "Montevideo",
      departamento: "Montevideo",
      estadoEquipo: "Muy bueno",
      estado: "ACTIVA",
      estadoModeracion: "APROBADA",
      propietarioId: usuario2.id,
      imagenes: {
        create: [
          {
            url: "https://example.com/bateria1.jpg",
            descripcion: "Vista completa de la batería",
            orden: 1,
          },
          {
            url: "https://example.com/bateria2.jpg",
            descripcion: "Detalle de los platillos",
            orden: 2,
          },
        ],
      },
    },
  });

  const publicacion3 = await prisma.publicacion.create({
    data: {
      titulo: "Teclado Yamaha PSR-E373",
      descripcion:
        "Teclado electrónico de 61 teclas con múltiples sonidos y ritmos.",
      categoria: "TECLADOS",
      marca: "Yamaha",
      modelo: "PSR-E373",
      anioFabricacion: 2021,
      precioPorDia: 30.0,
      direccion: "Av. Brasil 2345",
      ciudad: "Montevideo",
      departamento: "Montevideo",
      estadoEquipo: "Excelente",
      estado: "ACTIVA",
      estadoModeracion: "APROBADA",
      propietarioId: usuario4.id,
      imagenes: {
        create: [
          {
            url: "https://example.com/teclado1.jpg",
            descripcion: "Vista frontal del teclado",
            orden: 1,
          },
        ],
      },
    },
  });

  // Crear reservas de prueba
  const reserva1 = await prisma.reserva.create({
    data: {
      fechaInicio: new Date("2024-02-01"),
      fechaFin: new Date("2024-02-03"),
      precioTotal: 150.0,
      comisionPlataforma: 15.0,
      estado: "CONFIRMADA",
      tipoEntrega: "retiro",
      usuarioId: usuario2.id,
      publicacionId: publicacion1.id,
      propietarioId: usuario1.id,
    },
  });

  // Crear transacciones de prueba
  const transaccion1 = await prisma.transaccion.create({
    data: {
      monto: 150.0,
      tipo: "PAGO_RESERVA",
      estado: "COMPLETADA",
      metodoPago: "tarjeta_credito",
      descripcion: "Pago por reserva de guitarra",
      comisionPlataforma: 15.0,
      montoNeto: 135.0,
      usuarioId: usuario2.id,
      reservaId: reserva1.id,
    },
  });

  console.log("✅ Seed completado exitosamente!");
  console.log(
    "👤 Usuarios creados: juan@test.com, maria@test.com, lolo@test.com, gtbump2012@gmail.com",
  );
  console.log(
    "🔑 Contraseñas: Juan - JuanTest2024!, María - MariaTest2024!, Lolo - LoloTest2024!, Federico - FedericoTest2024!",
  );
  console.log("🎸 Publicaciones creadas: 3");
  console.log("📅 Reservas creadas: 1");
}

main()
  .catch((e) => {
    console.error("❌ Error durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
