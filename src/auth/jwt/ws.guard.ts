import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthService } from '../auth.service';
import { User } from '../../user/entity/user.entity';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const socket: Socket = context.switchToWs().getClient<Socket>();
      const user: User = await this.authService.wsVerify(
        socket.handshake.headers.authroization.toString(),
      );
      context.switchToHttp().getRequest().user = user;

      return Boolean(user);
    } catch (e) {
      throw new WsException(e.message);
    }
  }
}
