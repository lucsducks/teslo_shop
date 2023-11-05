import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
interface ConnectedClients {
    [id: string]: { socket: Socket, user: User }
}
@Injectable()
export class MessagesWsService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }
    private connectClients: ConnectedClients = {}
    async registerClient(client: Socket, userId: string) {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) {
            throw new Error('user not found')
        }
        if (!user.isActive) throw new Error('user is not active')
        this.checkUserConnected(user);
        this.connectClients[client.id] = {
            socket: client,
            user
        };
    }
    removeClient(clientId: string) {
        delete this.connectClients[clientId];
    }
    getconnectClients(): string[] {
        return Object.keys(this.connectClients);
    }
    getuserFullName(socketId: string): string {
        return this.connectClients[socketId].user.fullname;
    }
    private checkUserConnected(user: User) {
        for (const clientId of Object.keys(this.connectClients)) {
            const conectedClient = this.connectClients[clientId];
            if (conectedClient.user.id === user.id) {
                conectedClient.socket.disconnect();
                break;
            }
        }
    }
}

