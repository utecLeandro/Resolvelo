<template>
  <footer
    class="bg-gray-900 text-white mt-auto"
    role="contentinfo"
    aria-label="Información del sitio web"
  >
    <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 2xl:px-12 py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <!-- Información de la empresa -->
        <div class="space-y-4">
          <div class="flex items-center space-x-2">
            <svg
              class="w-8 h-8 text-blue-400"
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
            <h3 class="text-xl font-bold">ReSolVelo</h3>
          </div>
          <p class="text-gray-300 text-sm leading-relaxed">
            La plataforma líder en alquiler de instrumentos musicales.
            Conectamos músicos con los instrumentos que necesitan para crear
            música increíble.
          </p>
          <div class="flex space-x-4">
            <a
              href="#"
              class="text-gray-400 hover:text-blue-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md p-1"
              aria-label="Síguenos en Facebook"
            >
              <svg
                class="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                />
              </svg>
            </a>
            <a
              href="#"
              class="text-gray-400 hover:text-blue-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md p-1"
              aria-label="Síguenos en Instagram"
            >
              <svg
                class="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297L3.938 16.9l.77-1.188c.853.853 2.025 1.383 3.323 1.383 2.58 0 4.658-2.099 4.658-4.678S11.611 7.739 9.031 7.739c-1.297 0-2.469.529-3.323 1.383l-.77-1.188 1.188-.77c.875-.807 2.026-1.297 3.323-1.297 3.463 0 6.26 2.818 6.26 6.26s-2.797 6.26-6.26 6.26z"
                />
              </svg>
            </a>
            <a
              href="#"
              class="text-gray-400 hover:text-blue-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md p-1"
              aria-label="Síguenos en Twitter"
            >
              <svg
                class="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
                />
              </svg>
            </a>
          </div>
        </div>

        <!-- Enlaces rápidos -->
        <div class="space-y-4">
          <h4 class="text-lg font-semibold">Enlaces rápidos</h4>
          <nav aria-label="Enlaces rápidos del pie de página">
            <ul class="space-y-2">
              <li>
                <router-link
                  to="/catalogo"
                  class="text-gray-300 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md px-1"
                >
                  Catálogo
                </router-link>
              </li>
              <li>
                <router-link
                  to="/como-funciona"
                  class="text-gray-300 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md px-1"
                >
                  Cómo funciona
                </router-link>
              </li>
              <li>
                <router-link
                  to="/preguntas-frecuentes"
                  class="text-gray-300 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md px-1"
                >
                  Preguntas frecuentes
                </router-link>
              </li>
              <li>
                <router-link
                  to="/contacto"
                  class="text-gray-300 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md px-1"
                >
                  Contacto
                </router-link>
              </li>
            </ul>
          </nav>
        </div>

        <!-- Soporte -->
        <div class="space-y-4">
          <h4 class="text-lg font-semibold">Soporte</h4>
          <nav aria-label="Enlaces de soporte">
            <ul class="space-y-2">
              <li>
                <router-link
                  to="/centro-ayuda"
                  class="text-gray-300 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md px-1"
                >
                  Centro de ayuda
                </router-link>
              </li>
              <li>
                <router-link
                  to="/politicas-seguridad"
                  class="text-gray-300 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md px-1"
                >
                  Políticas de seguridad
                </router-link>
              </li>
              <li>
                <router-link
                  to="/terminos-condiciones"
                  class="text-gray-300 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md px-1"
                >
                  Términos y condiciones
                </router-link>
              </li>
              <li>
                <router-link
                  to="/politica-privacidad"
                  class="text-gray-300 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md px-1"
                >
                  Política de privacidad
                </router-link>
              </li>
            </ul>
          </nav>
        </div>

        <!-- Información de contacto -->
        <div class="space-y-4">
          <h4 class="text-lg font-semibold">Contacto</h4>
          <div class="space-y-3">
            <div class="flex items-start space-x-3">
              <svg
                class="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <div>
                <p class="text-gray-300 text-sm">Email</p>
                <a
                  href="mailto:contacto@resolvelo.com"
                  class="text-white hover:text-blue-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md"
                >
                  contacto@resolvelo.com
                </a>
              </div>
            </div>

            <div class="flex items-start space-x-3">
              <svg
                class="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <div>
                <p class="text-gray-300 text-sm">Teléfono</p>
                <a
                  href="tel:+59898065249"
                  class="text-white hover:text-blue-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md"
                >
                  +598 98 065 249
                </a>
              </div>
            </div>

            <div class="flex items-start space-x-3">
              <svg
                class="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
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
              <div>
                <p class="text-gray-300 text-sm">Dirección</p>
                <address class="text-white not-italic">
                  Montevideo, Uruguay
                </address>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Línea divisoria -->
      <div class="border-t border-gray-700 mt-8 pt-8">
        <div
          class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
        >
          <div class="text-gray-400 text-sm">
            © {{ anioActual }} ReSolVelo. Todos los derechos reservados.
          </div>

          <!-- Enlaces legales -->
          <nav aria-label="Enlaces legales">
            <ul
              class="flex flex-wrap justify-center md:justify-end space-x-6 text-sm"
            >
              <li>
                <router-link
                  to="/politica-privacidad"
                  class="text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md px-1"
                >
                  Privacidad
                </router-link>
              </li>
              <li>
                <router-link
                  to="/terminos-condiciones"
                  class="text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md px-1"
                >
                  Términos
                </router-link>
              </li>
              <li>
                <router-link
                  to="/cookies"
                  class="text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md px-1"
                >
                  Cookies
                </router-link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from "vue";

// Computed para el año actual
const anioActual = computed(() => new Date().getFullYear());
</script>
