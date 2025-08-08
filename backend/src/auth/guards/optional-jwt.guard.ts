import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

@Injectable()
export class OptionalJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    console.log('######################## OptionalJwtGuard');

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      try {
        const decodedToken = this.jwtService.verify(token);
        request.user = decodedToken;
      } catch (error) {
        request.user = null; // Si el token es inválido, el usuario sigue siendo null
      }
    } else {
      request.user = null; // No hay token, el usuario es null
    }
    return true; // Siempre permite el acceso, ya que el token es opcional
  }
}
