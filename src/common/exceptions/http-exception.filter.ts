import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class httpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const message = exception.getResponse() as
      | string
      | { error: string; statusCode: number; message: string | string[] };

    if (typeof message === 'string') {
      response.status(status).json({
        statusCode: status,
        message: message,
        path: request.url,
      });
    } else {
      response.status(status).json({
        statusCode: status,
        message,
      });
    }
  }
}
