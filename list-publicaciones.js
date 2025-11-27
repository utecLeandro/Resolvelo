const axios = require('axios');

const API_BASE = (process.env.API_BASE || 'http://127.0.0.1:3006/api').trim();

async function login(email, password) {
  const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
  return res.data.access_token;
}

async function main() {
  const mariaPassword = process.env.MARIA_PASSWORD || 'MariaTest2024!';
  const token = await login('maria@test.com', mariaPassword);
  const res = await axios.get(`${API_BASE}/publicaciones`, { headers: { Authorization: `Bearer ${token}` } });
  const data = res.data;
  const items = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data)
    ? data
    : Array.isArray(data?.data?.items)
    ? data.data.items
    : [];
  console.log(`Total publicaciones: ${items.length}`);
  for (const p of items) {
    const propietarioId = p.propietarioId || (p.propietario?.id);
    const propietarioEmail = p.propietario?.email;
    console.log(`- id=${p.id} titulo=${p.titulo} propietarioId=${propietarioId || 'n/a'} propietarioEmail=${propietarioEmail || 'n/a'}`);
  }
}

main().catch(e => {
  console.error('Error:', e.response?.data || e.message);
});