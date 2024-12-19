import { Component } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { IMPOSSIBLE_TO_ADD_SCORE } from '@common/constants/communication';

@Component({
    selector: 'app-error-best-score',
    templateUrl: './error-best-score.component.html',
    styleUrls: ['./error-best-score.component.scss'],
})
export class ErrorBestScoreComponent {
    visible: boolean;
    socketService: SocketClientService;

    constructor(socketService: SocketClientService) {
        this.visible = false;
        this.socketService = socketService;
        this.configureBaseSocketFeatures();
    }

    private configureBaseSocketFeatures(): void {
        this.socketService.on(IMPOSSIBLE_TO_ADD_SCORE, () => (this.visible = true));
    }
}
