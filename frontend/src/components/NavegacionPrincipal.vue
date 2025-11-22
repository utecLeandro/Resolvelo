<template>
  <nav
    class="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50"
    role="navigation"
    aria-label="Navegación principal"
  >
    <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 2xl:px-12">
      <div class="flex justify-between items-center h-16">
        <!-- Logo y marca -->
        <div class="flex items-center">
          <router-link
            to="/catalogo"
            class="flex items-center space-x-2 text-xl font-bold text-gray-900 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md px-2 py-1"
            aria-label="ReSolVelo - Ir al catálogo principal"
          >
            <svg
              class="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
            <span>ReSolVelo</span>
          </router-link>
        </div>

        <!-- Navegación desktop -->
        <div class="hidden md:flex items-center space-x-8">
          <router-link
            to="/catalogo"
            class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            :class="{ 'text-blue-600 bg-blue-50': $route.path === '/catalogo' }"
            aria-current="page"
          >
            Catálogo
          </router-link>

          <button
            @click="manejarClickPublicar"
            class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            :class="{
              'text-blue-600 bg-blue-50': $route.path === '/crear-publicacion',
            }"
          >
            Publicar
          </button>

          <router-link
            to="/como-funciona"
            class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            :class="{
              'text-blue-600 bg-blue-50': $route.path === '/como-funciona',
            }"
          >
            Cómo funciona
          </router-link>

          <!-- Botones de autenticación -->
          <div v-if="!usuarioAutenticado" class="flex items-center space-x-4">
            <router-link
              to="/login"
              class="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Iniciar sesión
            </router-link>
            <router-link
              to="/registro"
              class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Registrarse
            </router-link>
          </div>

          <!-- Menú de usuario autenticado -->
          <div v-else class="relative">
            <button
              @click="toggleMenuUsuario"
              @keydown.escape="cerrarMenuUsuario"
              class="flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              :aria-expanded="menuUsuarioAbierto"
              aria-haspopup="true"
              aria-label="Menú de usuario"
            >
              <div
                class="w-8 h-8 aspect-square bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium"
              >
                {{ iniciales }}
              </div>
              <span>{{ nombreUsuario }}</span>
              <svg
                class="w-4 h-4 transition-transform duration-200"
                :class="{ 'rotate-180': menuUsuarioAbierto }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <!-- Dropdown del usuario -->
            <div
              v-if="menuUsuarioAbierto"
              class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="user-menu"
            >
              <router-link
                to="/perfil"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                role="menuitem"
                @click="cerrarMenuUsuario"
              >
                Mi perfil
              </router-link>
              <router-link
                to="/mis-publicaciones"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                role="menuitem"
                @click="cerrarMenuUsuario"
              >
                Panel del Propietario
              </router-link>
              <router-link
                to="/mis-reservas"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                role="menuitem"
                @click="cerrarMenuUsuario"
              >
                Mis reservas
              </router-link>
              <router-link
                v-if="esAdmin"
                to="/admin"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                role="menuitem"
                @click="cerrarMenuUsuario"
              >
                Menú administrador
              </router-link>
              <hr class="my-1" />
              <button
                @click="cerrarSesion"
                class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                role="menuitem"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>

        <!-- Botón menú móvil -->
        <div class="md:hidden">
          <button
            @click="toggleMenuMovil"
            @keydown.escape="cerrarMenuMovil"
            class="text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 p-2 rounded-md"
            :aria-expanded="menuMovilAbierto"
            aria-label="Abrir menú de navegación"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                v-if="!menuMovilAbierto"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Menú móvil -->
      <div
        v-if="menuMovilAbierto"
        class="md:hidden border-t border-gray-200 pt-4 pb-3"
        role="menu"
        aria-orientation="vertical"
        aria-label="Menú de navegación móvil"
      >
        <div class="space-y-1">
          <router-link
            to="/catalogo"
            class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            :class="{ 'text-blue-600 bg-blue-50': $route.path === '/catalogo' }"
            role="menuitem"
            @click="cerrarMenuMovil"
          >
            Catálogo
          </router-link>

          <button
            @click="manejarClickPublicarMovil"
            class="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            :class="{
              'text-blue-600 bg-blue-50': $route.path === '/crear-publicacion',
            }"
            role="menuitem"
          >
            Publicar
          </button>

          <router-link
            to="/como-funciona"
            class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            role="menuitem"
            @click="cerrarMenuMovil"
          >
            Cómo funciona
          </router-link>
        </div>

        <!-- Sección de autenticación móvil -->
        <div class="mt-4 pt-4 border-t border-gray-200">
          <div v-if="!usuarioAutenticado" class="space-y-2">
            <router-link
              to="/login"
              class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              role="menuitem"
              @click="cerrarMenuMovil"
            >
              Iniciar sesión
            </router-link>
            <router-link
              to="/registro"
              class="block px-3 py-2 text-base font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              role="menuitem"
              @click="cerrarMenuMovil"
            >
              Registrarse
            </router-link>
          </div>

          <div v-else class="space-y-2">
            <div class="px-3 py-2 text-base font-medium text-gray-900">
              {{ nombreUsuario }}
            </div>
            <router-link
              to="/perfil"
              class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              role="menuitem"
              @click="cerrarMenuMovil"
            >
              Mi perfil
            </router-link>
            <router-link
              to="/mis-publicaciones"
              class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              role="menuitem"
              @click="cerrarMenuMovil"
            >
              Panel del Propietario
            </router-link>
            <router-link
              to="/mis-reservas"
              class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              role="menuitem"
              @click="cerrarMenuMovil"
            >
              Mis reservas
            </router-link>
            <router-link
              v-if="esAdmin"
              to="/admin"
              class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              role="menuitem"
              @click="cerrarMenuMovil"
            >
              Menú administrador
            </router-link>
            <button
              @click="cerrarSesion"
              class="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              role="menuitem"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
  <!-- Toast de notificación (p.ej., cierre de sesión) -->
  <div
    v-if="toastVisible"
    class="fixed top-4 left-1/2 -translate-x-1/2 transform bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-3"
    role="status"
    aria-live="polite"
  >
    <span>{{ toastMessage }}</span>
    <button
      @click="cerrarToast"
      class="text-white/80 hover:text-white focus:outline-none"
      aria-label="Cerrar notificación"
    >
      ×
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import adminService from "../services/admin";

// Props y emits
interface Props {
  usuarioAutenticado?: boolean;
  nombreUsuario?: string;
}

const props = withDefaults(defineProps<Props>(), {
  usuarioAutenticado: false,
  nombreUsuario: "",
});

// Composables
const router = useRouter();

// Estado reactivo
const menuMovilAbierto = ref(false);
const menuUsuarioAbierto = ref(false);
const esAdmin = ref(false);

// Computed properties
const iniciales = computed(() => {
  if (!props.nombreUsuario) return "U";
  return props.nombreUsuario
    .split(" ")
    .map((nombre) => nombre.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
});

// Métodos para manejar menús
const toggleMenuMovil = () => {
  menuMovilAbierto.value = !menuMovilAbierto.value;
  if (menuMovilAbierto.value) {
    menuUsuarioAbierto.value = false;
  }
};

const cerrarMenuMovil = () => {
  menuMovilAbierto.value = false;
};

const toggleMenuUsuario = () => {
  menuUsuarioAbierto.value = !menuUsuarioAbierto.value;
  if (menuUsuarioAbierto.value) {
    menuMovilAbierto.value = false;
  }
};

const cerrarMenuUsuario = () => {
  menuUsuarioAbierto.value = false;
};

// Cerrar menús al hacer clic fuera
const cerrarMenusAlClickFuera = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.closest("nav")) {
    menuMovilAbierto.value = false;
    menuUsuarioAbierto.value = false;
  }
};

// Cerrar menús con tecla Escape
const manejarTeclaEscape = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    menuMovilAbierto.value = false;
    menuUsuarioAbierto.value = false;
  }
};

// Método para manejar click en botón Publicar (desktop)
const manejarClickPublicar = () => {
  if (props.usuarioAutenticado) {
    // Usuario autenticado, redirigir a página de creación
    router.push("/crear-publicacion");
  } else {
    // Usuario no autenticado, redirigir a login con parámetro de redirección
    router.push("/login?redirect=/crear-publicacion");
  }
};

// Método para manejar click en botón Publicar (móvil)
const manejarClickPublicarMovil = () => {
  cerrarMenuMovil();
  manejarClickPublicar();
};

// Método para cerrar sesión
const cerrarSesion = () => {
  // Limpiar todos los datos de autenticación del localStorage
  localStorage.removeItem("access_token");
  localStorage.removeItem("userData");

  // Actualizar el estado de autenticación en la aplicación
  if ((window as any).actualizarEstadoAutenticacion) {
    (window as any).actualizarEstadoAutenticacion();
  }

  // Cerrar menús
  cerrarMenuUsuario();
  cerrarMenuMovil();

  // Mostrar confirmación de cierre de sesión
  mostrarToast("Has cerrado sesión correctamente.");

  // Redirigir al catálogo
  router.push("/catalogo");
};

// Lifecycle hooks
onMounted(() => {
  document.addEventListener("click", cerrarMenusAlClickFuera);
  document.addEventListener("keydown", manejarTeclaEscape);
  // Verificar rol de administrador al montar si el usuario está autenticado
  if (props.usuarioAutenticado) {
    verificarRolAdmin();
  }
});

onUnmounted(() => {
  document.removeEventListener("click", cerrarMenusAlClickFuera);
  document.removeEventListener("keydown", manejarTeclaEscape);
});

// Estado y métodos para toast
const toastVisible = ref(false);
const toastMessage = ref("");

const mostrarToast = (mensaje: string) => {
  toastMessage.value = mensaje;
  toastVisible.value = true;
  // Ocultar automáticamente después de 3 segundos
  setTimeout(() => {
    toastVisible.value = false;
  }, 3000);
};

const cerrarToast = () => {
  toastVisible.value = false;
};

// Verificar si el usuario actual es administrador
const verificarRolAdmin = async () => {
  try {
    // Intento rápido: leer de localStorage
    const userDataRaw = localStorage.getItem("userData");
    if (userDataRaw) {
      try {
        const user = JSON.parse(userDataRaw);
        const rol = user?.rol;
        if (rol === "ADMINISTRADOR" || rol === "SUPER_ADMIN") {
          esAdmin.value = true;
          return;
        }
      } catch (_) {
        // Ignorar error de parseo y continuar con verificación vía API
      }
    }

    // Verificación robusta: intentar listar usuarios admin (requiere rol admin)
    await adminService.listarUsuarios({ pagina: 1, limite: 1 });
    esAdmin.value = true;
  } catch (error: any) {
    // Si recibe 401/403, no es admin; en otros errores de red, mantener oculto
    esAdmin.value = false;
  }
};

// Re-verificar rol cuando cambia el estado de autenticación
watch(
  () => props.usuarioAutenticado,
  (nuevo) => {
    if (nuevo) {
      verificarRolAdmin();
    } else {
      esAdmin.value = false;
    }
  },
);
</script>
