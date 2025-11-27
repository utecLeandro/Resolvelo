<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">
        🔧 Página de Depuración
      </h1>

      <div class="grid gap-6">
        <!-- Token Info -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">🎫 Token de Autenticación</h2>
          <div class="space-y-2">
            <p><strong>Token almacenado:</strong></p>
            <code class="block bg-gray-100 p-2 rounded text-sm break-all">{{
              tokenInfo
            }}</code>
            <div class="flex gap-2">
              <button
                @click="obtenerToken"
                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Obtener Token
              </button>
              <button
                @click="verificarToken"
                class="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
              >
                Verificar Token
              </button>
            </div>
          </div>
        </div>

        <!-- User Data -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">
            👤 Datos del Usuario (localStorage)
          </h2>
          <div class="space-y-2">
            <pre class="bg-gray-100 p-2 rounded text-sm">{{ userData }}</pre>
            <button
              @click="obtenerDatosUsuario"
              class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Obtener Datos de Usuario
            </button>
          </div>
        </div>

        <!-- Profile from API -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">🔍 Perfil desde API</h2>
          <div class="space-y-2">
            <pre class="bg-gray-100 p-2 rounded text-sm">{{ perfilAPI }}</pre>
            <button
              @click="obtenerPerfilAPI"
              class="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Obtener Perfil de API
            </button>
          </div>
        </div>

        <!-- User Publications -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">📋 Mis Publicaciones</h2>
          <div class="space-y-2">
            <pre class="bg-gray-100 p-2 rounded text-sm">{{
              publicacionesUsuario
            }}</pre>
            <button
              @click="obtenerPublicacionesUsuario"
              class="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
            >
              Obtener Mis Publicaciones
            </button>
          </div>
        </div>

        <!-- Test Users -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">🧪 Usuarios de Prueba</h2>
          <div class="space-y-2">
            <p class="text-sm text-gray-600 mb-4">
              Haz login con estos usuarios para probar:
            </p>
            <div class="grid gap-2">
              <div class="bg-blue-50 p-3 rounded">
                <strong>Juan Pérez:</strong> juan@test.com / JuanTest2024!
                <br /><small class="text-gray-600">9 publicaciones</small>
              </div>
              <div class="bg-green-50 p-3 rounded">
                <strong>María García:</strong> maria@test.com / MariaTest2024!
                <br /><small class="text-gray-600">1 publicación</small>
              </div>
              <div class="bg-yellow-50 p-3 rounded">
                <strong>Lolo Rivero:</strong> lolo@test.com / LoloTest2024!
                <br /><small class="text-gray-600">0 publicaciones</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Clear Data -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4">🗑️ Limpiar Datos</h2>
          <button
            @click="limpiarDatos"
            class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Limpiar localStorage
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { authService, publicacionesService } from "@/services/api";

// Estados reactivos
const tokenInfo = ref("");
const userData = ref("");
const perfilAPI = ref("");
const publicacionesUsuario = ref("");

// Cargar datos al montar el componente
onMounted(() => {
  obtenerToken();
  obtenerDatosUsuario();
});

function obtenerToken() {
  const token = localStorage.getItem("token");
  if (token) {
    tokenInfo.value = token;
  } else {
    tokenInfo.value = "No hay token almacenado";
  }
}

function obtenerDatosUsuario() {
  const usuario = localStorage.getItem("user");
  if (usuario) {
    try {
      userData.value = JSON.stringify(JSON.parse(usuario), null, 2);
    } catch (error) {
      userData.value = "Error al parsear datos del usuario";
    }
  } else {
    userData.value = "No hay datos de usuario almacenados";
  }
}

async function verificarToken() {
  const token = localStorage.getItem("token");
  if (!token) {
    tokenInfo.value = "No hay token para verificar";
    return;
  }

  try {
    const perfil = await authService.perfil();
    tokenInfo.value = `Token válido ✅\nToken: ${token}\nUsuario: ${perfil.nombre} ${perfil.apellido} (${perfil.email})`;
  } catch (error) {
    tokenInfo.value = `Token inválido ❌\nToken: ${token}\nError: ${error}`;
  }
}

async function obtenerPerfilAPI() {
  try {
    const perfil = await authService.perfil();
    perfilAPI.value = JSON.stringify(perfil, null, 2);
  } catch (error) {
    perfilAPI.value = `Error: ${error}`;
  }
}

async function obtenerPublicacionesUsuario() {
  try {
    const usuario = localStorage.getItem("user");
    if (!usuario) {
      publicacionesUsuario.value = "No hay usuario logueado";
      return;
    }

    const userData = JSON.parse(usuario);
    const publicaciones = await publicacionesService.obtenerMisPublicaciones(
      userData.id,
    );
    publicacionesUsuario.value = JSON.stringify(publicaciones, null, 2);
  } catch (error) {
    publicacionesUsuario.value = `Error: ${error}`;
  }
}

function limpiarDatos() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  tokenInfo.value = "No hay token almacenado";
  userData.value = "No hay datos de usuario almacenados";
  perfilAPI.value = "";
  publicacionesUsuario.value = "";
  alert("Datos limpiados del localStorage");
}
</script>
