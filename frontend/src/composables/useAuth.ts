import { ref, computed } from "vue";
import { authService, usuarioService } from "../services/api";

// Estado global reactivo del usuario
const usuarioAutenticado = ref(false);
const datosUsuario = ref<{
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  documentoIdentidad?: string;
  direccion?: string;
} | null>(null);

// Computed para el nombre completo del usuario (fallback al email si nombre/apellido no están cargados)
const nombreCompleto = computed(() => {
  if (!datosUsuario.value) return "";
  const nombre = (datosUsuario.value.nombre || "").trim();
  const apellido = (datosUsuario.value.apellido || "").trim();
  const combinado = `${nombre} ${apellido}`.trim();
  if (combinado.length > 0) return combinado;
  return (datosUsuario.value.email || "").trim();
});

// Computed para las iniciales del usuario (fallback al email)
const iniciales = computed(() => {
  if (!datosUsuario.value) return "U";
  const nombre = (datosUsuario.value.nombre || "").trim();
  const apellido = (datosUsuario.value.apellido || "").trim();
  const inicialesArray: string[] = [];
  if (nombre) inicialesArray.push(nombre.charAt(0).toUpperCase());
  if (apellido) inicialesArray.push(apellido.charAt(0).toUpperCase());
  const result = inicialesArray.slice(0, 2).join("");
  if (result) return result;
  const email = (datosUsuario.value.email || "").trim();
  return email ? email.charAt(0).toUpperCase() : "U";
});

export function useAuth() {
  // Función para verificar el estado de autenticación
  const verificarAutenticacion = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      usuarioAutenticado.value = false;
      datosUsuario.value = null;
      return;
    }

    // Intentar obtener datos del usuario desde localStorage primero
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        usuarioAutenticado.value = true;
        datosUsuario.value = user;

        // Intentar actualizar con datos del backend en segundo plano
        try {
          const perfil = await usuarioService.obtenerPerfil(user.id);
          datosUsuario.value = {
            id: perfil.id,
            nombre: perfil.nombre || "",
            apellido: perfil.apellido || "",
            email: perfil.email || "",
            documentoIdentidad: perfil.documentoIdentidad,
            direccion: perfil.direccion,
          };

          // Actualizar localStorage con los datos más recientes
          localStorage.setItem("userData", JSON.stringify(datosUsuario.value));
        } catch (backendError) {
          console.warn(
            "No se pudo actualizar el perfil desde el backend:",
            backendError,
          );
          // Mantener los datos del localStorage si el backend falla
        }

        return;
      } catch (parseError) {
        console.error("Error al parsear datos del usuario:", parseError);
        // Si el token existe pero el parse falla, intentar recuperar el perfil a partir del token
        try {
          const perfil = await authService.perfil();
          datosUsuario.value = {
            id: perfil.id,
            nombre: perfil.nombre || "",
            apellido: perfil.apellido || "",
            email: perfil.email || "",
            documentoIdentidad: perfil.documentoIdentidad,
            direccion: perfil.direccion,
          };
          usuarioAutenticado.value = true;
          localStorage.setItem("userData", JSON.stringify(datosUsuario.value));
        } catch (recuperacionError) {
          console.warn(
            "No se pudo recuperar el perfil desde el token tras error de parseo:",
            recuperacionError,
          );
          limpiarAutenticacion();
        }
        return;
      }
    }

    // Si no hay datos en localStorage pero sí hay token, intentar recuperar el perfil desde el backend
    try {
      const perfil = await authService.perfil();
      datosUsuario.value = {
        id: perfil.id,
        nombre: perfil.nombre || "",
        apellido: perfil.apellido || "",
        email: perfil.email || "",
        documentoIdentidad: perfil.documentoIdentidad,
        direccion: perfil.direccion,
      };
      usuarioAutenticado.value = true;
      localStorage.setItem("userData", JSON.stringify(datosUsuario.value));
    } catch (error) {
      console.warn(
        "No se pudo recuperar el perfil desde el token. Limpiando autenticación.",
        error,
      );
      limpiarAutenticacion();
    }
  };

  // Función para actualizar los datos del usuario
  const actualizarDatosUsuario = (
    nuevosDatos: Partial<typeof datosUsuario.value>,
  ) => {
    if (datosUsuario.value && nuevosDatos) {
      datosUsuario.value = { ...datosUsuario.value, ...nuevosDatos };

      // Actualizar localStorage
      localStorage.setItem("userData", JSON.stringify(datosUsuario.value));
    }
  };

  // Función para limpiar la autenticación
  const limpiarAutenticacion = () => {
    usuarioAutenticado.value = false;
    datosUsuario.value = null;
    localStorage.removeItem("access_token");
    localStorage.removeItem("userData");
  };

  // Función para cerrar sesión
  const cerrarSesion = () => {
    limpiarAutenticacion();
  };

  return {
    // Estado reactivo
    usuarioAutenticado: computed(() => usuarioAutenticado.value),
    datosUsuario: computed(() => datosUsuario.value),
    nombreCompleto,
    iniciales,

    // Métodos
    verificarAutenticacion,
    actualizarDatosUsuario,
    limpiarAutenticacion,
    cerrarSesion,
  };
}
