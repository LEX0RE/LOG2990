// Fichier tiré des notes de cours
import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class SocketClientService {
    private socket: Socket;

    get socketId(): string {
        return this.socket && this.socket.id ? this.socket.id : '';
    }

    isSocketAlive(): boolean {
        return this.socket && this.socket.connected;
    }

    connect(): void {
        if (!this.socket) this.socket = io(environment.socketUrl, { transports: ['websocket'], upgrade: false });
    }

    disconnect(): void {
        this.socket.disconnect();
    }

    on<T>(event: string, action: (data: T) => void): void {
        if (this.socket) this.socket.on(event, action);
    }

    send<T>(event: string, data?: T): void {
        if (this.socket) {
            if (data) this.socket.emit(event, data);
            else this.socket.emit(event);
        }
    }
}
