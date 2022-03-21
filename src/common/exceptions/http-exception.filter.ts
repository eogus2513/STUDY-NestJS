import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class httpExceptionFilter implements ExceptionFilter {
  private readonly logger: Logger = new Logger('ExceptionFilter');

  catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request: Request = context.getRequest();
    const response: Response = context.getResponse();
    const status: number = exception.getStatus
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = {
      statusCode: status,
      message:
        status !== HttpStatus.INTERNAL_SERVER_ERROR
          ? exception.message
          : 'Internal Server Error',
    };

    this.logger.error(
      `${request.method} ${request.url}`,
      JSON.stringify(errorResponse),
    );
    response.status(status).json(errorResponse);
  }
}
