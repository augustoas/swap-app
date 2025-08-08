import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Request, Response } from 'express';
import { IApiResponse } from '../types/Api.interface';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private exceptionResponse: IApiResponse<any> = {
    message: 'Error',
    payload: {},
  };
  private details: any = {};
  private statusCode = 500;

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      this.statusCode = exception.getStatus();
      this.details = exception.getResponse();
    } else if (exception instanceof QueryFailedError) {
      this.statusCode = 409;
      this.details = exception.driverError.constraint;
    }

    this.exceptionResponse.payload = {
      ...this.details,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    console.log(exception);
    response.status(this.statusCode).json(this.exceptionResponse);
  }
}
