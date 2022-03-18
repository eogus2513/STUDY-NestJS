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
import { Logger } from '@nestjs/common';

@WebSocketGateway()
export class EventGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('EventGateway');

  @SubscribeMessage('events')
  handleEvent(@MessageBody() data: string): string {
    return data;
  }

  afterInit(server: Server) {
    this.logger.log('init');
  }

  public handleConnection(socket: Socket) {
    this.logger.log(`Client Connected : ${socket.id}`);
  }

  public handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.logger.log(`Client DisConnected : ${socket.id}`);
  }
}
