const axios = require("axios");

const API_BASE = "http://localhost:3000/api";

async function getToken() {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: "federico@test.com",
      password: "Federico123!",
    });
    console.log("Token:", response.data.access_token);
    return response.data.access_token;
  } catch (error) {
    console.error(
      "Error al obtener token:",
      error.response?.data?.message || error.message,
    );
    return null;
  }
}

getToken();
