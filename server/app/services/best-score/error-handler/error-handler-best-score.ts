import { SocketManager } from '@app/services/socket-manager/socket-manager.service';
import { IMPOSSIBLE_TO_ADD_SCORE } from '@common/constants/communication';
import { Container, Service } from 'typedi';

@Service()
export class ErrorHandlerBestScoreService {
    private socketManager: SocketManager;

    constructor() {
        this.socketManager = Container.get(SocketManager);
    }

    sendErrorMessage(playerToSendTo: string): void {
        this.socketManager.sendPrivate(IMPOSSIBLE_TO_ADD_SCORE, playerToSendTo);
    }
}
