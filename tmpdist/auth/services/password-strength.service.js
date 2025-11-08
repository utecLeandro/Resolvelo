"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordStrengthService = void 0;
/**
 * Servicio para evaluar la fortaleza de contraseñas.
 * Implementa criterios OWASP para validación de contraseñas seguras.
 */
const common_1 = require("@nestjs/common");
let PasswordStrengthService = (() => {
    let _classDecorators = [(0, common_1.Injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var PasswordStrengthService = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            PasswordStrengthService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        /**
         * Evalúa la fortaleza de una contraseña
         */
        evaluarFortaleza(password) {
            const resultado = {
                esValida: true,
                puntuacion: 0,
                nivel: 'muy_debil',
                sugerencias: [],
                errores: []
            };
            if (!password) {
                resultado.esValida = false;
                resultado.errores.push('La contraseña es requerida');
                return resultado;
            }
            let puntuacion = 0;
            // Verificar longitud mínima (OWASP recomienda 8+ caracteres)
            if (password.length < 8) {
                resultado.errores.push('La contraseña debe tener al menos 8 caracteres');
                resultado.esValida = false;
            }
            else if (password.length >= 8) {
                puntuacion += 10;
            }
            if (password.length >= 12) {
                puntuacion += 10;
            }
            if (password.length >= 16) {
                puntuacion += 10;
            }
            // Verificar complejidad de caracteres
            const tieneMinuscula = /[a-z]/.test(password);
            const tieneMayuscula = /[A-Z]/.test(password);
            const tieneNumero = /\d/.test(password);
            const tieneEspecial = /[@$!%*?&]/.test(password);
            if (!tieneMinuscula) {
                resultado.errores.push('Debe contener al menos una letra minúscula');
                resultado.esValida = false;
            }
            else {
                puntuacion += 15;
            }
            if (!tieneMayuscula) {
                resultado.errores.push('Debe contener al menos una letra mayúscula');
                resultado.esValida = false;
            }
            else {
                puntuacion += 15;
            }
            if (!tieneNumero) {
                resultado.errores.push('Debe contener al menos un número');
                resultado.esValida = false;
            }
            else {
                puntuacion += 15;
            }
            if (!tieneEspecial) {
                resultado.errores.push('Debe contener al menos un carácter especial (@$!%*?&)');
                resultado.esValida = false;
            }
            else {
                puntuacion += 15;
            }
            // Verificar contraseñas comunes
            if (this.esContrasenaComun(password)) {
                resultado.errores.push('No se permiten contraseñas comunes');
                resultado.esValida = false;
                puntuacion -= 20;
            }
            // Verificar patrones repetitivos
            if (this.tienePatronesRepetitivos(password)) {
                resultado.errores.push('No se permiten patrones repetitivos');
                resultado.esValida = false;
                puntuacion -= 15;
            }
            // Verificar secuencias de teclado
            if (this.tieneSecuenciasTeclado(password)) {
                resultado.errores.push('No se permiten secuencias de teclado');
                resultado.esValida = false;
                puntuacion -= 15;
            }
            // Bonificaciones por diversidad
            const caracteresUnicos = new Set(password).size;
            if (caracteresUnicos >= password.length * 0.7) {
                puntuacion += 10;
            }
            // Asegurar que la puntuación esté entre 0 y 100
            resultado.puntuacion = Math.max(0, Math.min(100, puntuacion));
            // Determinar nivel de fortaleza
            if (resultado.puntuacion >= 90) {
                resultado.nivel = 'muy_fuerte';
            }
            else if (resultado.puntuacion >= 70) {
                resultado.nivel = 'fuerte';
            }
            else if (resultado.puntuacion >= 50) {
                resultado.nivel = 'media';
            }
            else if (resultado.puntuacion >= 30) {
                resultado.nivel = 'debil';
            }
            else {
                resultado.nivel = 'muy_debil';
            }
            // Generar sugerencias
            this.generarSugerencias(password, resultado);
            return resultado;
        }
        /**
         * Verifica si es una contraseña común
         */
        esContrasenaComun(password) {
            const contrasenasComunes = [
                'password', '123456', '123456789', 'qwerty', 'abc123',
                'password123', 'admin', 'letmein', 'welcome', 'monkey',
                '1234567890', 'password1', '123123', 'admin123', 'iloveyou',
                'princess', 'rockyou', '12345678', 'abc123', 'nicole',
                'daniel', 'babygirl', 'monkey', 'lovely', 'jessica'
            ];
            return contrasenasComunes.includes(password.toLowerCase());
        }
        /**
         * Verifica patrones repetitivos
         */
        tienePatronesRepetitivos(password) {
            // Más de 2 caracteres consecutivos iguales
            if (/(.)\1{2,}/.test(password)) {
                return true;
            }
            // Secuencias numéricas
            if (/123456|654321|012345|987654|234567|765432/.test(password)) {
                return true;
            }
            return false;
        }
        /**
         * Verifica secuencias de teclado
         */
        tieneSecuenciasTeclado(password) {
            const secuenciasTeclado = [
                'qwerty', 'qwertyuiop', 'asdfgh', 'asdfghjkl',
                'zxcvbn', 'zxcvbnm', '1234567890'
            ];
            const passwordLower = password.toLowerCase();
            return secuenciasTeclado.some(secuencia => passwordLower.includes(secuencia));
        }
        /**
         * Genera sugerencias para mejorar la contraseña
         */
        generarSugerencias(password, resultado) {
            if (password.length < 12) {
                resultado.sugerencias.push('Considera usar al menos 12 caracteres para mayor seguridad');
            }
            if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
                resultado.sugerencias.push('Incluye más variedad de caracteres especiales');
            }
            if (resultado.nivel === 'debil' || resultado.nivel === 'muy_debil') {
                resultado.sugerencias.push('Evita palabras del diccionario y información personal');
                resultado.sugerencias.push('Usa una frase de contraseña con espacios y números');
            }
            if (resultado.nivel !== 'muy_fuerte') {
                resultado.sugerencias.push('Considera usar un gestor de contraseñas para generar contraseñas únicas');
            }
        }
    };
    return PasswordStrengthService = _classThis;
})();
exports.PasswordStrengthService = PasswordStrengthService;
