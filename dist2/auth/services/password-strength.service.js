"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordStrengthService = void 0;
const common_1 = require("@nestjs/common");
let PasswordStrengthService = class PasswordStrengthService {
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
        if (this.esContrasenaComun(password)) {
            resultado.errores.push('No se permiten contraseñas comunes');
            resultado.esValida = false;
            puntuacion -= 20;
        }
        if (this.tienePatronesRepetitivos(password)) {
            resultado.errores.push('No se permiten patrones repetitivos');
            resultado.esValida = false;
            puntuacion -= 15;
        }
        if (this.tieneSecuenciasTeclado(password)) {
            resultado.errores.push('No se permiten secuencias de teclado');
            resultado.esValida = false;
            puntuacion -= 15;
        }
        const caracteresUnicos = new Set(password).size;
        if (caracteresUnicos >= password.length * 0.7) {
            puntuacion += 10;
        }
        resultado.puntuacion = Math.max(0, Math.min(100, puntuacion));
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
        this.generarSugerencias(password, resultado);
        return resultado;
    }
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
    tienePatronesRepetitivos(password) {
        if (/(.)\1{2,}/.test(password)) {
            return true;
        }
        if (/123456|654321|012345|987654|234567|765432/.test(password)) {
            return true;
        }
        return false;
    }
    tieneSecuenciasTeclado(password) {
        const secuenciasTeclado = [
            'qwerty', 'qwertyuiop', 'asdfgh', 'asdfghjkl',
            'zxcvbn', 'zxcvbnm', '1234567890'
        ];
        const passwordLower = password.toLowerCase();
        return secuenciasTeclado.some(secuencia => passwordLower.includes(secuencia));
    }
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
exports.PasswordStrengthService = PasswordStrengthService;
exports.PasswordStrengthService = PasswordStrengthService = __decorate([
    (0, common_1.Injectable)()
], PasswordStrengthService);
