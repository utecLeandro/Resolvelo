import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import {
  SESv2Client,
  SendEmailCommand,
  CreateEmailIdentityCommand,
} from '@aws-sdk/client-sesv2';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private sesClient: SESv2Client;
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail =
    process.env.EMAIL_FROM || 'no-reply@resolvelo.com';

  constructor() {
    // Configuración AWS SES v2
    this.sesClient = new SESv2Client({
      region: process.env.AWS_REGION || 'us-east-1',
      // En producción (App Runner) usa credenciales del rol IAM automáticamente.
      // En local (develop), usa AWS_ACCESS_KEY_ID y AWS_SECRET_ACCESS_KEY del .env
      credentials:
        process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
          ? {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            }
          : undefined,
    });

    // Crear transporte usando SES y el SDK v3 (client-sesv2)
    // Nodemailer v7 requiere pasar sesClient y SendEmailCommand explícitamente
    this.transporter = nodemailer.createTransport({
      SES: { sesClient: this.sesClient, SendEmailCommand },
    });

    this.logger.log('📧 EmailService inicializado con AWS SES v2');
  }

  /**
   * Envía un correo electrónico utilizando AWS SES
   * @param to Destinatario
   * @param subject Asunto
   * @param html Cuerpo del correo en HTML
   */
  async sendMail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: this.fromEmail,
        to,
        subject,
        html,
      });
      this.logger.log(
        `✅ Email enviado a ${to} (MessageId: ${info.messageId})`,
      );
      return info;
    } catch (error: any) {
      this.logger.error(
        `❌ Error enviando email a ${to}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Solicita a AWS SES que envíe un email de verificación a la dirección indicada.
   * Esto es necesario en modo Sandbox para poder enviar correos a esta dirección.
   */
  async verificarIdentidadEmail(email: string) {
    try {
      // En SESv2 se usa CreateEmailIdentityCommand
      const command = new CreateEmailIdentityCommand({ EmailIdentity: email });
      await this.sesClient.send(command);
      this.logger.log(`✅ Solicitud de verificación enviada a ${email}`);
    } catch (error: any) {
      // Si ya existe, AWS devuelve un error, lo ignoramos o logueamos como warning
      this.logger.warn(
        `⚠️ Error al solicitar verificación para ${email}: ${error.message}`,
      );
    }
  }
}
