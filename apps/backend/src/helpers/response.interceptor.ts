import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IApiResponse } from '../types/Api.interface';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, IApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const routePath = request.route.path;

    const excludedRoute = '/backend/metrics'; // Change this to the route you want to exclude
    // Check if the current route matches the excluded route
    if (routePath === excludedRoute) return next.handle();
    // Check for error responses (status code >= 400)
    if (response.statusCode >= HttpStatus.BAD_REQUEST) return next.handle();

    return next.handle().pipe(
      map((data) => ({
        message: data.message,
        payload: data.payload,
      })),
    );
  }
}
