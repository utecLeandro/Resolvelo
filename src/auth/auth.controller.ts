/**
 * Controlador de autenticación.
 * Implementa el registro de usuario siguiendo TDD.
 */
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Headers,
  UnauthorizedException,
  Query,
  Res,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PasswordStrengthService } from './services/password-strength.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GubuyValidateDto } from './dto/gubuy-validate.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordStrengthService: PasswordStrengthService,
  ) {}

  /**
   * Endpoint de registro de usuario.
   * Crea la cuenta en estado pendiente de verificación.
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  /**
   * Endpoint para verificar email con token.
   */
  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Query('token') token: string) {
    if (!token) throw new BadRequestException('Token requerido');
    return this.authService.verificarEmail(token);
  }

  /**
   * Endpoint para reenviar correo de verificación.
   */
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body() body: { email: string }) {
    if (!body.email) throw new BadRequestException('Email requerido');
    return this.authService.reenviarVerificacion(body.email);
  }

  /**
   * Endpoint de login de usuario./**
   * Autentica credenciales y devuelve token JWT.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginDto) {
    console.log('🔐 Login request received:', { email: body.email });
    return this.authService.login(body);
  }

  /**
   * Valida la fortaleza de una contraseña en tiempo real.
   */
  @Post('validar-contrasena')
  @HttpCode(HttpStatus.OK)
  async validarContrasena(@Body() body: { password: string }) {
    return this.passwordStrengthService.evaluarFortaleza(body.password);
  }

  /**
   * Inicia el flujo de recuperación de contraseña.
   * Genera token y envía email con instrucciones.
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.iniciarRecuperacion(body.email);
  }

  /**
   * Completa la recuperación de contraseña.
   * Valida token y actualiza la contraseña del usuario.
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetearContrasena(
      body.email,
      body.token,
      body.newPassword,
    );
  }

  /**
   * Devuelve el perfil del usuario autenticado.
   * Usa token JWT en Authorization para extraer el userId.
   */
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async profile(@Headers('authorization') authHeader?: string) {
    if (!authHeader) {
      throw new UnauthorizedException('Falta encabezado Authorization');
    }
    return this.authService.obtenerPerfilDesdeToken(authHeader);
  }

  @Get('gubuy/authorize')
  @HttpCode(HttpStatus.FOUND)
  async gubuyAuthorize(
    @Res() res: Response,
    @Query('redirect_uri') redirectUri: string,
    @Query('state') state?: string,
    @Query('nonce') nonce?: string,
    @Query('scope') scope?: string,
  ) {
    if (!redirectUri) throw new BadRequestException('redirect_uri requerido');
    const { code } = await this.authService.gubuyAuthorize({
      redirectUri,
      state,
      nonce,
      scope,
    });
    const sep = redirectUri.includes('?') ? '&' : '?';
    const url = `${redirectUri}${sep}code=${encodeURIComponent(code)}${state ? `&state=${encodeURIComponent(state)}` : ''}`;
    res.redirect(url);
  }

  @Post('gubuy/token')
  @HttpCode(HttpStatus.OK)
  async gubuyToken(@Body() body: { code: string; redirect_uri: string }) {
    return this.authService.gubuyTokenExchange(body.code, body.redirect_uri);
  }

  @Post('gubuy/validate')
  @HttpCode(HttpStatus.OK)
  async gubuyValidate(@Body() body: GubuyValidateDto) {
    return this.authService.gubuyValidate(body);
  }
}
