import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NewGame } from '@app/interface/new-game';
import { NewSoloGame } from '@app/interface/new-solo-game';
import { EndGameService } from '@app/services/end-game/end-game.service';
import { GameUpdaterService } from '@app/services/game-updater/game-updater.service';
import { NewGameConfigurationService } from '@app/services/new-game-configuration/new-game-configuration.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import {
    CANCEL_GAME_CREATION,
    CHANGE_DICTIONARY,
    CREATE_GAME,
    CREATE_SOLO_GAME,
    GAME_CREATION_CONFIRM,
    HELLO_SOMEONE_IS_TRYING_TO_JOIN,
    JOIN_GAME,
    JOIN_GAME_CONFIRMATION_PLAYER1,
    PLAYER_JOINING_CANCELED,
    REJECT_THAT_PLAYER_FROM_JOINING,
} from '@common/constants/communication';
import { Difficulty } from '@common/enums/difficulty';
import { GamePossibility } from '@common/enums/game-possibility';
import { DictionaryUpdate } from '@common/interfaces/dictionary-update';
import { CommonTimer } from '@common/interfaces/game-view-related/common-timer';
import { JoinGameInfo } from '@common/interfaces/join-game';

@Injectable({
    providedIn: 'root',
})
export class ExchangeServicePlayer1POV {
    gameHasBeenCreated: boolean;
    newGameConfigForm: FormGroup;
    newGame: NewGame;
    otherPlayerInfo: JoinGameInfo | null;
    errorStartingGame: boolean;
    private socketService: SocketClientService;
    private newGameConfigurationService: NewGameConfigurationService;
    private router: Router;
    private gameEnd: EndGameService;
    private gameUpdates: GameUpdaterService;

    // eslint-disable-next-line max-params -- Importation de services
    constructor(
        socketService: SocketClientService,
        newGameConfigurationService: NewGameConfigurationService,
        router: Router,
        gameEnd: EndGameService,
        updates: GameUpdaterService,
    ) {
        this.otherPlayerInfo = null;
        this.socketService = socketService;
        this.newGameConfigurationService = newGameConfigurationService;
        this.router = router;
        this.gameEnd = gameEnd;
        this.gameUpdates = updates;
        this.configureSocket();
    }

    configureSocket(): void {
        this.socketService.on(GAME_CREATION_CONFIRM, (succeeded: boolean) => this.confirmGameCreated(succeeded));

        this.socketService.on(HELLO_SOMEONE_IS_TRYING_TO_JOIN, (info: JoinGameInfo) => {
            this.handleIncomingJoinGame(info);
        });

        this.socketService.on(JOIN_GAME_CONFIRMATION_PLAYER1, (succeed: boolean) => {
            if (succeed) this.gameStart();
            else this.errorStartingGame = true;
        });

        this.socketService.on(PLAYER_JOINING_CANCELED, () => (this.otherPlayerInfo = null));
    }

    acceptPlayer(): void {
        if (!this.otherPlayerInfo) return;
        const dictionaryUpdate: DictionaryUpdate = {
            title: this.newGameConfigurationService.gameInfo.value.dictionary,
            gameId: this.otherPlayerInfo.gameId,
        };

        this.changeDictionary(dictionaryUpdate);
        this.socketService.send(JOIN_GAME, this.otherPlayerInfo);
    }

    rejectOtherPlayer(): void {
        this.socketService.send(REJECT_THAT_PLAYER_FROM_JOINING, this.otherPlayerInfo);
        this.otherPlayerInfo = null;
    }

    closeErrorOverlay(): void {
        this.errorStartingGame = false;
    }

    navigateToWaitingRoom(): void {
        this.router.navigate(['waitingForPlayer']);
    }

    navigateToGamePage(): void {
        this.router.navigate(['game']);
    }

    createGame(newGameConfigForm: FormGroup, turnTime: CommonTimer): void {
        this.newGame = this.createNewGameObject(newGameConfigForm, turnTime);
        this.sendNewGame(this.newGame);
    }

    createSoloGame(newGameConfigForm: FormGroup, turnTime: CommonTimer, difficulty: Difficulty): void {
        const newSoloGame: NewSoloGame = this.createNewSoloGameObject(newGameConfigForm, turnTime, difficulty);

        this.sendNewSoloGame(newSoloGame);
    }

    cancelGame(): void {
        const dataToSend = this.otherPlayerInfo ? this.otherPlayerInfo : this.socketService.socketId;

        this.socketService.send(CANCEL_GAME_CREATION, dataToSend);
        this.otherPlayerInfo = null;
    }

    private createNewGameObject(newGameConfigForm: FormGroup, turnTimer: CommonTimer): NewGame {
        return {
            dictionaryTitle: newGameConfigForm.value.dictionary,
            dictionaryId: -1,
            gameModeName: this.newGameConfigurationService.gameMode,
            player1Name: newGameConfigForm.value.playerName,
            turnTimer,
            gameId: '',
            player1SocketId: this.socketService.socketId,
        };
    }

    private createNewSoloGameObject(newGameConfigForm: FormGroup, turnTime: CommonTimer, difficulty: Difficulty): NewSoloGame {
        return {
            dictionaryTitle: newGameConfigForm.value.dictionary,
            dictionaryId: -1,
            gameModeName: this.newGameConfigurationService.gameMode,
            player1Name: newGameConfigForm.value.playerName,
            turnTimer: turnTime,
            gameId: '',
            player1SocketId: this.socketService.socketId,
            player2Name: '',
            player2Difficulty: difficulty,
        };
    }

    private handleIncomingJoinGame(info: JoinGameInfo): void {
        if (!this.otherPlayerInfo) {
            this.otherPlayerInfo = info;
            this.otherPlayerInfo.player1SocketId = this.socketService.socketId;
        }
    }

    private gameStart(): void {
        this.gameEnd.decision = GamePossibility.NotFinish;
        this.otherPlayerInfo = null;
        this.gameUpdates.reset();
        this.navigateToGamePage();
    }

    private sendNewGame(newGame: NewGame): void {
        this.socketService.send(CREATE_GAME, newGame);
    }

    private changeDictionary(dictionaryUpdate: DictionaryUpdate): void {
        this.socketService.send(CHANGE_DICTIONARY, dictionaryUpdate);
    }

    private sendNewSoloGame(newGame: NewSoloGame): void {
        this.socketService.send(CREATE_SOLO_GAME, newGame);
    }

    private confirmGameCreated(succeeded: boolean): void {
        this.gameHasBeenCreated = succeeded;
        if (this.gameHasBeenCreated) this.navigateToWaitingRoom();
        else this.newGameConfigurationService.openErrorCreatingGameOverlay = true;
    }
}
