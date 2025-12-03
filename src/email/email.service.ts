import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SESClient, SendRawEmailCommand, VerifyEmailIdentityCommand } from '@aws-sdk/client-ses';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private sesClient: SESClient;
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail = process.env.EMAIL_FROM || 'no-reply@resolvelo.com';

  constructor() {
    // Configuración AWS SES
    this.sesClient = new SESClient({
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

    // Crear transporte usando SES
    this.transporter = nodemailer.createTransport({
      SES: { ses: this.sesClient, aws: { SendRawEmailCommand } },
    });

    this.logger.log('📧 EmailService inicializado con AWS SES');
  }

  /**
   * Envía un correo electrónico utilizando AWS SES
   * @param to Destinatario
   * @param subject Asunto
   * @param html Cuerpo del correo en HTML
   */
  async sendMail(to: string, subject: string, html: string) {
    try {
      // En desarrollo, si no estamos seguros de que el email está verificado, podríamos tener problemas en Sandbox.
      // Sin embargo, la responsabilidad de verificar emails recae en el flujo de registro.
      const info = await this.transporter.sendMail({
        from: this.fromEmail,
        to,
        subject,
        html,
      });
      this.logger.log(`✅ Email enviado a ${to} (MessageId: ${info.messageId})`);
      return info;
    } catch (error: any) {
      this.logger.error(`❌ Error enviando email a ${to}: ${error.message}`, error.stack);
      // No lanzamos el error para no romper el flujo principal (ej: creación de reserva)
      // pero lo logueamos para monitoreo.
    }
  }

  /**
   * Solicita a AWS SES que envíe un email de verificación a la dirección indicada.
   * Esto es necesario en modo Sandbox para poder enviar correos a esta dirección.
   */
  async verificarIdentidadEmail(email: string) {
    try {
      const command = new VerifyEmailIdentityCommand({ EmailAddress: email });
      await this.sesClient.send(command);
      this.logger.log(`✅ Solicitud de verificación enviada a ${email}`);
    } catch (error: any) {
      this.logger.warn(`⚠️ Error al solicitar verificación para ${email}: ${error.message}`);
      // No lanzamos error para no interrumpir el flujo principal (registro)
    }
  }
}
