import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('Http');

  use(request: Request, response: Response, next: NextFunction) {
    // response.on('finish', () => {
    //   this.logger.log(`${request.method} ${request.url}`);
    // });
    next();
  }
}
