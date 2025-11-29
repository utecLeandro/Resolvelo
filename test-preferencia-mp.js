const axios = require('axios');

async function main() {
  const API_BASE = (process.env.API_BASE || 'http://127.0.0.1:3006/api').trim();
  const mariaPassword = process.env.MARIA_PASSWORD || 'MariaTest2024!';
  console.log('API_BASE =', JSON.stringify(API_BASE));

  try {
    // Login María
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'maria@test.com',
      password: mariaPassword
    });
    const token = loginRes.data.access_token;
    console.log('✅ Login OK. Usuario:', loginRes.data?.user?.email);

    // Determinar reservaId: usar env o buscar una CONFIRMADA
    let reservaId = (process.env.RESERVA_ID || '').trim();
    if (!reservaId) {
      const reservasRes = await axios.get(`${API_BASE}/usuarios/reservas/mis-reservas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const reservas = reservasRes.data.data || reservasRes.data;
      const confirmada = (Array.isArray(reservas) ? reservas : (reservas.items || [])).find(r => r.estado === 'CONFIRMADA');
      if (!confirmada) {
        throw new Error('No se encontró una reserva CONFIRMADA para María. Proporcione RESERVA_ID.');
      }
      reservaId = confirmada.id;
      console.log('ℹ️ Usando reserva confirmada encontrada:', reservaId);
    }

    // Crear preferencia
    const prefRes = await axios.post(
      `${API_BASE}/transacciones/mercado-pago/crear-preferencia`,
      { reservaId, descripcion: 'Pago de prueba desde script' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('🧾 Preferencia creada:', prefRes.data);
    console.log('➡️  Redirigir a:', prefRes.data.redirectUrl);

  } catch (err) {
    console.error('❌ Error:', err.response?.status, err.response?.data || err.message);
    process.exitCode = 1;
  }
}

main();