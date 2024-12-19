import { Component } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    socketService: SocketClientService;

    constructor(socketService: SocketClientService) {
        this.socketService = socketService;
        socketService.connect();
    }
}
