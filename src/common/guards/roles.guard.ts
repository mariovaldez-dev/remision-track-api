import { Injectable, CanActivate, ExecutionContext, Logger, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no hay roles requeridos, la ruta es pública
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      this.logger.warn('RolesGuard: no hay usuario en request (JWT no validó)');
      return false;
    }

    const userRole: string = user.rol ?? '';

    // SUPER_ADMIN siempre tiene acceso a todo
    if (userRole === 'SUPER_ADMIN') {
      return true;
    }

    const hasRole = requiredRoles.some((r) => r === userRole);

    if (!hasRole) {
      throw new ForbiddenException(
        `Tu rol "${userRole}" no tiene permiso para esta operación`,
      );
    }

    return true;
  }
}
