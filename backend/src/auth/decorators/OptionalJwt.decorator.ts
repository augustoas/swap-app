import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export const OptionalJwt = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const jwtService = new JwtService();
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;
    if (token) {
      try {
        const decodedToken = jwtService.verify(token.replace('Bearer ', ''));
        request.user = decodedToken;
      } catch (error) {
        request.user = null;
      }
    }

    return request.user;
  },
);
