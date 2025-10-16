/**
 * Utilidades para normalización y búsqueda de texto
 * Funciones para hacer búsquedas más flexibles e insensibles a acentos
 */

/**
 * Normaliza texto removiendo acentos, convirtiendo a minúsculas y limpiando espacios
 * @param texto Texto a normalizar
 * @returns Texto normalizado
 */
export function normalizarTexto(texto: string): string {
  if (!texto) return '';
  
  return texto
    .toLowerCase()
    .normalize('NFD') // Descompone caracteres con acentos
    .replace(/[\u0300-\u036f]/g, '') // Remueve marcas diacríticas (acentos)
    .replace(/[^\w\s]/g, ' ') // Reemplaza caracteres especiales con espacios
    .replace(/\s+/g, ' ') // Normaliza espacios múltiples
    .trim();
}

/**
 * Genera variaciones de una palabra para búsqueda más flexible
 * Incluye singular/plural y variaciones comunes
 * @param palabra Palabra base
 * @returns Array de variaciones de la palabra
 */
export function generarVariacionesPalabra(palabra: string): string[] {
  const palabraNormalizada = normalizarTexto(palabra);
  const variaciones = new Set([palabraNormalizada]);
  
  // Agregar variación sin 's' final (plural a singular)
  if (palabraNormalizada.endsWith('s') && palabraNormalizada.length > 2) {
    variaciones.add(palabraNormalizada.slice(0, -1));
  }
  
  // Agregar variación con 's' final (singular a plural)
  if (!palabraNormalizada.endsWith('s')) {
    variaciones.add(palabraNormalizada + 's');
  }
  
  // Variaciones específicas para instrumentos musicales
  const variacionesEspecificas: Record<string, string[]> = {
    'bateria': ['bateria', 'baterias', 'drums', 'drum'],
    'baterias': ['bateria', 'baterias', 'drums', 'drum'],
    'guitarra': ['guitarra', 'guitarras', 'guitar', 'guitars'],
    'guitarras': ['guitarra', 'guitarras', 'guitar', 'guitars'],
    'teclado': ['teclado', 'teclados', 'keyboard', 'keyboards', 'piano', 'pianos'],
    'teclados': ['teclado', 'teclados', 'keyboard', 'keyboards', 'piano', 'pianos'],
    'piano': ['piano', 'pianos', 'teclado', 'teclados', 'keyboard', 'keyboards'],
    'pianos': ['piano', 'pianos', 'teclado', 'teclados', 'keyboard', 'keyboards'],
    'bajo': ['bajo', 'bajos', 'bass', 'basses'],
    'bajos': ['bajo', 'bajos', 'bass', 'basses'],
    'bass': ['bass', 'basses', 'bajo', 'bajos'],
    'basses': ['bass', 'basses', 'bajo', 'bajos'],
    'amplificador': ['amplificador', 'amplificadores', 'amplifier', 'amplifiers', 'amp', 'amps'],
    'amplificadores': ['amplificador', 'amplificadores', 'amplifier', 'amplifiers', 'amp', 'amps'],
    'amplifier': ['amplifier', 'amplifiers', 'amplificador', 'amplificadores', 'amp', 'amps'],
    'amplifiers': ['amplifier', 'amplifiers', 'amplificador', 'amplificadores', 'amp', 'amps'],
    'amp': ['amp', 'amps', 'amplificador', 'amplificadores', 'amplifier', 'amplifiers'],
    'amps': ['amp', 'amps', 'amplificador', 'amplificadores', 'amplifier', 'amplifiers'],
    'microfono': ['microfono', 'microfonos', 'microphone', 'microphones', 'mic', 'mics'],
    'microfonos': ['microfono', 'microfonos', 'microphone', 'microphones', 'mic', 'mics'],
    'microphone': ['microphone', 'microphones', 'microfono', 'microfonos', 'mic', 'mics'],
    'microphones': ['microphone', 'microphones', 'microfono', 'microfonos', 'mic', 'mics'],
    'mic': ['mic', 'mics', 'microfono', 'microfonos', 'microphone', 'microphones'],
    'mics': ['mic', 'mics', 'microfono', 'microfonos', 'microphone', 'microphones'],
    'violin': ['violin', 'violines', 'violin', 'violins'],
    'violines': ['violin', 'violines', 'violin', 'violins'],
    'saxofon': ['saxofon', 'saxofones', 'saxophone', 'saxophones', 'sax'],
    'saxofones': ['saxofon', 'saxofones', 'saxophone', 'saxophones', 'sax'],
    'saxophone': ['saxophone', 'saxophones', 'saxofon', 'saxofones', 'sax'],
    'saxophones': ['saxophone', 'saxophones', 'saxofon', 'saxofones', 'sax'],
    'sax': ['sax', 'saxofon', 'saxofones', 'saxophone', 'saxophones'],
    'trompeta': ['trompeta', 'trompetas', 'trumpet', 'trumpets'],
    'trompetas': ['trompeta', 'trompetas', 'trumpet', 'trumpets'],
    'trumpet': ['trumpet', 'trumpets', 'trompeta', 'trompetas'],
    'trumpets': ['trumpet', 'trumpets', 'trompeta', 'trompetas'],
    'flauta': ['flauta', 'flautas', 'flute', 'flutes'],
    'flautas': ['flauta', 'flautas', 'flute', 'flutes'],
    'flute': ['flute', 'flutes', 'flauta', 'flautas'],
    'flutes': ['flute', 'flutes', 'flauta', 'flautas'],
    'electrica': ['electrica', 'electricas', 'electric'],
    'electricas': ['electrica', 'electricas', 'electric'],
    'electric': ['electric', 'electrica', 'electricas'],
    'acustica': ['acustica', 'acusticas', 'acoustic'],
    'acusticas': ['acustica', 'acusticas', 'acoustic'],
    'acoustic': ['acoustic', 'acustica', 'acusticas'],
    'electronica': ['electronica', 'electronicas', 'electronic'],
    'electronicas': ['electronica', 'electronicas', 'electronic'],
    'electronic': ['electronic', 'electronica', 'electronicas']
  };
  
  if (variacionesEspecificas[palabraNormalizada]) {
    variacionesEspecificas[palabraNormalizada].forEach(variacion => {
      variaciones.add(normalizarTexto(variacion));
    });
  }
  
  return Array.from(variaciones);
}

/**
 * Divide un texto de búsqueda en palabras clave y genera todas las variaciones
 * @param textoBusqueda Texto de búsqueda del usuario
 * @returns Array de todas las palabras clave y sus variaciones
 */
export function extraerPalabrasClave(textoBusqueda: string): string[] {
  if (!textoBusqueda) return [];
  
  const palabras = normalizarTexto(textoBusqueda)
    .split(' ')
    .filter(palabra => palabra.length > 2); // Filtrar palabras muy cortas
  
  const todasLasVariaciones = new Set<string>();
  
  palabras.forEach(palabra => {
    const variaciones = generarVariacionesPalabra(palabra);
    variaciones.forEach(variacion => todasLasVariaciones.add(variacion));
  });
  
  return Array.from(todasLasVariaciones);
}

/**
 * Crea condiciones de búsqueda flexibles para Prisma
 * @param campo Campo de la base de datos a buscar
 * @param palabrasClave Array de palabras clave normalizadas
 * @returns Array de condiciones OR para Prisma
 */
export function crearCondicionesBusqueda(campo: string, palabrasClave: string[]) {
  const condiciones = [];
  
  // Para cada palabra clave, crear condiciones tanto para la versión normalizada
  // como para versiones con acentos comunes
  palabrasClave.forEach(palabra => {
    // Agregar la palabra normalizada
    condiciones.push({
      [campo]: { contains: palabra, mode: 'insensitive' as const }
    });
    
    // Agregar versiones con acentos comunes para palabras específicas
    const versionesConAcentos = obtenerVersionesConAcentos(palabra);
    versionesConAcentos.forEach(version => {
      condiciones.push({
        [campo]: { contains: version, mode: 'insensitive' as const }
      });
    });
  });
  
  return condiciones;
}

/**
 * Obtiene versiones con acentos comunes de una palabra normalizada
 * @param palabraNormalizada Palabra sin acentos
 * @returns Array de versiones con acentos
 */
function obtenerVersionesConAcentos(palabraNormalizada: string): string[] {
  const versionesConAcentos: Record<string, string[]> = {
    'bateria': ['batería'],
    'baterias': ['baterías'],
    'guitarra': ['guitarra'], // ya tiene la forma correcta
    'guitarras': ['guitarras'],
    'piano': ['piano'],
    'pianos': ['pianos'],
    'violin': ['violín'],
    'violines': ['violines'],
    'saxofon': ['saxofón'],
    'saxofones': ['saxofones'],
    'microfono': ['micrófono'],
    'microfonos': ['micrófonos'],
    'electrica': ['eléctrica'],
    'electricas': ['eléctricas'],
    'acustica': ['acústica'],
    'acusticas': ['acústicas'],
    'electronica': ['electrónica'],
    'electronicas': ['electrónicas']
  };
  
  return versionesConAcentos[palabraNormalizada] || [];
}

/**
 * Verifica si un texto contiene alguna de las palabras clave (para testing)
 * @param texto Texto a verificar
 * @param palabrasClave Palabras clave a buscar
 * @returns true si encuentra alguna coincidencia
 */
export function contieneAlgunaPalabra(texto: string, palabrasClave: string[]): boolean {
  const textoNormalizado = normalizarTexto(texto);
  return palabrasClave.some(palabra => textoNormalizado.includes(palabra));
}