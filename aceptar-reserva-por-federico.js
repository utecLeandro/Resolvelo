const axios = require('axios');
const API_BASE = (process.env.API_BASE || 'http://127.0.0.1:3006/api').trim();

async function login(email, password) {
  const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
  return res.data.access_token;
}

async function aceptarReserva(token, reservaId) {
  const res = await axios.patch(`${API_BASE}/usuarios/reservas/${reservaId}/aceptar`, {}, { headers: { Authorization: `Bearer ${token}` } });
  return res.data.data || res.data;
}

async function main() {
  const reservaId = process.env.RESERVA_ID || 'cmhtq3ku000072ub4466qdt10';
  const token = await login('gtbump2012@gmail.com', 'FedericoTest2024!');
  const r = await aceptarReserva(token, reservaId);
  console.log('Reserva aceptada:', r.id, 'estado=', r.estado);
}

main().catch(e => {
  console.error('Error:', e.response?.data || e.message);
});