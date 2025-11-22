const axios = require("axios");

const BASE_URL = "http://localhost:3000/api";

async function login(email, password) {
  const res = await axios.post(`${BASE_URL}/auth/login`, { email, password });
  return res.data.access_token;
}

async function get(path, token, params) {
  try {
    const res = await axios.get(`${BASE_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    console.log(`GET ${path} ->`, res.status);
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    const data = err.response?.data || err.message;
    console.log(`GET ${path} -> ERROR`, err.response?.status || "");
    console.log(JSON.stringify(data, null, 2));
  }
}

async function main() {
  const token = await login("gtbump2012@gmail.com", "FedericoTest2024!");
  console.log("Token OK");
  await get("/admin-debug/ping", token);
  await get("/admin/usuarios", token);
  await get("/admin/publicaciones", token, {
    incluirTodosEstadosModeracion: true,
  });
}

main().catch(console.error);
