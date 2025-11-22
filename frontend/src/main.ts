// Importamos createApp y el router para habilitar rutas
import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
// Se agrega el router de la aplicación (login/registro)
import router from "./router";

// Inicializamos la app con el router
createApp(App).use(router).mount("#app");
