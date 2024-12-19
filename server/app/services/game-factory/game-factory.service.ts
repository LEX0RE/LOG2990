import { ChatManager } from '@app/services/chat-manager/chat-manager.service';
import { GameManager } from '@app/services/game-manager/game-manager.service';
import { RoomManager } from '@app/services/room-manager/room-manager.service';
import { SocketManager } from '@app/services/socket-manager/socket-manager.service';
import { GAME_CREATION_CONFIRM } from '@common/constants/communication';
import { CommonGameConfig } from '@common/interfaces/common-game-config';
import { Container, Service } from 'typedi';

@Service()
export abstract class GameFactory {
    protected gameManager: GameManager;
    protected socketManager: SocketManager;
    protected chatManager: ChatManager;
    protected roomManager: RoomManager;

    constructor() {
        this.gameManager = Container.get(GameManager);
        this.socketManager = Container.get(SocketManager);
        this.chatManager = Container.get(ChatManager);
        this.roomManager = Container.get(RoomManager);
        this.configureSocketFeatures();
    }

    protected createGame(config: CommonGameConfig): string {
        const roomId = this.roomManager.createRoom();

        config.gameId = roomId;
        const succeeded = this.gameManager.createWaitingGame(config);

        this.roomManager.joinRoom(config.player1SocketId, roomId);
        this.chatManager.addUserToChat(config.player1SocketId, config.player1Name, roomId);
        this.socketManager.sendPrivate(GAME_CREATION_CONFIRM, config.player1SocketId, succeeded);
        return roomId;
    }

    protected deleteGame(gameId: string): () => void {
        return (): void => this.gameManager.deleteGame(gameId);
    }

    protected abstract configureSocketFeatures(): void;
}
