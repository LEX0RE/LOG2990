import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HOME_PAGE_URL } from '@app/constants/utils';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { CONNECT, ID, MESSAGE, RECONNECTION, SURRENDER_EVENT } from '@common/constants/communication';
import { Message } from '@common/interfaces/message';

@Injectable({
    providedIn: 'root',
})
export class MessageSenderService {
    message: Message[];
    socketService: SocketClientService;
    router: Router;

    constructor(socketService: SocketClientService, router: Router) {
        this.message = [];
        this.socketService = socketService;
        this.router = router;
        this.connect();
        this.configureSocket();
        this.saveSocket();
    }

    disconnect(): void {
        this.socketService.disconnect();
        localStorage.clear();
    }

    surrender(): void {
        this.sendToServer(SURRENDER_EVENT, this.socketService.socketId);
    }

    sendToServer(event: string, content: string): void {
        const data: Message = { time: new Date(), senderId: this.socketService.socketId, content, senderName: '' };

        this.socketService.send(event, data);
    }

    private configureSocket(): void {
        this.socketService.on(MESSAGE, (messages: Message[]) => (this.message = messages));

        this.socketService.on(CONNECT, () => this.userReconnection());
    }

    private connect(): void {
        if (!this.socketService.isSocketAlive()) this.socketService.connect();
    }

    private userReconnection(): void {
        const socketId = localStorage.getItem(ID);

        if (socketId) this.sendToServer(RECONNECTION, socketId);
        else this.router.navigate([HOME_PAGE_URL]);
        localStorage.clear();
    }

    private saveSocket(): void {
        window.addEventListener('beforeunload', (): void => {
            localStorage.setItem(ID, this.socketService.socketId);
            window.onbeforeunload = null;
        });
    }
}
