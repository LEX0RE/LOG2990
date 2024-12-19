import { Component, OnInit } from '@angular/core';
import { PLAYER_JOINED_MESSAGE, WAITING_FOR_PLAYER_MESSAGE } from '@app/constants/new-game-waiting-room';
import { Dictionary } from '@app/interface/dictionary';
import { ExchangeServicePlayer1POV } from '@app/services/initialize-game-exchange/player-1/initialize-game-player-1-pov.service';
import { NewGameConfigurationService } from '@app/services/new-game-configuration/new-game-configuration.service';

@Component({
    selector: 'app-waiting-for-player-page',
    templateUrl: './waiting-for-player-page.component.html',
    styleUrls: ['./waiting-for-player-page.component.scss'],
})
export class WaitingForPlayerPageComponent implements OnInit {
    mainMessage: string;
    private newGameConfigurationService: NewGameConfigurationService;
    private initializeGameExchangeService: ExchangeServicePlayer1POV;

    constructor(newGameConfigurationService: NewGameConfigurationService, initializeGameExchangeService: ExchangeServicePlayer1POV) {
        this.newGameConfigurationService = newGameConfigurationService;
        this.initializeGameExchangeService = initializeGameExchangeService;
    }

    get playerJoined(): boolean {
        return Boolean(this.initializeGameExchangeService.otherPlayerInfo);
    }

    get otherPlayerName(): string {
        return this.initializeGameExchangeService.otherPlayerInfo ? this.initializeGameExchangeService.otherPlayerInfo.playerName : '';
    }

    get isErrorStartingGame(): boolean {
        return this.initializeGameExchangeService.errorStartingGame;
    }

    get gameMode(): string {
        return this.newGameConfigurationService.gameMode;
    }

    ngOnInit(): void {
        this.mainMessage = WAITING_FOR_PLAYER_MESSAGE;
    }

    displayAdequateMessage(): string {
        return this.playerJoined ? this.otherPlayerName + PLAYER_JOINED_MESSAGE : WAITING_FOR_PLAYER_MESSAGE;
    }

    startGame(): void {
        this.newGameConfigurationService.fetchDictionaries().subscribe((receivedDictionaries) => {
            const foundDictionary = receivedDictionaries.find(
                (dictionary: Dictionary) => dictionary.title === this.newGameConfigurationService.gameInfo.value.dictionary,
            );

            if (!foundDictionary) this.newGameConfigurationService.openDictionaryOverlay = true;
            else this.initializeGameExchangeService.acceptPlayer();
        });
    }

    rejectOtherPlayer(): void {
        this.initializeGameExchangeService.rejectOtherPlayer();
        this.displayAdequateMessage();
    }

    startGameAlone(): void {
        this.cancelGame();
    }

    cancelGame(): void {
        this.initializeGameExchangeService.cancelGame();
    }

    closeErrorStartingGameOverlay(): void {
        this.initializeGameExchangeService.closeErrorOverlay();
    }

    openUnavailableDictionary(): boolean {
        return this.newGameConfigurationService.openDictionaryOverlay;
    }
}
