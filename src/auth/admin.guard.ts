import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException(
        'Acceso restringido: usuario no autenticado',
      );
    }

    const rol = user.rol;
    if (rol === 'ADMINISTRADOR' || rol === 'SUPER_ADMIN') {
      return true;
    }

    throw new ForbiddenException(
      'Acceso restringido: requiere rol de administrador',
    );
  }
}
