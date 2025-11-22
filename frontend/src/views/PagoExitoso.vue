<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-green-50 border border-green-200 rounded-md p-6">
        <div class="flex items-start">
          <svg
            class="h-6 w-6 text-green-500 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <div>
            <h1 class="text-2xl font-bold text-green-800">¡Pago Exitoso!</h1>
            <p class="mt-1 text-sm text-green-700">
              Tu pago fue aprobado. A continuación el resumen:
            </p>
          </div>
        </div>
      </div>

      <div v-if="cargando" class="flex justify-center items-center py-12">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
        ></div>
        <span class="ml-3 text-gray-600"
          >Cargando detalles de la transacción...</span
        >
      </div>

      <div
        v-else-if="error"
        class="bg-red-50 border border-red-200 rounded-md p-4 mt-6"
      >
        <h2 class="text-lg font-semibold text-red-800">
          No se pudo cargar la transacción
        </h2>
        <p class="text-sm text-red-700 mt-1">{{ error }}</p>
      </div>

      <div
        v-else-if="transaccion"
        class="bg-white rounded-lg shadow-md p-6 mt-6"
      >
        <h2 class="text-xl font-semibold text-gray-900">Resumen del Pago</h2>
        <div class="mt-4 space-y-2 text-sm text-gray-700">
          <p><strong>ID de Transacción:</strong> {{ transaccion.id }}</p>
          <p><strong>Estado:</strong> {{ transaccion.estado }}</p>
          <p><strong>Monto:</strong> ${{ transaccion.monto }}</p>
          <p><strong>Método:</strong> {{ transaccion.metodoPago }}</p>
          <p>
            <strong>Referencia Externa:</strong>
            {{ transaccion.referenciaExterna }}
          </p>
        </div>

        <div v-if="transaccion.reserva" class="mt-6">
          <h3 class="text-lg font-medium text-gray-900">Reserva</h3>
          <p class="text-sm text-gray-700 mt-1">
            <strong>Instrumento:</strong>
            {{ transaccion.reserva.publicacion.titulo }}
          </p>
          <p class="text-sm text-gray-700">
            <strong>Precio por día:</strong> ${{
              transaccion.reserva.publicacion.precioPorDia
            }}
          </p>
          <p class="text-sm text-gray-700">
            <strong>Fecha inicio:</strong>
            {{ formatearFecha(transaccion.reserva.fechaInicio) }}
          </p>
          <p class="text-sm text-gray-700">
            <strong>Fecha fin:</strong>
            {{ formatearFecha(transaccion.reserva.fechaFin) }}
          </p>
        </div>

        <div class="mt-6 space-y-3">
          <div class="flex items-center text-sm text-gray-600">
            <svg
              class="h-4 w-4 text-gray-400 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span
              >Serás redirigido a <strong>Mis reservas</strong> en
              {{ redirectCountdown }} segundos…</span
            >
          </div>
          <div class="flex gap-3">
            <router-link
              to="/mis-reservas"
              class="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors duration-200"
            >
              Ir ahora
            </router-link>
            <button
              type="button"
              class="px-4 py-2 rounded-md text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
              @click="cancelarAutoRedirect"
            >
              Cancelar redirección
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  transaccionesService,
  type Transaccion,
} from "@/services/transacciones.service";

const route = useRoute();
const router = useRouter();
const cargando = ref(true);
const error = ref("");
const transaccion = ref<Transaccion | null>(null);
const redirectCountdown = ref(10);
let redirectTimer: number | null = null;
let countdownTimer: number | null = null;

const formatearFecha = (fecha: string) =>
  new Date(fecha).toLocaleDateString("es-UY", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

onMounted(async () => {
  try {
    cargando.value = true;
    error.value = "";

    // Intentamos obtener external_reference (transaccionId) desde los parámetros de retorno
    const externalRef = (route.query.external_reference as string) || "";
    const paymentId = (route.query.payment_id as string) || "";
    const status = ((route.query.status as string) || "").toLowerCase();
    const transaccionId = externalRef || "";

    if (!transaccionId) {
      // En algunos flujos, Mercado Pago puede no enviar external_reference; informar al usuario
      // Si tenemos payment_id y status=approved, intentamos confirmar manualmente
      if (paymentId && status === "approved") {
        const confirmada =
          await transaccionesService.confirmarPagoMercadoPago(paymentId);
        transaccion.value = confirmada;
        // Continuamos al bloque de redirección
      } else {
        throw new Error(
          "No se encontró el identificador de la transacción en el retorno de Mercado Pago",
        );
      }
    }

    if (!transaccion.value) {
      const data = await transaccionesService.obtenerTransaccion(transaccionId);
      // Si aún no está completada pero tenemos payment_id aprobado, confirmamos manualmente
      if (
        data &&
        data.estado !== "COMPLETADA" &&
        paymentId &&
        status === "approved"
      ) {
        const confirmada =
          await transaccionesService.confirmarPagoMercadoPago(paymentId);
        transaccion.value = confirmada;
      } else {
        transaccion.value = data;
      }
    }

    // Emitir evento para actualizar Mis Reservas si el pago fue aprobado
    if (
      transaccion.value &&
      transaccion.value.estado === "COMPLETADA" &&
      transaccion.value.reserva?.id
    ) {
      const evento = new CustomEvent("reserva-actualizada", {
        detail: {
          reservaId: transaccion.value.reserva.id,
          nuevoEstado: "EN_CURSO",
          accion: "pago-aprobado",
        },
      });
      window.dispatchEvent(evento);
    }

    // Redirigir automáticamente a Mis Reservas -> Activas en ~10s, usando focus si hay reservaId
    const query: Record<string, string> = { tab: "activas" };
    if (transaccion.value?.reserva?.id) {
      query.focus = transaccion.value.reserva.id;
    }
    // Timer de redirección
    redirectTimer = window.setTimeout(() => {
      router.replace({ path: "/mis-reservas", query });
    }, 10000);
    // Timer de conteo regresivo visible
    countdownTimer = window.setInterval(() => {
      if (redirectCountdown.value > 0) {
        redirectCountdown.value -= 1;
      } else {
        if (countdownTimer) window.clearInterval(countdownTimer);
      }
    }, 1000);
  } catch (err: any) {
    console.error("Error al cargar transacción MP:", err);
    error.value =
      err.response?.data?.message || err.message || "Error desconocido";
    // Fallback: aunque falle la carga de la transacción, enviamos al usuario a Mis Reservas -> Activas tras ~10s
    redirectTimer = window.setTimeout(() => {
      router.replace({ path: "/mis-reservas", query: { tab: "activas" } });
    }, 10000);
  } finally {
    cargando.value = false;
  }
});

// Permite cancelar la redirección automática
const cancelarAutoRedirect = () => {
  if (redirectTimer) {
    window.clearTimeout(redirectTimer);
    redirectTimer = null;
  }
  if (countdownTimer) {
    window.clearInterval(countdownTimer);
    countdownTimer = null;
  }
};

onUnmounted(() => {
  cancelarAutoRedirect();
});
</script>

<style scoped></style>
