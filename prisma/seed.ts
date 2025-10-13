/**
 * Script de seed para poblar la base de datos con datos de prueba.
 * Ejecutar con: npx prisma db seed
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes
  await prisma.transaccion.deleteMany();
  await prisma.reserva.deleteMany();
  await prisma.publicacion.deleteMany();
  await prisma.usuario.deleteMany();

  // Crear usuarios de prueba
  const passwordHashJuan = await bcrypt.hash('JuanTest2024!', 10);
  const passwordSaltJuan = await bcrypt.genSalt(10);
  const passwordHashMaria = await bcrypt.hash('MariaTest2024!', 10);
  const passwordSaltMaria = await bcrypt.genSalt(10);

  const usuario1 = await prisma.usuario.create({
    data: {
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan@test.com',
      passwordHash: passwordHashJuan,
      passwordSalt: passwordSaltJuan,
      documentoIdentidad: '1.234.567-8',
      telefono: '+51987654321',
      estadoVerificacion: 'VERIFICADA',
      emailVerificado: true,
    },
  });

  const usuario2 = await prisma.usuario.create({
    data: {
      nombre: 'María',
      apellido: 'García',
      email: 'maria@test.com',
      passwordHash: passwordHashMaria,
      passwordSalt: passwordSaltMaria,
      documentoIdentidad: '8.765.432-1',
      telefono: '+51123456789',
      estadoVerificacion: 'VERIFICADA',
      emailVerificado: true,
    },
  });

  // Crear publicaciones de prueba
  const publicacion1 = await prisma.publicacion.create({
    data: {
      titulo: 'Guitarra Acústica Yamaha FG800',
      descripcion: 'Guitarra acústica en excelente estado, ideal para principiantes y músicos intermedios.',
      categoria: 'GUITARRAS',
      marca: 'Yamaha',
      modelo: 'FG800',
      anioFabricacion: 2020,
      precioPorDia: 25.00,
      direccion: 'Av. Arequipa 1234',
      ciudad: 'Lima',
      departamento: 'Lima',
      estadoEquipo: 'Excelente',
      propietarioId: usuario1.id,
      imagenes: {
        create: [
          {
            url: 'https://example.com/guitarra1.jpg',
            descripcion: 'Vista frontal de la guitarra',
            orden: 1,
          },
          {
            url: 'https://example.com/guitarra2.jpg',
            descripcion: 'Vista lateral de la guitarra',
            orden: 2,
          },
        ],
      },
    },
  });

  const publicacion2 = await prisma.publicacion.create({
    data: {
      titulo: 'Batería Pearl Export Series',
      descripcion: 'Batería completa de 5 piezas, perfecta para ensayos y presentaciones.',
      categoria: 'BATERIAS',
      marca: 'Pearl',
      modelo: 'Export Series',
      anioFabricacion: 2019,
      precioPorDia: 50.00,
      direccion: 'Jr. Huancavelica 567',
      ciudad: 'Lima',
      departamento: 'Lima',
      estadoEquipo: 'Muy bueno',
      propietarioId: usuario2.id,
      imagenes: {
        create: [
          {
            url: 'https://example.com/bateria1.jpg',
            descripcion: 'Vista completa de la batería',
            orden: 1,
          },
          {
            url: 'https://example.com/bateria2.jpg',
            descripcion: 'Detalle de los platillos',
            orden: 2,
          },
        ],
      },
    },
  });

  // Crear reservas de prueba
  const reserva1 = await prisma.reserva.create({
    data: {
      fechaInicio: new Date('2024-02-01'),
      fechaFin: new Date('2024-02-03'),
      precioTotal: 150.00,
      comisionPlataforma: 15.00,
      estado: 'CONFIRMADA',
      tipoEntrega: 'retiro',
      usuarioId: usuario2.id,
      publicacionId: publicacion1.id,
      propietarioId: usuario1.id,
    },
  });

  // Crear transacciones de prueba
  const transaccion1 = await prisma.transaccion.create({
    data: {
      monto: 150.00,
      tipo: 'PAGO_RESERVA',
      estado: 'COMPLETADA',
      metodoPago: 'tarjeta_credito',
      descripcion: 'Pago por reserva de guitarra',
      comisionPlataforma: 15.00,
      montoNeto: 135.00,
      usuarioId: usuario2.id,
      reservaId: reserva1.id,
    },
  });

  console.log('✅ Seed completado exitosamente!');
  console.log('👤 Usuarios creados: juan@test.com, maria@test.com');
  console.log('🔑 Contraseñas: Juan - JuanTest2024!, María - MariaTest2024!');
  console.log('🎸 Publicaciones creadas: 2');
  console.log('📅 Reservas creadas: 1');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });