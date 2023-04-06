import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    WebSocketGateway,
    WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class DownloadGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer() server: Server;
    private clients = {};

    afterInit() {
        console.log('WebSocket gateway initialized');
    }

    handleConnection(client: Socket) {
        console.log(`client connected: ${client.id}`);
        this.clients[client.id] = client;
    }

    handleDisconnect(client: Socket) {
        console.log(`client disconnected: ${client.id}`);
        delete this.clients[client.id];
    }

    mergeProgress(clientId: string, payload: object) {
        const client = this.clients[clientId];
        if (client) {
            client.emit('mergeProgress', payload);
        }
    }

    mergeFinished(clientId: string, status: string) {
        const client = this.clients[clientId];
        if (client) {
            client.emit('mergeFinished', status);
        }
    }

    downloadProgress(clientId: string, payload: Asd) {
        const client = this.clients[clientId];
        if (client) {
            client.emit('downloadProgress', payload);
        }
    }

    downloadFinished(clientId: string, status: string) {
        const client = this.clients[clientId];
        if (client) {
            client.emit('downloadFinished', status);
        }
    }
}

interface Asd {
    progress: number;
    downloaded: number;
    totalSize: number;
}

interface Progress {
    frames: number;
    fps: number;
    kbps: number;
    sizeMb: number;
    time: string;
}
