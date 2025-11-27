"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EsContrasenaSeguraConstraint = void 0;
exports.EsContrasenaSegura = EsContrasenaSegura;
const class_validator_1 = require("class-validator");
let EsContrasenaSeguraConstraint = class EsContrasenaSeguraConstraint {
    validate(password, args) {
        if (!password)
            return false;
        const contrasenasComunes = [
            'password', '123456', '123456789', 'qwerty', 'abc123',
            'password123', 'admin', 'letmein', 'welcome', 'monkey',
            '1234567890', 'password1', '123123', 'admin123'
        ];
        if (contrasenasComunes.includes(password.toLowerCase())) {
            return false;
        }
        if (/(.)\1{2,}/.test(password)) {
            return false;
        }
        if (/123456|654321|012345|987654/.test(password)) {
            return false;
        }
        if (/qwerty|asdfgh|zxcvbn|qwertyuiop/.test(password.toLowerCase())) {
            return false;
        }
        return true;
    }
    defaultMessage(args) {
        return 'La contraseña no cumple con los criterios de seguridad: no debe ser una contraseña común, contener secuencias repetitivas o patrones de teclado';
    }
};
exports.EsContrasenaSeguraConstraint = EsContrasenaSeguraConstraint;
exports.EsContrasenaSeguraConstraint = EsContrasenaSeguraConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ async: false })
], EsContrasenaSeguraConstraint);
function EsContrasenaSegura(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: EsContrasenaSeguraConstraint,
        });
    };
}
