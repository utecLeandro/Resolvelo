/**
 * Módulo de autenticación.
 */
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordStrengthService } from './services/password-strength.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, PrismaService, PasswordStrengthService],
})
export class AuthModule {}