const axios = require('axios');

const API_BASE = (process.env.API_BASE || 'http://127.0.0.1:3006/api').trim();

async function login(email, password) {
  const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
  return res.data.access_token;
}

async function crearPublicacion(token) {
  const pub = {
    titulo: 'Teclado Yamaha PSR-E373',
    descripcion: 'Teclado portátil con 61 teclas, ideal para práctica y presentaciones',
    categoria: 'TECLADOS',
    marca: 'Yamaha',
    modelo: 'PSR-E373',
    anioFabricacion: 2021,
    precioPorDia: 30.00,
    precioPorSemana: 180.00,
    precioPorMes: 600.00,
    deposito: 120.00,
    diasMinimoAlquiler: 1,
    diasMaximoAlquiler: 21,
    direccion: 'Av. Arequipa 1234',
    ciudad: 'Lima',
    departamento: 'Lima',
    codigoPostal: '15046',
    entregaDomicilio: true,
    retiroLocal: true,
    estadoEquipo: 'Muy buen estado'
  };
  const res = await axios.post(`${API_BASE}/publicaciones`, pub, { headers: { Authorization: `Bearer ${token}` } });
  return res.data.data || res.data;
}

async function main() {
  const token = await login('gtbump2012@gmail.com', 'FedericoTest2024!');
  const p = await crearPublicacion(token);
  console.log('Publicación creada:', p.id, p.titulo);
}

main().catch(e => {
  console.error('Error:', e.response?.data || e.message);
});