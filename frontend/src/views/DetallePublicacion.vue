<template>
  <div class="min-h-screen">
    <!-- Breadcrumb y navegación de regreso -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center space-x-4">
          <button
            @click="$router.go(-1)"
            class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Volver atrás"
          >
            <svg
              class="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <nav class="flex" aria-label="Breadcrumb">
            <ol class="flex items-center space-x-2">
              <li>
                <router-link
                  to="/catalogo"
                  class="text-gray-500 hover:text-gray-700"
                >
                  Catálogo
                </router-link>
              </li>
              <li>
                <svg
                  class="w-4 h-4 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </li>
              <li>
                <span class="text-gray-900 font-medium"
                  >Detalle del instrumento</span
                >
              </li>
            </ol>
          </nav>
        </div>
      </div>
    </div>

    <!-- Contenido principal -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Estados de carga y error -->
      <EstadosUI
        v-if="cargando"
        tipo="carga"
        mensaje="Cargando detalles del instrumento..."
      />

      <EstadosUI
        v-else-if="error"
        tipo="error"
        titulo="Error al cargar el instrumento"
        :mensaje="error"
        :mostrar-boton="true"
        texto-boton="Intentar nuevamente"
        @accion="cargarPublicacion"
      />

      <!-- Detalle de la publicación -->
      <div
        v-else-if="publicacion"
        class="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        <!-- Galería de imágenes -->
        <div class="space-y-4">
          <!-- Imagen principal cuadrada -->
          <div
            class="aspect-square bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl overflow-hidden flex items-center justify-center border-2 border-gray-200"
          >
            <div class="text-center">
              <svg
                class="h-32 w-32 text-blue-400 mx-auto mb-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
                />
              </svg>
              <p class="text-lg font-medium text-blue-600">
                {{ publicacion.titulo }}
              </p>
              <p class="text-sm text-gray-500">Imagen principal</p>
            </div>
          </div>

          <!-- Imágenes adicionales -->
          <div class="grid grid-cols-5 gap-2">
            <div
              v-for="index in 5"
              :key="index"
              class="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
            >
              <svg
                class="h-8 w-8 text-gray-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
                />
              </svg>
            </div>
          </div>
        </div>

        <!-- Información del instrumento -->
        <div class="space-y-6">
          <!-- Título y ubicación -->
          <div>
            <div class="flex items-center space-x-2 text-sm text-gray-600 mb-2">
              <span
                class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
              >
                {{ categoriaTexto }}
              </span>
              <span>•</span>
              <div class="flex items-center">
                <svg
                  class="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {{ publicacion.ciudad }}, {{ publicacion.departamento }}
              </div>
            </div>

            <h1 class="text-3xl font-bold text-gray-900 mb-2">
              {{ publicacion.titulo }}
            </h1>
            <div
              v-if="publicacion.propietario"
              class="flex items-center text-sm text-gray-700 mt-1"
            >
              <div
                class="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center mr-2"
              >
                {{ publicacion.propietario.nombre?.charAt(0)
                }}{{ publicacion.propietario.apellido?.charAt(0) }}
              </div>
              <span
                >Propietario:
                <span class="font-medium"
                  >{{ publicacion.propietario.nombre }}
                  {{ publicacion.propietario.apellido }}</span
                ></span
              >
            </div>

            <!-- Calificación y estadísticas -->
            <div class="flex items-center space-x-4 text-sm text-gray-600">
              <div
                v-if="publicacion.calificacionPromedio"
                class="flex items-center"
              >
                <svg
                  class="w-4 h-4 text-yellow-400 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </svg>
                <span class="font-medium">{{
                  publicacion.calificacionPromedio.toFixed(1)
                }}</span>
                <span class="ml-1"
                  >({{ publicacion.totalCalificaciones }} reseñas)</span
                >
              </div>
              <span>•</span>
              <span>{{ publicacion.totalReservas }} alquileres</span>
            </div>
          </div>

          <!-- Información del equipo -->
          <div class="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 class="font-semibold text-gray-900">Detalles del equipo</h3>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div v-if="publicacion.marca">
                <span class="text-gray-600">Marca:</span>
                <span class="ml-2 font-medium">{{ publicacion.marca }}</span>
              </div>
              <div v-if="publicacion.modelo">
                <span class="text-gray-600">Modelo:</span>
                <span class="ml-2 font-medium">{{ publicacion.modelo }}</span>
              </div>
              <div v-if="publicacion.anioFabricacion">
                <span class="text-gray-600">Año:</span>
                <span class="ml-2 font-medium">{{
                  publicacion.anioFabricacion
                }}</span>
              </div>
              <div v-if="publicacion.estadoEquipo">
                <span class="text-gray-600">Estado:</span>
                <span class="ml-2 font-medium">{{ estadoTexto }}</span>
              </div>
            </div>
          </div>

          <!-- Descripción -->
          <div v-if="publicacion.descripcion">
            <h3 class="font-semibold text-gray-900 mb-2">Descripción</h3>
            <p class="text-gray-700 leading-relaxed">
              {{ publicacion.descripcion }}
            </p>
          </div>

          <!-- Selector de fechas de alquiler (RES-15) -->
          <div
            class="bg-white border border-gray-200 rounded-lg p-6"
            aria-labelledby="titulo-fechas-alquiler"
          >
            <h3
              id="titulo-fechas-alquiler"
              class="font-semibold text-gray-900 mb-4"
            >
              Fechas de alquiler
            </h3>

            <!-- Calendario de rango de fechas -->
            <div class="space-y-3">
              <div>
                <label
                  for="rangoFechas"
                  class="block text-sm font-medium text-gray-700 mb-2"
                >
                  Selecciona el período de alquiler
                </label>
                <VueDatePicker
                  v-model="rangoFechas"
                  :locale="'es'"
                  :format="formatearRangoFechas"
                  :enable-time-picker="false"
                  :clearable="true"
                  :week-start="1"
                  :min-date="hoy"
                  :auto-apply="false"
                  :text-input="false"
                  :range="true"
                  :partial-range="true"
                  :min-range="0"
                  :max-range="365"
                  :multi-calendars="true"
                  :disabled-dates="fechasDeshabilitadas"
                  :highlight="fechasConSombreado"
                  :markers="marcadoresConTooltips"
                  @range-start="onRangeStart"
                  @range-end="onRangeEnd"
                  input-id="rangoFechas"
                  placeholder="Selecciona las fechas de inicio y fin"
                  :input-class="'w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-sm'"
                  aria-describedby="ayuda-rango-fechas"
                />
                <p id="ayuda-rango-fechas" class="mt-2 text-xs text-gray-500">
                  Haz clic en la fecha de inicio y luego en la fecha de fin.
                  Para alquilar un solo día, selecciona la misma fecha dos
                  veces.
                </p>
              </div>
            </div>

            <!-- Estado de selección / errores -->
            <div class="mt-3">
              <p v-if="mensajeErrorFechas" class="text-sm text-red-600">
                {{ mensajeErrorFechas }}
              </p>
              <p
                v-else-if="diasSeleccionados > 0"
                class="text-sm text-gray-700"
              >
                <span class="font-medium">{{ diasSeleccionados }}</span> días
                seleccionados.
              </p>
              <p v-else class="text-sm text-gray-500">
                Selecciona las fechas para calcular el total del alquiler.
              </p>
              <p
                v-if="comprobandoDisponibilidad"
                class="text-xs text-gray-500 mt-2"
              >
                Verificando disponibilidad…
              </p>
            </div>
          </div>

          <!-- Precios -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <h3 class="font-semibold text-gray-900 mb-4">
              Precios de alquiler
            </h3>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Por día</span>
                <span class="text-2xl font-bold text-gray-900"
                  >${{ publicacion.precioPorDia }}</span
                >
              </div>
              <!-- Total estimado según rango seleccionado -->
              <div
                v-if="diasSeleccionados > 0 && !mensajeErrorFechas"
                class="flex justify-between items-center"
              >
                <span class="text-gray-600"
                  >Total por {{ diasSeleccionados }} días</span
                >
                <span class="text-2xl font-bold text-gray-900"
                  >${{ totalEstimado.toLocaleString() }}</span
                >
              </div>
              <div
                v-if="publicacion.precioPorSemana"
                class="flex justify-between items-center"
              >
                <span class="text-gray-600">Por semana</span>
                <span class="text-xl font-semibold text-gray-900"
                  >${{ publicacion.precioPorSemana }}</span
                >
              </div>
              <div
                v-if="publicacion.precioPorMes"
                class="flex justify-between items-center"
              >
                <span class="text-gray-600">Por mes</span>
                <span class="text-xl font-semibold text-gray-900"
                  >${{ publicacion.precioPorMes }}</span
                >
              </div>
              <div
                v-if="publicacion.deposito"
                class="flex justify-between items-center pt-3 border-t border-gray-200"
              >
                <span class="text-gray-600">Depósito de garantía</span>
                <span class="font-semibold text-gray-900"
                  >${{ publicacion.deposito }}</span
                >
              </div>
            </div>

            <!-- Información de alquiler -->
            <div
              class="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm text-gray-600"
            >
              <div v-if="publicacion.diasMinimoAlquiler">
                Alquiler mínimo: {{ publicacion.diasMinimoAlquiler }} días
              </div>
              <div v-if="publicacion.diasMaximoAlquiler">
                Alquiler máximo: {{ publicacion.diasMaximoAlquiler }} días
              </div>
            </div>
          </div>

          <!-- Opciones de entrega -->
          <div
            v-if="tieneOpcionesEntrega"
            class="bg-white border border-gray-200 rounded-lg p-6"
          >
            <h3 class="font-semibold text-gray-900 mb-4">
              Opciones de entrega
            </h3>
            <div class="space-y-3">
              <div v-if="publicacion.entregaDomicilio">
                <span class="text-green-600 font-medium"
                  >✓ Entrega a domicilio</span
                >
              </div>
              <div v-if="publicacion.retiroLocal">
                <span class="text-green-600 font-medium"
                  >✓ Retiro en local</span
                >
              </div>
            </div>
          </div>

          <!-- Botón de contacto -->
          <div class="bg-white border border-gray-200 rounded-lg p-6">
            <button
              @click="contactarPropietario"
              :disabled="
                !fechaInicio ||
                !fechaFin ||
                !!mensajeErrorFechas ||
                disponibilidadRango === false
              "
              :class="[
                'w-full py-3 px-6 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
                !fechaInicio ||
                !fechaFin ||
                !!mensajeErrorFechas ||
                disponibilidadRango === false
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
              ]"
            >
              Contactar para alquilar
            </button>
            <p
              v-if="!usuarioAutenticado"
              class="text-xs text-gray-500 text-center mt-2"
            >
              Necesitas iniciar sesión para contactar al propietario
            </p>
            <p v-else class="text-xs text-green-600 text-center mt-2">
              ✓ Listo para contactar al propietario
            </p>
            <p
              v-if="!fechaInicio || !fechaFin"
              class="text-xs text-red-600 text-center mt-2"
            >
              Selecciona un rango válido para continuar
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import EstadosUI from "../components/EstadosUI.vue";
import { publicacionesService, reservasService } from "../services/api";
import type {
  Publicacion,
  ReservaActiva,
  CrearReservaRequest,
} from "../services/api";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

// Composables
const route = useRoute();
const router = useRouter();

// Estado reactivo
const publicacion = ref<Publicacion | null>(null);
const cargando = ref(false);
const error = ref<string | null>(null);

const usuarioAutenticado = ref(false);
const datosUsuario = ref<any>(null);

// Variables eliminadas: imagenPrincipal

// Fechas de alquiler (RES-15)
const hoy = (() => {
  const fecha = new Date();
  fecha.setHours(0, 0, 0, 0); // Establecer a medianoche para evitar problemas de hora
  return fecha;
})();
const rangoFechas = ref<Date[] | null>(null);
// Disponibilidad real
const reservasActivas = ref<ReservaActiva[]>([]);
const disponibilidadRango = ref<boolean | null>(null);
const comprobandoDisponibilidad = ref(false);

// Computed properties para mantener compatibilidad con el código existente
const fechaInicio = computed(() => {
  return rangoFechas.value ? rangoFechas.value[0] : null;
});

const fechaFin = computed(() => {
  return rangoFechas.value ? rangoFechas.value[1] : null;
});

// Función para generar fechas deshabilitadas basadas en reservas activas
const fechasDeshabilitadas = computed(() => {
  if (!reservasActivas.value || reservasActivas.value.length === 0) return [];

  const fechasOcupadas: Date[] = [];

  reservasActivas.value.forEach((reserva) => {
    const inicio = new Date(reserva.fechaInicio);
    const fin = new Date(reserva.fechaFin);

    // Generar todas las fechas entre inicio y fin (inclusive)
    const fechaActual = new Date(inicio);
    while (fechaActual <= fin) {
      fechasOcupadas.push(new Date(fechaActual));
      fechaActual.setDate(fechaActual.getDate() + 1);
    }
  });

  return fechasOcupadas;
});

// Función para generar fechas con sombreado (highlight)
const fechasConSombreado = computed(() => {
  const fechasReservadas: Date[] = [];

  // Agregar fechas reservadas para sombreado rojo
  if (reservasActivas.value && reservasActivas.value.length > 0) {
    reservasActivas.value.forEach((reserva) => {
      const inicio = new Date(reserva.fechaInicio);
      const fin = new Date(reserva.fechaFin);

      const fechaActual = new Date(inicio);
      while (fechaActual <= fin) {
        fechasReservadas.push(new Date(fechaActual));
        fechaActual.setDate(fechaActual.getDate() + 1);
      }
    });
  }

  return {
    dates: fechasReservadas,
  };
});

// Función para generar marcadores con tooltips solo para fechas reservadas
const marcadoresConTooltips = computed(() => {
  const marcadores: any[] = [];

  // Marcadores solo para fechas reservadas (sin tooltips para fechas disponibles)
  if (reservasActivas.value && reservasActivas.value.length > 0) {
    reservasActivas.value.forEach((reserva) => {
      const inicio = new Date(reserva.fechaInicio);
      const fin = new Date(reserva.fechaFin);

      const fechaActual = new Date(inicio);
      while (fechaActual <= fin) {
        marcadores.push({
          date: new Date(fechaActual),
          type: "dot",
          color: "transparent", // Invisible ya que usamos highlight para el color
          tooltip: [
            {
              text: "Esta fecha ya está reservada",
              color: "#dc2626",
            },
          ],
        });
        fechaActual.setDate(fechaActual.getDate() + 1);
      }
    });
  }

  return marcadores;
});

const diasSeleccionados = computed(() => {
  if (!fechaInicio.value || !fechaFin.value) return 0;
  const inicio = fechaInicio.value;
  const fin = fechaFin.value;
  if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) return 0;
  // Validación básica: inicio no puede ser posterior a fin
  if (inicio > fin) return 0;
  // Diferencia en días (inclusiva)
  const msPorDia = 24 * 60 * 60 * 1000;
  const diff = Math.round((fin.getTime() - inicio.getTime()) / msPorDia) + 1;
  return Math.max(diff, 0);
});

const mensajeErrorFechas = computed(() => {
  if (!fechaInicio.value || !fechaFin.value) return "";
  const inicio = fechaInicio.value;
  const fin = fechaFin.value;
  if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) return "";
  if (inicio > fin)
    return "La fecha inicio no puede ser posterior a la fecha fin.";
  // Validación de mínimo/máximo días
  const minDias = publicacion.value?.diasMinimoAlquiler;
  const maxDias = publicacion.value?.diasMaximoAlquiler ?? null;
  if (diasSeleccionados.value && minDias && diasSeleccionados.value < minDias) {
    return `El alquiler mínimo es de ${minDias} días.`;
  }
  if (diasSeleccionados.value && maxDias && diasSeleccionados.value > maxDias) {
    return `El alquiler máximo es de ${maxDias} días.`;
  }
  // Verificación de disponibilidad real
  if (disponibilidadRango.value === false) {
    return "El instrumento no está disponible en el rango seleccionado.";
  }
  return "";
});

const totalEstimado = computed(() => {
  if (!publicacion.value) return 0;
  if (!diasSeleccionados.value || mensajeErrorFechas.value) return 0;
  return publicacion.value.precioPorDia * diasSeleccionados.value;
});

// Computed properties
const categoriaTexto = computed(() => {
  if (!publicacion.value?.categoria) return "";

  const categorias: Record<string, string> = {
    Guitars: "Guitarras",
    Drums: "Batería",
    Keyboards: "Teclados",
    Winds: "Instrumentos de viento",
    Strings: "Instrumentos de cuerda",
    Amplifiers: "Amplificadores",
    PA_Audio: "Audio PA",
    Percussion: "Percusión",
    Recording: "Equipos de grabación",
    Lighting: "Iluminación",
    Accessories: "Accesorios",
    Others: "Otros",
  };

  return categorias[publicacion.value.categoria] || publicacion.value.categoria;
});

const estadoTexto = computed(() => {
  if (!publicacion.value?.estadoEquipo) return "";

  const estados: Record<string, string> = {
    EXCELENTE: "Excelente",
    MUY_BUENO: "Muy bueno",
    BUENO: "Bueno",
    REGULAR: "Regular",
    NECESITA_REPARACION: "Necesita reparación",
  };

  return (
    estados[publicacion.value.estadoEquipo] || publicacion.value.estadoEquipo
  );
});

const tieneOpcionesEntrega = computed(() => {
  return publicacion.value?.entregaDomicilio || publicacion.value?.retiroLocal;
});

// Métodos
const verificarAutenticacion = () => {
  try {
    const token = localStorage.getItem("access_token");
    const userData = localStorage.getItem("userData");

    if (token && userData) {
      usuarioAutenticado.value = true;
      datosUsuario.value = JSON.parse(userData);
    } else {
      usuarioAutenticado.value = false;
      datosUsuario.value = null;
    }
  } catch (error) {
    console.error("Error al verificar autenticación:", error);
    usuarioAutenticado.value = false;
    datosUsuario.value = null;
  }
};

const cargarPublicacion = async () => {
  const id = route.params.id as string;

  if (!id) {
    error.value = "ID de publicación no válido";
    return;
  }

  try {
    cargando.value = true;
    error.value = null;

    publicacion.value = await publicacionesService.obtenerPublicacionPorId(id);
    // Cargar reservas activas de la publicación para informar fechas ocupadas
    try {
      reservasActivas.value =
        await publicacionesService.obtenerReservasActivasDePublicacion(id);
    } catch (e) {
      console.warn(
        "No se pudieron cargar las reservas activas de la publicación:",
        e,
      );
      reservasActivas.value = [];
    }
  } catch (err) {
    console.error("Error al cargar publicación:", err);
    error.value =
      "No se pudo cargar la información del instrumento. Por favor, intenta nuevamente.";
  } finally {
    cargando.value = false;
  }
};

// Métodos eliminados: cambiarImagenPrincipal, manejarErrorImagen, imagenPrincipalComputed, watch de imagenPrincipal

// Formateadores
const formatearISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  // Serializar como fecha local evitando el parsing UTC
  return `${y}-${m}-${day}T00:00:00`;
};

const formatearDDMMYYYY = (d: Date) => {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const formatearRangoFechas = (rango: Date[] | null) => {
  if (!rango || !rango[0] || !rango[1]) return "";
  const inicio = formatearDDMMYYYY(rango[0]);
  const fin = formatearDDMMYYYY(rango[1]);
  return `${inicio} - ${fin}`;
};

const contactarPropietario = async () => {
  // Validar rango antes de continuar
  if (!fechaInicio.value || !fechaFin.value) {
    alert("Selecciona un rango de fechas para continuar.");
    return;
  }
  if (mensajeErrorFechas.value) {
    alert(mensajeErrorFechas.value);
    return;
  }
  if (disponibilidadRango.value === false) {
    alert("El instrumento no está disponible en el rango seleccionado.");
    return;
  }

  // Persistir fechas seleccionadas para el flujo de contacto
  try {
    const datos = {
      publicacionId: publicacion.value?.id,
      fechaInicio: formatearISO(fechaInicio.value!),
      fechaFin: formatearISO(fechaFin.value!),
      dias: diasSeleccionados.value,
      totalEstimado: totalEstimado.value,
      titulo: publicacion.value?.titulo,
    };
    sessionStorage.setItem("alquilerSeleccionado", JSON.stringify(datos));
  } catch (e) {
    console.warn(
      "No se pudieron guardar las fechas seleccionadas en sessionStorage",
    );
  }

  if (!usuarioAutenticado.value) {
    // Redirigir al login con mensaje de que necesita autenticarse
    // Guardar ruta anterior para redirección posterior al login, incluyendo las fechas seleccionadas
    const rutaConFechas = `${route.fullPath}${route.fullPath.includes("?") ? "&" : "?"}fechaInicio=${encodeURIComponent(formatearISO(fechaInicio.value!))}&fechaFin=${encodeURIComponent(formatearISO(fechaFin.value!))}`;
    sessionStorage.setItem("rutaAnteriorLogin", rutaConFechas);
    router.push({
      path: "/login",
      query: {
        redirect: rutaConFechas,
        message: "Inicia sesión para contactar al propietario del instrumento",
      },
    });
  } else {
    // Usuario autenticado - crear la reserva
    try {
      if (!publicacion.value || !datosUsuario.value) {
        alert("Error: No se pudo obtener la información necesaria.");
        return;
      }

      // Preparar datos de la reserva
      const datosReserva: CrearReservaRequest = {
        usuarioId: datosUsuario.value.id,
        publicacionId: publicacion.value.id,
        propietarioId: publicacion.value.propietarioId,
        fechaInicio: formatearISO(fechaInicio.value!),
        fechaFin: formatearISO(fechaFin.value!),
        precioTotal: totalEstimado.value,
        comisionPlataforma: Math.round(totalEstimado.value * 0.1), // 10% de comisión
        tipoEntrega: "DOMICILIO", // Por defecto
        direccionEntrega: datosUsuario.value.direccion || "Por definir",
        telefonoContacto: datosUsuario.value.telefono || "Por definir",
        notasUsuario: `Solicitud de alquiler para ${diasSeleccionados.value} días`,
      };

      // Crear la reserva
      const resultado = await reservasService.crearReserva(datosReserva);

      if (resultado.success) {
        alert(
          `¡Solicitud enviada exitosamente! Tu solicitud de alquiler ha sido enviada al propietario. Te notificaremos cuando sea aprobada.`,
        );
        // Redirigir a mis reservas para ver la solicitud creada
        router.push("/mis-reservas");
      } else {
        alert("Error al enviar la solicitud. Por favor, inténtalo de nuevo.");
      }
    } catch (error: any) {
      console.error("Error creando reserva:", error);
      const mensaje =
        error.response?.data?.message || error.message || "Error desconocido";
      alert(`Error al enviar la solicitud: ${mensaje}`);
    }
  }
};

// Lifecycle hooks
onMounted(() => {
  verificarAutenticacion();
  cargarPublicacion();
});

// Watcher específico para rangoFechas para manejar selección de un solo día
watch(
  rangoFechas,
  (newRange) => {
    if (newRange && newRange.length === 2 && newRange[0] && !newRange[1]) {
      // Si solo se ha seleccionado la fecha de inicio, establecer la misma fecha como fin
      console.log(
        "Solo fecha de inicio seleccionada, estableciendo mismo día como fin",
      );
      nextTick(() => {
        rangoFechas.value = [newRange[0], newRange[0]];
      });
    }
  },
  { deep: true },
);

// Verificar disponibilidad real cuando cambian las fechas
watch([fechaInicio, fechaFin], async ([inicio, fin]) => {
  const id = publicacion.value?.id;
  if (!id || !inicio || !fin) {
    disponibilidadRango.value = null;
    return;
  }
  // Evitar verificar si ya hay un error de rango básico
  const dInicio = inicio;
  const dFin = fin;
  if (isNaN(dInicio.getTime()) || isNaN(dFin.getTime()) || dInicio > dFin) {
    disponibilidadRango.value = null;
    return;
  }
  comprobandoDisponibilidad.value = true;
  try {
    const res = await publicacionesService.verificarDisponibilidadPublicacion(
      id,
      formatearISO(dInicio),
      formatearISO(dFin),
    );
    disponibilidadRango.value = !!res?.disponible;
  } catch (e) {
    console.warn("Fallo al verificar disponibilidad en el backend:", e);
    disponibilidadRango.value = null;
  } finally {
    comprobandoDisponibilidad.value = false;
  }
});

// Funciones de manejo de eventos del calendario
const onRangeStart = (date: Date) => {
  console.log("Fecha de inicio seleccionada:", date);
};

const onRangeEnd = (date: Date) => {
  console.log("Fecha de fin seleccionada:", date);
};

// Expose reactive properties and methods
defineExpose({
  publicacion,
  cargando,
  error,
  cargarPublicacion,
  contactarPropietario,
  estadoTexto,
  categoriaTexto,
  tieneOpcionesEntrega,
  // Exponer propiedades del selector de fechas (por si se necesitan en pruebas)
  fechaInicio,
  fechaFin,
  diasSeleccionados,
  totalEstimado,
  mensajeErrorFechas,
  reservasActivas,
  disponibilidadRango,
  comprobandoDisponibilidad,
});
</script>

<style scoped>
/* Aspect ratio utilities */
.aspect-w-16 {
  position: relative;
  padding-bottom: 75%; /* 16:12 ratio */
}

.aspect-w-1 {
  position: relative;
  padding-bottom: 100%; /* 1:1 ratio */
}

.aspect-w-16 > img,
.aspect-w-1 > img {
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

/* Animación de carga */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Transiciones suaves */
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Mejorar la accesibilidad del foco */
button:focus,
a:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Estilos para el grid responsive */
@media (max-width: 1024px) {
  .lg\:grid-cols-2 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .lg\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* Mejoras de estilo para el DatePicker */
:deep(.dp__theme_default) {
  --dp-primary-color: #2563eb; /* azul vibrante para elementos principales */
  --dp-primary-text-color: #ffffff;
  --dp-hover-color: #eff6ff; /* azul claro */
  --dp-hover-text-color: #1f2937; /* gris 800 */
  --dp-secondary-color: #f9fafb; /* fondo */
  --dp-text-color: #111827; /* gris 900 */
  --dp-border-color: #d1d5db; /* gris 300 */
  --dp-disabled-color: #e5e7eb; /* gris 200 */
  --dp-overlay-color: rgba(37, 99, 235, 0.15); /* overlay azul claro */
  --dp-range-bg-color: #2563eb; /* azul vibrante para el rango */
  --dp-range-text-color: #ffffff; /* texto blanco en el rango */
  --dp-range-between-color: #3b82f6; /* azul medio para fechas intermedias */
}

/* Icono más cercano al texto y mejor alineado */
:deep(.dp__input_wrap) {
  position: relative;
}
:deep(.dp__input_icon) {
  left: 0.75rem; /* separa un poco más del borde */
  right: auto;
  width: 1.25rem; /* agranda suavemente el icono */
  height: 1.25rem;
}
:deep(.dp__input_icon svg) {
  width: 1.25rem;
  height: 1.25rem;
}
:deep(.dp__input) {
  padding-left: 3.25rem; /* separa un poco más el texto del icono */
}

/* Sombras y bordes del calendario */
:deep(.dp__menu) {
  box-shadow: 0 10px 18px -5px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
}

/* Estilos para fechas con highlight */
:deep(.dp__cell_inner) {
  position: relative;
}

/* Fechas reservadas - sombreado rojo claro */
:deep(.dp__cell_highlight) {
  background-color: #fecaca !important; /* rojo claro */
  color: #dc2626 !important; /* texto rojo oscuro */
  border-radius: 0.375rem;
}

:deep(.dp__cell_highlight:hover) {
  background-color: #fca5a5 !important; /* rojo un poco más oscuro al hover */
}

/* Fechas disponibles - sombreado verde claro */
:deep(
  .dp__cell_inner:not(.dp__cell_highlight):not(.dp__cell_disabled):not(
      .dp__today
    )
) {
  background-color: #dcfce7 !important; /* verde claro */
  color: #16a34a !important; /* texto verde oscuro */
  border-radius: 0.375rem;
}

:deep(
  .dp__cell_inner:not(.dp__cell_highlight):not(.dp__cell_disabled):not(
      .dp__today
    ):hover
) {
  background-color: #bbf7d0 !important; /* verde un poco más oscuro al hover */
}

/* Asegurar que las fechas deshabilitadas mantengan su estilo original */
:deep(.dp__cell_disabled) {
  background-color: #f3f4f6 !important;
  color: #9ca3af !important;
}

/* Estilo para el día de hoy */
:deep(.dp__today) {
  background-color: #dbeafe !important; /* azul claro */
  color: #1d4ed8 !important; /* azul oscuro */
  font-weight: 600;
}

/* Estilos para el rango de fechas seleccionadas - AZUL CON VERDE OSCURO PARA INICIO/FIN */
:deep(.dp__range_start),
:deep(.dp__range_end) {
  background-color: #052e16 !important; /* verde muy oscuro para inicio y fin */
  color: white !important;
  font-weight: 700;
  border-radius: 0.5rem;
  border: 2px solid #0f172a !important; /* borde casi negro */
  box-shadow: 0 3px 12px rgba(5, 46, 22, 0.8) !important; /* sombra verde más intensa */
  transform: scale(1.05) !important; /* ligeramente más grande */
}

:deep(.dp__range_between) {
  background-color: #2563eb !important; /* azul vibrante para fechas intermedias */
  color: white !important;
  font-weight: 600;
  border: 1px solid #166534 !important; /* borde verde oscuro */
  box-shadow: 0 1px 4px rgba(37, 99, 235, 0.3) !important; /* sombra azul sutil */
}

/* Hover states para el rango seleccionado */
:deep(.dp__range_start:hover),
:deep(.dp__range_end:hover) {
  background-color: #0f172a !important; /* verde casi negro al hover */
  border-color: #1e293b !important; /* borde gris muy oscuro */
  box-shadow: 0 5px 16px rgba(5, 46, 22, 0.9) !important; /* sombra más intensa */
  transform: scale(1.08) !important;
}

:deep(.dp__range_between:hover) {
  background-color: #1d4ed8 !important; /* azul más oscuro al hover */
  border-color: #14532d !important; /* borde verde oscuro */
  box-shadow: 0 2px 6px rgba(29, 78, 216, 0.4) !important;
}

/* Asegurar que el rango seleccionado tenga prioridad sobre otros estilos */
:deep(.dp__cell_inner.dp__range_start),
:deep(.dp__cell_inner.dp__range_end),
:deep(.dp__cell_inner.dp__range_between) {
  position: relative;
  z-index: 10 !important; /* z-index más alto */
}

/* Estilo especial cuando una fecha del rango está en una fecha reservada */
:deep(.dp__cell_highlight.dp__range_start),
:deep(.dp__cell_highlight.dp__range_end) {
  background-color: #dc2626 !important; /* rojo intenso para conflicto */
  color: white !important;
  border-color: #991b1b !important;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.5) !important;
}

:deep(.dp__cell_highlight.dp__range_between) {
  background-color: #ea580c !important; /* naranja intenso para conflicto intermedio */
  color: white !important;
  border-color: #c2410c !important;
  box-shadow: 0 1px 4px rgba(234, 88, 12, 0.4) !important;
}
</style>
