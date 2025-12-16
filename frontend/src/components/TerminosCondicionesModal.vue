<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'

defineProps<{
  open: boolean
}>()

defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <TransitionRoot as="template" :show="open">
    <Dialog as="div" class="relative z-50" @close="$emit('close')">
      <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
            <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <div>
                <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div class="mt-3 text-center sm:mt-5">
                  <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-900">Política de Privacidad y Términos</DialogTitle>
                  <div class="mt-4 text-left text-sm text-gray-500 max-h-96 overflow-y-auto pr-2 space-y-4">
                    
                    <div>
                      <h4 class="font-bold text-gray-700">Alojamiento y Transferencia Internacional de Datos</h4>
                      <p class="mt-2">ReSolVelo es un servicio digital con infraestructura global para garantizar su rendimiento y disponibilidad.</p>
                      
                      <ul class="list-disc pl-5 mt-2 space-y-2">
                        <li>
                          <strong>Consentimiento para la Transferencia Internacional:</strong> Para operar nuestra plataforma, utilizamos los servicios de infraestructura en la nube de proveedores líderes como Amazon Web Services (AWS). Esto significa que la información que nos proporcionas, incluidos tus datos personales, puede ser almacenada y procesada en servidores ubicados fuera de tu país de residencia (incluyendo, pero no limitándose a, Estados Unidos, Brasil y países de la Unión Europea), donde las leyes de protección de datos pueden ser diferentes.
                        </li>
                        <li>
                          <strong>Finalidad de la Transferencia:</strong> Esta transferencia es necesaria para poder prestarte el servicio de ReSolVelo de manera eficiente y segura.
                        </li>
                        <li>
                          <strong>Aceptación:</strong> Al crear una cuenta y utilizar nuestros servicios, aceptas y consientes explícitamente esta transferencia, almacenamiento y procesamiento de tus datos en el extranjero. Nos comprometemos a que nuestros proveedores de servicios cumplan con altos estándares de seguridad y protección de datos.
                        </li>
                        <li>
                          <strong>Principio de finalidad:</strong> Los datos serán tratados únicamente para los fines específicos que garantizan el correcto funcionamiento de la plataforma.
                        </li>
                      </ul>
                    </div>

                  </div>
                </div>
              </div>
              <div class="mt-5 sm:mt-6">
                <button type="button" class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" @click="$emit('close')">Entendido</button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
