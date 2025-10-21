const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function crearReservaParaPago() {
  try {
    console.log('🔧 Creando reserva de prueba en estado CONFIRMADA...');
    
    // 1. Login como usuario test (arrendatario)
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'test@test.com',
      password: 'Test123@'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login exitoso');
    
    // 2. Crear reserva directamente en la base de datos con estado CONFIRMADA
    const reservaData = {
      usuarioId: 'cmh027hzy0005e0y67sgdbj5j', // ID del usuario test@test.com
      publicacionId: 'cmh03dgmz000aly9kg7thmlsj', // Microfono Shure SM58
      propietarioId: 'cmh00h9j600014gihywaylcyj', // ID del propietario (maria@test.com)
      fechaInicio: new Date(Date.now() + (60 + Math.floor(Math.random() * 30)) * 24 * 60 * 60 * 1000).toISOString(), // Entre 60-90 días
      fechaFin: new Date(Date.now() + (65 + Math.floor(Math.random() * 30)) * 24 * 60 * 60 * 1000).toISOString(), // Entre 65-95 días
      precioTotal: 100,
      comisionPlataforma: 10,
      tipoEntrega: 'DOMICILIO',
      direccionEntrega: 'Dirección de prueba',
      telefonoContacto: '+598 99 123 456',
      notasUsuario: 'Reserva de prueba para pago'
    };
    
    const reservaResponse = await axios.post(
      `${BASE_URL}/api/usuarios/reservas/crear`,
      reservaData,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    console.log('📄 Respuesta completa:', JSON.stringify(reservaResponse.data, null, 2));
    const reservaId = reservaResponse.data.data?.id || reservaResponse.data.id;
    console.log(`✅ Reserva creada con ID: ${reservaId}`);
    
    // 3. Cambiar estado a CONFIRMADA
    const cambiarEstadoResponse = await axios.patch(
      `${BASE_URL}/api/usuarios/reservas/${reservaId}/confirmar`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log(`✅ Reserva ${reservaId} confirmada y lista para pago`);
    console.log(`🔗 URL de pago: http://localhost:5173/pago/${reservaId}`);
    
    return reservaId;
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

crearReservaParaPago();