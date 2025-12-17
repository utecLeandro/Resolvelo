import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key: Buffer;
  private readonly ivLength = 16; // AES block size

  constructor() {
    // En producción, esto DEBE venir de variables de entorno
    // Generamos una clave si no existe (para desarrollo) o usamos la de ENV
    const secret =
      process.env.ENCRYPTION_KEY ||
      'resolvelo-secret-key-development-32bytes!!';

    // Aseguramos que la clave sea de 32 bytes para aes-256
    this.key = crypto.scryptSync(secret, 'salt', 32);
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Retornamos IV:ContenidoEncriptado
    return `${iv.toString('hex')}:${encrypted}`;
  }

  decrypt(text: string): string {
    const [ivHex, encryptedHex] = text.split(':');

    if (!ivHex || !encryptedHex) {
      throw new Error('Formato de texto encriptado inválido');
    }

    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
