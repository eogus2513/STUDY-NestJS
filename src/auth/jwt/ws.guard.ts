import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthService } from '../auth.service';
import { User } from '../../user/entity/user.entity';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  private logger = new Logger('WsJwtGuard');

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const socket: Socket = context.switchToWs().getClient<Socket>();
      const token: string = socket.handshake.headers.authorization as string;
      const user: User = await this.authService.wsVerify(token);

      context.switchToHttp().getRequest().user = user;

      return Boolean(user);
    } catch (e) {
      this.logger.error(e.message);
      throw new WsException(e.message);
    }
  }
}
