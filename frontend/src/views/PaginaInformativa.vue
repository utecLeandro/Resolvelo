<!-- Página genérica para contenido informativo -->
<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Encabezado -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          {{ titulo }}
        </h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          {{ descripcion }}
        </p>
      </div>

      <!-- Contenido principal -->
      <div class="bg-white rounded-lg shadow-lg p-8">
        <div class="prose prose-lg max-w-none">
          <!-- Contenido dinámico basado en la ruta -->
          <div v-if="rutaActual === '/como-funciona'">
            <h2>¿Cómo funciona ReSolVelo?</h2>
            <p>
              ReSolVelo es una plataforma que conecta a músicos que necesitan
              instrumentos con propietarios que desean alquilar los suyos.
            </p>

            <h3>Para arrendatarios:</h3>
            <ol>
              <li>Explora nuestro catálogo de instrumentos</li>
              <li>Selecciona el instrumento que necesitas</li>
              <li>Envía una solicitud de reserva</li>
              <li>Espera la confirmación del propietario</li>
              <li>¡Disfruta tocando tu instrumento!</li>
            </ol>

            <h3>Para propietarios:</h3>
            <ol>
              <li>Crea tu cuenta en ReSolVelo</li>
              <li>Publica tus instrumentos con fotos y descripción</li>
              <li>Recibe solicitudes de reserva</li>
              <li>Acepta o rechaza las solicitudes</li>
              <li>Genera ingresos con tus instrumentos</li>
            </ol>
          </div>

          <div v-else-if="rutaActual === '/preguntas-frecuentes'">
            <h2>Preguntas Frecuentes</h2>

            <h3>¿Es seguro alquilar instrumentos en ReSolVelo?</h3>
            <p>
              Sí, todos nuestros usuarios pasan por un proceso de verificación y
              contamos con políticas de seguridad para proteger tanto a
              propietarios como a arrendatarios.
            </p>

            <h3>¿Qué pasa si el instrumento se daña?</h3>
            <p>
              Contamos con políticas de protección que cubren daños
              accidentales. Los detalles específicos se establecen en el acuerdo
              de alquiler.
            </p>

            <h3>¿Cómo se realizan los pagos?</h3>
            <p>
              Los pagos se procesan de forma segura a través de nuestra
              plataforma. Aceptamos tarjetas de crédito y débito.
            </p>

            <h3>¿Puedo cancelar una reserva?</h3>
            <p>
              Sí, puedes cancelar una reserva siguiendo nuestras políticas de
              cancelación. Los términos específicos dependen del tiempo de
              anticipación.
            </p>
          </div>

          <div v-else-if="rutaActual === '/contacto'">
            <h2>Contacto</h2>
            <p>
              ¿Tienes alguna pregunta o necesitas ayuda? Estamos aquí para
              ayudarte.
            </p>

            <div class="grid md:grid-cols-2 gap-8 mt-8">
              <div>
                <h3>Información de contacto</h3>
                <p><strong>Email:</strong> soporte@resolvelo.com</p>
                <p><strong>Teléfono:</strong> +51 999 888 777</p>
                <p>
                  <strong>Horario de atención:</strong> Lunes a Viernes, 9:00 AM
                  - 6:00 PM
                </p>
              </div>
              <div>
                <h3>Oficina principal</h3>
                <p>
                  Av. Universitaria 123<br />
                  Lima, Perú<br />
                  Lima 15001
                </p>
              </div>
            </div>
          </div>

          <div v-else-if="rutaActual === '/centro-ayuda'">
            <h2>Centro de Ayuda</h2>
            <p>
              Encuentra respuestas a las preguntas más comunes y guías para usar
              ReSolVelo.
            </p>

            <h3>Temas populares:</h3>
            <ul>
              <li>Cómo crear una cuenta</li>
              <li>Cómo publicar un instrumento</li>
              <li>Cómo hacer una reserva</li>
              <li>Políticas de cancelación</li>
              <li>Resolución de problemas</li>
            </ul>
          </div>

          <div v-else-if="rutaActual === '/politicas-seguridad'">
            <h2>Políticas de Seguridad</h2>
            <p>
              En ReSolVelo, la seguridad de nuestros usuarios es nuestra
              prioridad principal.
            </p>

            <h3>Verificación de usuarios</h3>
            <p>
              Todos los usuarios deben verificar su identidad antes de poder
              usar la plataforma.
            </p>

            <h3>Protección de datos</h3>
            <p>
              Utilizamos encriptación de última generación para proteger tu
              información personal y financiera.
            </p>

            <h3>Instrumentos seguros</h3>
            <p>
              Implementamos medidas para asegurar que todos los instrumentos
              listados sean legítimos y estén en buenas condiciones.
            </p>
          </div>

          <div v-else-if="rutaActual === '/terminos-condiciones'">
            <h2>Términos y Condiciones</h2>
            <p>
              Al usar ReSolVelo, aceptas los siguientes términos y condiciones.
            </p>

            <h3>Uso de la plataforma</h3>
            <p>
              ReSolVelo es una plataforma de intermediación entre propietarios
              de instrumentos y personas que desean alquilarlos.
            </p>

            <h3>Responsabilidades del usuario</h3>
            <p>
              Los usuarios son responsables de proporcionar información veraz y
              mantener la seguridad de sus cuentas.
            </p>

            <h3>Políticas de alquiler</h3>
            <p>
              Los acuerdos de alquiler se establecen directamente entre
              propietarios y arrendatarios, con ReSolVelo facilitando la
              transacción.
            </p>
          </div>

          <div v-else-if="rutaActual === '/politica-privacidad'">
            <h2>Política de Privacidad</h2>
            <p>
              Esta política describe cómo ReSolVelo recopila, usa y protege tu
              información personal.
            </p>

            <h3>Información que recopilamos</h3>
            <p>
              Recopilamos información necesaria para proporcionar nuestros
              servicios, incluyendo datos de contacto y preferencias de usuario.
            </p>

            <h3>Cómo usamos tu información</h3>
            <p>
              Usamos tu información para facilitar transacciones, mejorar
              nuestros servicios y comunicarnos contigo.
            </p>

            <h3>Protección de datos</h3>
            <p>
              Implementamos medidas de seguridad técnicas y organizacionales
              para proteger tu información personal.
            </p>
          </div>

          <div v-else>
            <h2>Página en construcción</h2>
            <p>
              Esta página está actualmente en desarrollo. Pronto estará
              disponible con contenido completo.
            </p>
            <p>
              Mientras tanto, puedes explorar otras secciones de ReSolVelo o
              contactarnos si necesitas ayuda específica.
            </p>
          </div>
        </div>

        <!-- Botón para volver -->
        <div class="mt-12 text-center">
          <router-link
            to="/catalogo"
            class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Volver al catálogo
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const rutaActual = computed(() => route.path);

const titulo = computed(() => {
  switch (rutaActual.value) {
    case "/como-funciona":
      return "Cómo funciona ReSolVelo";
    case "/preguntas-frecuentes":
      return "Preguntas Frecuentes";
    case "/contacto":
      return "Contacto";
    case "/centro-ayuda":
      return "Centro de Ayuda";
    case "/politicas-seguridad":
      return "Políticas de Seguridad";
    case "/terminos-condiciones":
      return "Términos y Condiciones";
    case "/politica-privacidad":
      return "Política de Privacidad";
    default:
      return "Información";
  }
});

const descripcion = computed(() => {
  switch (rutaActual.value) {
    case "/como-funciona":
      return "Descubre cómo funciona nuestra plataforma de alquiler de instrumentos musicales";
    case "/preguntas-frecuentes":
      return "Encuentra respuestas a las preguntas más comunes sobre ReSolVelo";
    case "/contacto":
      return "Ponte en contacto con nuestro equipo de soporte";
    case "/centro-ayuda":
      return "Recursos y guías para aprovechar al máximo ReSolVelo";
    case "/politicas-seguridad":
      return "Conoce nuestras medidas de seguridad y protección";
    case "/terminos-condiciones":
      return "Lee los términos y condiciones de uso de la plataforma";
    case "/politica-privacidad":
      return "Información sobre cómo protegemos tu privacidad";
    default:
      return "Información sobre ReSolVelo";
  }
});
</script>

<style scoped>
.prose :deep(h2) {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.prose :deep(h3) {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.prose :deep(p) {
  color: #374151;
  margin-bottom: 1rem;
  line-height: 1.625;
}

.prose :deep(ol),
.prose :deep(ul) {
  color: #374151;
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.prose :deep(li) {
  margin-bottom: 0.5rem;
}

.prose :deep(ol) {
  list-style-type: decimal;
}

.prose :deep(ul) {
  list-style-type: disc;
}
</style>
