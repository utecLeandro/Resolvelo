"use strict";
/**
 * Validadores personalizados para fechas en reservas
 */
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
exports.IsAfterConstraint = exports.IsFutureDateConstraint = void 0;
exports.IsFutureDate = IsFutureDate;
exports.IsAfter = IsAfter;
const class_validator_1 = require("class-validator");
/**
 * Validador que verifica que una fecha sea en el futuro
 */
let IsFutureDateConstraint = (() => {
    let _classDecorators = [(0, class_validator_1.ValidatorConstraint)({ name: 'isFutureDate', async: false })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var IsFutureDateConstraint = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            IsFutureDateConstraint = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        validate(value, args) {
            if (!value)
                return false;
            try {
                const inputDate = new Date(value);
                const now = new Date();
                // Verificar que la fecha sea válida
                if (isNaN(inputDate.getTime())) {
                    return false;
                }
                // Verificar que sea desde el día actual (medianoche)
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                return inputDate >= today;
            }
            catch (error) {
                return false;
            }
        }
        defaultMessage(args) {
            return 'La fecha debe ser desde el día actual en adelante';
        }
    };
    return IsFutureDateConstraint = _classThis;
})();
exports.IsFutureDateConstraint = IsFutureDateConstraint;
/**
 * Validador que verifica que una fecha sea posterior a otra propiedad
 */
let IsAfterConstraint = (() => {
    let _classDecorators = [(0, class_validator_1.ValidatorConstraint)({ name: 'isAfter', async: false })];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var IsAfterConstraint = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            IsAfterConstraint = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        validate(value, args) {
            if (!value)
                return false;
            const [relatedPropertyName] = args.constraints;
            const relatedValue = args.object[relatedPropertyName];
            if (!relatedValue)
                return false;
            try {
                const currentDate = new Date(value);
                const relatedDate = new Date(relatedValue);
                // Verificar que ambas fechas sean válidas
                if (isNaN(currentDate.getTime()) || isNaN(relatedDate.getTime())) {
                    return false;
                }
                // Verificar que la fecha actual sea posterior o igual a la fecha relacionada
                // Permitir alquileres de un solo día (fecha inicio = fecha fin)
                return currentDate >= relatedDate;
            }
            catch (error) {
                return false;
            }
        }
        defaultMessage(args) {
            const [relatedPropertyName] = args.constraints;
            return `La fecha debe ser posterior o igual a ${relatedPropertyName}`;
        }
    };
    return IsAfterConstraint = _classThis;
})();
exports.IsAfterConstraint = IsAfterConstraint;
/**
 * Decorador para validar que una fecha sea en el futuro
 */
function IsFutureDate(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsFutureDateConstraint,
        });
    };
}
/**
 * Decorador para validar que una fecha sea posterior a otra propiedad
 */
function IsAfter(property, validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [property],
            validator: IsAfterConstraint,
        });
    };
}
