import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() wss: Server;
  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService

  ) { }
  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(token);
      await this.messagesWsService.registerClient(client, payload.id);
    } catch (error) {
      client.disconnect();
      return;
    }


    this.wss.emit('clients-updated', this.messagesWsService.getconnectClients());
  }
  handleDisconnect(client: Socket) {
    this.messagesWsService.removeClient(client.id);
    this.wss.emit('clients-updated', this.messagesWsService.getconnectClients());
  }
  @SubscribeMessage('message-client')
  handleMessageClient(client: Socket, payload: NewMessageDto) {
    //mandarme mensaje a mi mismo
    // client.emit('message-server', { fullname: 'edaurdio', message: payload.message || 'hola' });
    // mandar mensaje a todos menos a mi mismo
    // client.broadcast.emit('message-server', { fullName: this.messagesWsService.getuserFullName(client.id), message: payload.message || 'hola' });
    //para todos incluuyendo a mi 
    this.wss.emit('message-server', { fullName: this.messagesWsService.getuserFullName(client.id), message: payload.message || 'hola' });
  }
}
