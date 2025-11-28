"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImagenesService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
let ImagenesService = class ImagenesService {
    async generarPresignUrls(payload) {
        const s3Enabled = String(process.env.S3_ENABLED || '').toLowerCase() === 'true';
        if (!s3Enabled) {
            throw new common_1.NotImplementedException('S3 no configurado');
        }
        const bucket = process.env.S3_BUCKET || '';
        const region = process.env.S3_REGION || '';
        if (!bucket || !region) {
            throw new common_1.BadRequestException('Variables S3_BUCKET y S3_REGION requeridas');
        }
        const uploads = payload.files.map((f) => {
            const ext = this.extensionFromContentType(f.contentType);
            const key = `publicaciones/${payload.publicacionId}/${(0, node_crypto_1.randomUUID)()}.${ext}`;
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
            const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
            return { key, url, method: 'PUT', expiresAt, contentType: f.contentType };
        });
        return { uploads };
    }
    extensionFromContentType(ct) {
        if (ct === 'image/jpeg')
            return 'jpg';
        if (ct === 'image/png')
            return 'png';
        if (ct === 'image/webp')
            return 'webp';
        return 'bin';
    }
};
exports.ImagenesService = ImagenesService;
exports.ImagenesService = ImagenesService = __decorate([
    (0, common_1.Injectable)()
], ImagenesService);
