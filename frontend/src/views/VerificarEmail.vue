<template>
  <div class="verificar-email-container">
    <div class="card">
      <h1>Verificación de Correo</h1>
      
      <div v-if="loading" class="status-container">
        <div class="loader"></div>
        <p>Verificando tu correo electrónico...</p>
      </div>

      <div v-else-if="error" class="status-container error">
        <div class="icon error-icon">⚠️</div>
        <p>{{ error }}</p>
        <router-link to="/login" class="btn btn-primary">Ir al Login</router-link>
      </div>

      <div v-else class="status-container success">
        <div class="icon success-icon">✅</div>
        <p>{{ message }}</p>
        <p class="subtext">Tu cuenta ha sido activada correctamente.</p>
        <router-link to="/login" class="btn btn-primary">Iniciar Sesión</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { authService } from '../services/api'

const route = useRoute()
const loading = ref(true)
const error = ref('')
const message = ref('')

onMounted(async () => {
  const token = route.query.token as string
  
  if (!token) {
    error.value = 'Token de verificación no proporcionado.'
    loading.value = false
    return
  }

  try {
    const response = await authService.verificarEmail(token)
    message.value = response.message || 'Email verificado correctamente.'
  } catch (e: any) {
    console.error(e)
    error.value = e.response?.data?.message || e.message || 'Error al verificar el correo.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.verificar-email-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
  background-color: #f9fafb;
}

.card {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  text-align: center;
  max-width: 400px;
  width: 100%;
}

h1 {
  margin-bottom: 24px;
  color: #111827;
  font-size: 24px;
}

.status-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.subtext {
  color: #6b7280;
  margin-bottom: 16px;
}

.btn {
  display: inline-block;
  padding: 10px 20px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #2563EB;
  color: white;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
