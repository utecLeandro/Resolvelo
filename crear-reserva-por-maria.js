const axios = require('axios');

const API_BASE = (process.env.API_BASE || 'http://127.0.0.1:3006/api').trim();

async function login(email, password) {
  const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
  return res.data.access_token;
}

async function profile(token) {
  const res = await axios.get(`${API_BASE}/auth/profile`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data.data || res.data;
}

async function getPublicacion(id, token) {
  const res = await axios.get(`${API_BASE}/publicaciones/${id}`, { headers: { Authorization: `Bearer ${token}` } });
  return res.data.data || res.data;
}

async function crearReserva(token, datos) {
  const res = await axios.post(`${API_BASE}/usuarios/reservas/crear`, datos, { headers: { Authorization: `Bearer ${token}` } });
  return res.data.data || res.data;
}

async function main() {
  const publicacionId = process.env.PUBLICACION_ID || 'cmhtq2xpt00052ub4h9pud9x9';
  const tokenMaria = await login('maria@test.com', process.env.MARIA_PASSWORD || 'MariaTest2024!');
  const tokenFederico = await login('gtbump2012@gmail.com', 'FedericoTest2024!');
  const usuarioMaria = await profile(tokenMaria);
  const usuarioFederico = await profile(tokenFederico);
  const publicacion = await getPublicacion(publicacionId, tokenMaria);

  const fechaInicio = new Date();
  fechaInicio.setDate(fechaInicio.getDate() + 2);
  const fechaFin = new Date(fechaInicio);
  fechaFin.setDate(fechaFin.getDate() + 3);

  const dias = Math.ceil((fechaFin - fechaInicio) / (1000*60*60*24));
  const precioTotal = Math.round((publicacion.precioPorDia * dias) * 100) / 100;
  const comisionPlataforma = Math.round(precioTotal * 0.1 * 100) / 100;

  const reserva = await crearReserva(tokenMaria, {
    usuarioId: usuarioMaria.id,
    publicacionId: publicacion.id,
    propietarioId: usuarioFederico.id,
    fechaInicio: fechaInicio.toISOString(),
    fechaFin: fechaFin.toISOString(),
    precioTotal,
    comisionPlataforma,
    tipoEntrega: 'RETIRO',
    telefonoContacto: usuarioMaria.telefono || '+000',
    notasUsuario: 'Reserva creada por script'
  });

  console.log('Reserva creada:', reserva.id, 'estado=', reserva.estado);
}

main().catch(e => {
  console.error('Error:', e.response?.data || e.message);
});