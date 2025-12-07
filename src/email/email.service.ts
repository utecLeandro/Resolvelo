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
    process.env.EMAIL_FROM || 'plataformaresolvelo@gmail.com';

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
   * Envía un correo de verificación de cuenta con un token
   */
  async enviarCorreoVerificacion(to: string, nombre: string, token: string) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const link = `${frontendUrl}/verificar-email?token=${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563EB;">¡Bienvenido a ReSolVelo!</h2>
        <p>Hola ${nombre},</p>
        <p>Gracias por registrarte. Para activar tu cuenta, por favor verifica tu correo electrónico haciendo clic en el siguiente botón:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${link}" style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verificar mi correo</a>
        </div>
        <p>O copia y pega este enlace en tu navegador:</p>
        <p><a href="${link}">${link}</a></p>
        <p>Si no creaste esta cuenta, puedes ignorar este correo.</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">ReSolVelo - Alquiler de Instrumentos Musicales</p>
      </div>
    `;

    return this.sendMail(to, 'Verifica tu cuenta en ReSolVelo', html);
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
