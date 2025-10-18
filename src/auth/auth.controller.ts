/**
 * Controlador de autenticación.
 * Implementa el registro de usuario siguiendo TDD.
 */
import { Controller, Post, Body, HttpCode, HttpStatus, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PasswordStrengthService } from './services/password-strength.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordStrengthService: PasswordStrengthService
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
}