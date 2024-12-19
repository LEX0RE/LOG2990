import { WaitingGame } from '@app/interface/waiting-game';
import { MultiplayerGameFactory } from '@app/services/game-factory/multiplayer-game-factory/multiplayer-game-factory.service';
import { GameManager } from '@app/services/game-manager/game-manager.service';
import { SocketManager } from '@app/services/socket-manager/socket-manager.service';
import {
    CANCEL_JOIN_REQUEST,
    HELLO_SOMEONE_IS_TRYING_TO_JOIN,
    HEY_I_WANNA_JOIN_THIS_GAME,
    PLAYER_JOINING_CANCELED,
    REJECT_THAT_PLAYER_FROM_JOINING,
    YOU_WERE_REJECTED,
} from '@common/constants/communication';
import { CommonGameConfig } from '@common/interfaces/common-game-config';
import { JoinGameInfo } from '@common/interfaces/join-game';
import { Container, Service } from 'typedi';

@Service()
export class InitializeGameHandler {
    private gameManager: GameManager;
    private socketService: SocketManager;
    private gameFactory: MultiplayerGameFactory;

    constructor() {
        this.gameManager = Container.get(GameManager);
        this.socketService = Container.get(SocketManager);
        this.gameFactory = Container.get(MultiplayerGameFactory);
        this.configureSocketFeatures();
    }

    private configureSocketFeatures(): void {
        this.socketService.on(HEY_I_WANNA_JOIN_THIS_GAME, (joinGameInfo: JoinGameInfo) => {
            this.handleAskToJoinGame(joinGameInfo);
        });

        this.socketService.on(REJECT_THAT_PLAYER_FROM_JOINING, (joinGameInfo: JoinGameInfo) => {
            this.handleRejection(joinGameInfo);
        });

        this.socketService.on(CANCEL_JOIN_REQUEST, (gameConfig: CommonGameConfig) => {
            this.cancelJoinRequestHandler(gameConfig);
        });
    }

    private handleAskToJoinGame(joinGameInfo: JoinGameInfo): void {
        const waitingGame = this.gameManager.getWaitingGame(joinGameInfo.gameId);

        if (this.isInvalidWaitingGame(waitingGame)) this.socketService.sendPrivate(YOU_WERE_REJECTED, joinGameInfo.player2SocketId);
        if (waitingGame) {
            waitingGame.isWaitingForConfirmation = true;
            joinGameInfo.player1SocketId = waitingGame.player.id;
            this.socketService.sendPrivate(HELLO_SOMEONE_IS_TRYING_TO_JOIN, waitingGame.player.id, joinGameInfo);
        }
        this.gameFactory.availableGamesUpdate();
    }

    private isInvalidWaitingGame(waitingGame: WaitingGame | undefined): boolean {
        return !waitingGame || waitingGame.isWaitingForConfirmation;
    }

    private handleRejection(joinGameInfo: JoinGameInfo): void {
        this.socketService.sendPrivate(YOU_WERE_REJECTED, joinGameInfo.player2SocketId);
        this.removeConfirmationFlag(joinGameInfo.gameId);
        this.gameFactory.availableGamesUpdate();
    }

    private cancelJoinRequestHandler(gameConfig: CommonGameConfig): void {
        this.removeConfirmationFlag(gameConfig.gameId);
        this.socketService.sendPrivate(PLAYER_JOINING_CANCELED, gameConfig.player1SocketId);
        this.gameFactory.availableGamesUpdate();
    }

    private removeConfirmationFlag(gameId: string): void {
        const waitingGame = this.gameManager.getWaitingGame(gameId);

        if (waitingGame) waitingGame.isWaitingForConfirmation = false;
    }
}
