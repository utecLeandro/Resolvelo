<template>
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="closeOnBackdrop ? close() : null">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ title || 'ReSolvelo' }}
          </h3>
          <button 
            type="button" 
            @click="close" 
            class="text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span class="sr-only">Cerrar</span>
          </button>
        </div>

        <!-- Body -->
        <div class="px-6 py-4">
          <slot></slot>
        </div>

        <!-- Footer -->
        <div v-if="$slots.footer" class="bg-gray-50 px-6 py-3 flex items-center justify-end gap-3">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">

withDefaults(defineProps<{
  isOpen: boolean;
  title?: string;
  closeOnBackdrop?: boolean;
}>(), {
  isOpen: false,
  title: 'ReSolvelo',
  closeOnBackdrop: true
});

const emit = defineEmits(['close']);

const close = () => {
  emit('close');
};
</script>
