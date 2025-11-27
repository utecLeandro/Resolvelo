"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsAfterConstraint = exports.IsFutureDateConstraint = void 0;
exports.IsFutureDate = IsFutureDate;
exports.IsAfter = IsAfter;
const class_validator_1 = require("class-validator");
let IsFutureDateConstraint = class IsFutureDateConstraint {
    validate(value, args) {
        if (!value)
            return false;
        const parseLocalDate = (v) => {
            if (typeof v === 'string') {
                const m = v.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})(?:[T ]([0-9]{2}):([0-9]{2}):([0-9]{2}))?$/);
                if (m) {
                    const y = Number(m[1]);
                    const mo = Number(m[2]) - 1;
                    const d = Number(m[3]);
                    const hh = m[4] ? Number(m[4]) : 0;
                    const mm = m[5] ? Number(m[5]) : 0;
                    const ss = m[6] ? Number(m[6]) : 0;
                    return new Date(y, mo, d, hh, mm, ss);
                }
            }
            return new Date(v);
        };
        try {
            const inputDate = parseLocalDate(value);
            const now = new Date();
            if (isNaN(inputDate.getTime())) {
                return false;
            }
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
exports.IsFutureDateConstraint = IsFutureDateConstraint;
exports.IsFutureDateConstraint = IsFutureDateConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'isFutureDate', async: false })
], IsFutureDateConstraint);
let IsAfterConstraint = class IsAfterConstraint {
    validate(value, args) {
        if (!value)
            return false;
        const [relatedPropertyName] = args.constraints;
        const relatedValue = args.object[relatedPropertyName];
        if (!relatedValue)
            return false;
        const parseLocalDate = (v) => {
            if (typeof v === 'string') {
                const m = v.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})(?:[T ]([0-9]{2}):([0-9]{2}):([0-9]{2}))?$/);
                if (m) {
                    const y = Number(m[1]);
                    const mo = Number(m[2]) - 1;
                    const d = Number(m[3]);
                    const hh = m[4] ? Number(m[4]) : 0;
                    const mm = m[5] ? Number(m[5]) : 0;
                    const ss = m[6] ? Number(m[6]) : 0;
                    return new Date(y, mo, d, hh, mm, ss);
                }
            }
            return new Date(v);
        };
        try {
            const currentDate = parseLocalDate(value);
            const relatedDate = parseLocalDate(relatedValue);
            if (isNaN(currentDate.getTime()) || isNaN(relatedDate.getTime())) {
                return false;
            }
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
exports.IsAfterConstraint = IsAfterConstraint;
exports.IsAfterConstraint = IsAfterConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'isAfter', async: false })
], IsAfterConstraint);
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
