"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizarTexto = normalizarTexto;
exports.generarVariacionesPalabra = generarVariacionesPalabra;
exports.extraerPalabrasClave = extraerPalabrasClave;
exports.crearCondicionesBusqueda = crearCondicionesBusqueda;
exports.contieneAlgunaPalabra = contieneAlgunaPalabra;
function normalizarTexto(texto) {
    if (!texto)
        return '';
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}
function generarVariacionesPalabra(palabra) {
    const palabraNormalizada = normalizarTexto(palabra);
    const variaciones = new Set([palabraNormalizada]);
    if (palabraNormalizada.endsWith('s') && palabraNormalizada.length > 2) {
        variaciones.add(palabraNormalizada.slice(0, -1));
    }
    if (!palabraNormalizada.endsWith('s')) {
        variaciones.add(palabraNormalizada + 's');
    }
    const variacionesEspecificas = {
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
function extraerPalabrasClave(textoBusqueda) {
    if (!textoBusqueda)
        return [];
    const palabras = normalizarTexto(textoBusqueda)
        .split(' ')
        .filter(palabra => palabra.length > 2);
    const todasLasVariaciones = new Set();
    palabras.forEach(palabra => {
        const variaciones = generarVariacionesPalabra(palabra);
        variaciones.forEach(variacion => todasLasVariaciones.add(variacion));
    });
    return Array.from(todasLasVariaciones);
}
function crearCondicionesBusqueda(campo, palabrasClave) {
    const condiciones = [];
    palabrasClave.forEach(palabra => {
        condiciones.push({
            [campo]: { contains: palabra, mode: 'insensitive' }
        });
        const versionesConAcentos = obtenerVersionesConAcentos(palabra);
        versionesConAcentos.forEach(version => {
            condiciones.push({
                [campo]: { contains: version, mode: 'insensitive' }
            });
        });
    });
    return condiciones;
}
function obtenerVersionesConAcentos(palabraNormalizada) {
    const versionesConAcentos = {
        'bateria': ['batería'],
        'baterias': ['baterías'],
        'guitarra': ['guitarra'],
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
function contieneAlgunaPalabra(texto, palabrasClave) {
    const textoNormalizado = normalizarTexto(texto);
    return palabrasClave.some(palabra => textoNormalizado.includes(palabra));
}
