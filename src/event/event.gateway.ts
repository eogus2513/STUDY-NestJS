import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';
import { User } from '../user/entity/user.entity';
import { Logger } from '@nestjs/common';
import { Payload } from '../auth/jwt/jwt.payload';

@WebSocketGateway(3001, { namespace: 'socket.io' })
export class EventGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @WebSocketServer() server: Server;

  private logger = new Logger('SOCKET');

  @SubscribeMessage('events')
  handleEvent(@MessageBody() data: string): string {
    return data;
  }

  afterInit(server: Server) {
    this.logger.log('init');
  }

  public async handleConnection(socket: Socket) {
    const payload: Payload = await this.authService.verify(
      socket.handshake.headers.authorization,
    );
    const user: User = await this.userService.findOne(payload.sub);

    if (!user) {
      socket.disconnect();
    } else {
      this.logger.log(`Connected : ${socket.id}`);
    }
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log(`DisConnected : ${socket.id}`);
    //socket.disconnect();
  }
}
