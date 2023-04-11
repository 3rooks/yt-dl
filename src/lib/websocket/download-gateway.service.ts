import { Logger } from '@nestjs/common';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    WebSocketGateway,
    WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MergeProgress } from 'src/interfaces/merge-progress.interface';

@WebSocketGateway()
export class DownloadGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer() server: Server;
    private clients = {};
    private logger = new Logger();

    afterInit() {
        this.logger.log('WebSocket gateway initialized');
    }

    handleConnection(client: Socket) {
        this.logger.log(`client connected: ${client.id}`);
        this.clients[client.id] = client;
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`client disconnected: ${client.id}`);
        delete this.clients[client.id];
    }

    mergeProgress(clientId: string, payload: MergeProgress) {
        const client = this.clients[clientId];
        if (client) client.emit('mergeProgress', payload);
    }

    mergeFinished(clientId: string, status: string) {
        const client = this.clients[clientId];
        if (client) client.emit('mergeFinished', status);
    }

    downloadProgress(clientId: string, payload: string) {
        const client = this.clients[clientId];
        if (client) client.emit('downloadProgress', payload);
    }

    downloadFinished(clientId: string, status: string) {
        const client = this.clients[clientId];
        if (client) client.emit('downloadFinished', status);
    }

    downloadVideosChannel(clientId: string, payload: channelProgress) {
        const client = this.clients[clientId];
        if (client) client.emit('downloadedVideos', payload);
    }

    downloadChannelProgress(clientId: string, payload: number) {
        const client = this.clients[clientId];
        if (client) client.emit('downloadChannelProgress', payload);
    }

    downloadChannelFinished(clientId: string, status: string) {
        const client = this.clients[clientId];
        if (client) client.emit('downloadChannelFinished', status);
    }
}

interface channelProgress {
    progressVideos: number;
    totalVideos: number;
}
