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
exports.EsContrasenaSeguraConstraint = void 0;
exports.EsContrasenaSegura = EsContrasenaSegura;
/**
 * Validador personalizado de contraseñas siguiendo estándares OWASP.
 * Implementa validaciones adicionales de seguridad.
 */
const class_validator_1 = require("class-validator");
let EsContrasenaSeguraConstraint = (() => {
    let _classDecorators = [(0, class_validator_1.ValidatorConstraint)({ async: false })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var EsContrasenaSeguraConstraint = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            EsContrasenaSeguraConstraint = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        validate(password, args) {
            if (!password)
                return false;
            // Lista de contraseñas comunes prohibidas (OWASP)
            const contrasenasComunes = [
                'password', '123456', '123456789', 'qwerty', 'abc123',
                'password123', 'admin', 'letmein', 'welcome', 'monkey',
                '1234567890', 'password1', '123123', 'admin123'
            ];
            // Verificar que no sea una contraseña común
            if (contrasenasComunes.includes(password.toLowerCase())) {
                return false;
            }
            // Verificar que no contenga secuencias repetitivas
            if (/(.)\1{2,}/.test(password)) {
                return false;
            }
            // Verificar que no contenga secuencias numéricas simples
            if (/123456|654321|012345|987654/.test(password)) {
                return false;
            }
            // Verificar que no contenga secuencias de teclado
            if (/qwerty|asdfgh|zxcvbn|qwertyuiop/.test(password.toLowerCase())) {
                return false;
            }
            return true;
        }
        defaultMessage(args) {
            return 'La contraseña no cumple con los criterios de seguridad: no debe ser una contraseña común, contener secuencias repetitivas o patrones de teclado';
        }
    };
    return EsContrasenaSeguraConstraint = _classThis;
})();
exports.EsContrasenaSeguraConstraint = EsContrasenaSeguraConstraint;
/**
 * Decorador para validar contraseñas seguras
 */
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
