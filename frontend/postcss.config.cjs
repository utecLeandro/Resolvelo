/****
 * Configuración de PostCSS para Tailwind CSS y Autoprefixer.
 * Permite procesar las directivas @tailwind y aplicar prefijos.
 ****/
module.exports = {
  plugins: [require("@tailwindcss/postcss")(), require("autoprefixer")()],
};
