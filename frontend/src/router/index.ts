// Enrutador principal de la aplicación
// Se crean rutas para login y registro siguiendo guía de estilo Airbnb
// y buenas prácticas de accesibilidad/UX.

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import LoginPage from '../views/LoginPage.vue'
import RegisterPage from '../views/RegisterPage.vue'

// Definición de rutas de la aplicación
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    // meta podría incluir reglas de auth en el futuro
  },
  {
    path: '/registro',
    name: 'Registro',
    component: RegisterPage,
  },
]

// Creación del router con historial HTML5
const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router