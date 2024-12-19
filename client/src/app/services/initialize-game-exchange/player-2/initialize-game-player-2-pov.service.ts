import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { EndGameService } from '@app/services/end-game/end-game.service';
import { GameUpdaterService } from '@app/services/game-updater/game-updater.service';
import { JoiningGameService } from '@app/services/joining-game/joining-game.service';
import { NewGameConfigurationService } from '@app/services/new-game-configuration/new-game-configuration.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import {
    AVAILABLE_GAMES,
    CANCEL_JOIN_REQUEST,
    GET_AVAILABLE_GAME,
    HEY_I_WANNA_JOIN_THIS_GAME,
    JOIN_GAME_CONFIRMATION_PLAYER2,
    YOU_WERE_REJECTED,
} from '@common/constants/communication';
import { GamePossibility } from '@common/enums/game-possibility';
import { CommonGameConfig } from '@common/interfaces/common-game-config';
import { JoinGameInfo } from '@common/interfaces/join-game';

@Injectable({
    providedIn: 'root',
})
export class ExchangePlayer2PovService {
    gameTryingToJoin: CommonGameConfig | null;
    hasBeenRejected: boolean;
    private privateAvailableGames: CommonGameConfig[];
    private socketService: SocketClientService;
    private router: Router;
    private joiningGameService: JoiningGameService;
    private gameEnd: EndGameService;
    private configurationService: NewGameConfigurationService;
    private gameUpdates: GameUpdaterService;

    // eslint-disable-next-line max-params -- chaque service en parametre est requis pour l'echange
    constructor(
        socketService: SocketClientService,
        router: Router,
        joiningGameService: JoiningGameService,
        gameEnd: EndGameService,
        configurationService: NewGameConfigurationService,
        updates: GameUpdaterService,
    ) {
        this.socketService = socketService;
        this.router = router;
        this.joiningGameService = joiningGameService;
        this.gameEnd = gameEnd;
        this.configurationService = configurationService;
        this.gameUpdates = updates;
        this.configureSocket();
        this.gameTryingToJoin = null;
        this.hasBeenRejected = false;
        this.privateAvailableGames = [];
    }

    get availableGames(): CommonGameConfig[] {
        return this.privateAvailableGames;
    }

    set availableGames(configs: CommonGameConfig[]) {
        this.privateAvailableGames = configs.filter((config: CommonGameConfig) => this.configurationService.gameMode === config.gameModeName);
    }

    configureSocket(): void {
        this.socketService.on(AVAILABLE_GAMES, (availableGames: CommonGameConfig[]) => (this.availableGames = availableGames));

        this.socketService.on(JOIN_GAME_CONFIRMATION_PLAYER2, (succeed: boolean) => {
            if (succeed) this.gameStart();
            else this.joiningGameService.isErrorGameStart = true;
        });

        this.socketService.on(YOU_WERE_REJECTED, () => {
            this.hasBeenRejected = true;
            this.navigateToJoinGamePage();
        });
    }

    tryJoinGame(gameId: string, name: string): void {
        const joinGameInfo: JoinGameInfo = { gameId, playerName: name, player1SocketId: '', player2SocketId: this.socketService.socketId };

        this.socketService.send(HEY_I_WANNA_JOIN_THIS_GAME, joinGameInfo);
        const availableGame = this.availableGames.find((game: CommonGameConfig) => game.gameId === gameId);

        this.gameTryingToJoin = availableGame ? availableGame : null;
        this.navigateToWaitingRoom();
    }

    cancelJoiningGame(): void {
        this.socketService.send(CANCEL_JOIN_REQUEST, this.gameTryingToJoin);
    }

    getAvailableGames(): void {
        this.socketService.send(GET_AVAILABLE_GAME, this.socketService.socketId);
    }

    navigateToJoinGamePage(): void {
        this.router.navigate(['joinGame']);
    }

    navigateToGamePage(): void {
        this.router.navigate(['game']);
    }

    navigateToWaitingRoom(): void {
        this.router.navigate(['waitingForGameStart']);
    }

    closeRejectedOverlay(): void {
        this.hasBeenRejected = false;
    }

    private gameStart(): void {
        this.gameEnd.decision = GamePossibility.NotFinish;
        this.gameTryingToJoin = null;
        this.gameUpdates.reset();
        this.navigateToGamePage();
    }
}
