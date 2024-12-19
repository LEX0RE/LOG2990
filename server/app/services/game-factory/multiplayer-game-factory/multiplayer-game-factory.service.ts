import { LOBBY } from '@app/constants/miscellaneous';
import { WaitingGame } from '@app/interface/waiting-game';
import { GameFactory } from '@app/services/game-factory/game-factory.service';
import { RoomManager } from '@app/services/room-manager/room-manager.service';
import {
    AVAILABLE_GAMES,
    CANCEL_GAME_CREATION,
    CHANGE_DICTIONARY,
    CREATE_GAME,
    GET_AVAILABLE_GAME,
    JOIN_GAME,
    JOIN_GAME_CONFIRMATION_PLAYER1,
    JOIN_GAME_CONFIRMATION_PLAYER2,
    YOU_WERE_REJECTED,
} from '@common/constants/communication';
import { CommonGameConfig } from '@common/interfaces/common-game-config';
import { DictionaryUpdate } from '@common/interfaces/dictionary-update';
import { JoinGameInfo } from '@common/interfaces/join-game';
import { Container, Service } from 'typedi';

@Service()
export class MultiplayerGameFactory extends GameFactory {
    constructor() {
        super();
        this.roomManager = Container.get(RoomManager);
    }

    availableGamesUpdate(): void {
        this.socketManager.to<CommonGameConfig[]>(AVAILABLE_GAMES, LOBBY, this.getConfigs());
    }

    protected configureSocketFeatures(): void {
        this.socketManager.on(CREATE_GAME, (config: CommonGameConfig) => {
            this.createMultiplayerGame(config);
        });

        this.socketManager.on(CHANGE_DICTIONARY, (dictionaryUpdate: DictionaryUpdate) => {
            this.changeDictionary(dictionaryUpdate);
        });

        this.socketManager.on(JOIN_GAME, (joinGameInfo: JoinGameInfo) => {
            this.joinGame(joinGameInfo);
        });

        this.socketManager.on(GET_AVAILABLE_GAME, (socketId: string) => {
            this.sendGames(socketId);
            this.roomManager.sendToLobby(socketId);
        });

        this.socketManager.disconnect((socketId: string) => {
            this.disconnectHandler(socketId);
        });

        this.socketManager.on(CANCEL_GAME_CREATION, (info: string | JoinGameInfo) => {
            if (typeof info === 'string' || info instanceof String) this.disconnectHandler(info as string);
            else this.cancelGameHandler(info);
        });
    }

    protected createMultiplayerGame(config: CommonGameConfig): void {
        this.createGame(config);

        this.availableGamesUpdate();
    }

    private sendGames(socketId: string): void {
        this.socketManager.sendPrivate(AVAILABLE_GAMES, socketId, this.getConfigs());
    }

    private getConfigs(): CommonGameConfig[] {
        const commonGameConfigs: CommonGameConfig[] = [];

        this.gameManager.waitingGames.forEach((game: WaitingGame) => {
            if (game.isWaitingForConfirmation) return;

            commonGameConfigs.push(game.gameConfig);
        });
        return commonGameConfigs;
    }

    private joinGame(joinGameInfo: JoinGameInfo): void {
        const game = this.gameManager.joinMultiplayerGame(joinGameInfo.player2SocketId, joinGameInfo.playerName, joinGameInfo.gameId);
        const success = Boolean(game);

        if (success) {
            this.roomManager.leaveLobby(joinGameInfo.player2SocketId);
            this.roomManager.joinRoom(joinGameInfo.player2SocketId, joinGameInfo.gameId);
            this.chatManager.addUserToChat(joinGameInfo.player2SocketId, joinGameInfo.playerName, joinGameInfo.gameId);
        }
        this.socketManager.sendPrivate(JOIN_GAME_CONFIRMATION_PLAYER1, joinGameInfo.player1SocketId, success);
        this.socketManager.sendPrivate(JOIN_GAME_CONFIRMATION_PLAYER2, joinGameInfo.player2SocketId, success);
        if (game) game.start().finally(this.deleteGame(game.gameId));
    }

    private changeDictionary(dictionaryUpdate: DictionaryUpdate): void {
        if (dictionaryUpdate.gameId) {
            const game = this.gameManager.getWaitingGame(dictionaryUpdate.gameId);

            if (game) game.gameConfig.dictionaryTitle = dictionaryUpdate.title;
        }
    }

    private disconnectHandler(player1SocketId: string): void {
        this.gameManager.deleteWaitingGame(player1SocketId);
        this.availableGamesUpdate();
    }

    private cancelGameHandler(info: JoinGameInfo): void {
        this.gameManager.deleteWaitingGame(info.player1SocketId);
        this.socketManager.sendPrivate(YOU_WERE_REJECTED, info.player2SocketId);
        this.availableGamesUpdate();
    }
}
