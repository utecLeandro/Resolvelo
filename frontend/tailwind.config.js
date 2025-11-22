/****
 * Configuración de Tailwind CSS para ReSolVelo (frontend)
 * - Se escanean archivos en src y index.html
 * - Se puede extender el tema según guía Airbnb de UI.
 ****/
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,ts,tsx}"],
  theme: {
    extend: {
      // Paleta y tipografías podrían definirse aquí en el futuro
    },
  },
  plugins: [],
};
