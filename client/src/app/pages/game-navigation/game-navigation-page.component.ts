import { Component, OnInit } from '@angular/core';
import { MIN_NUMBER_OF_AVAILABLE_GAMES } from '@app/constants/join-game';
import { ExchangePlayer2PovService } from '@app/services/initialize-game-exchange/player-2/initialize-game-player-2-pov.service';
import { NewGameConfigurationService } from '@app/services/new-game-configuration/new-game-configuration.service';
import { Difficulty } from '@common/enums/difficulty';
import { PlayerMode } from '@common/enums/player-mode';
@Component({
    selector: 'app-game-navigation-page',
    templateUrl: './game-navigation-page.component.html',
    styleUrls: ['./game-navigation-page.component.scss'],
})
export class GameNavigationPageComponent implements OnInit {
    gameMode: string;
    private newGameConfigurationService: NewGameConfigurationService;
    private readonly exchangePlayer2PovService: ExchangePlayer2PovService;

    constructor(newGameConfigurationService: NewGameConfigurationService, exchangePlayer2PovService: ExchangePlayer2PovService) {
        this.newGameConfigurationService = newGameConfigurationService;
        this.exchangePlayer2PovService = exchangePlayer2PovService;
    }

    ngOnInit(): void {
        this.gameMode = this.newGameConfigurationService.gameMode;
        this.newGameConfigurationService.playerMode = PlayerMode.NotDefine;
        this.newGameConfigurationService.difficulty = Difficulty.NotDefine;
    }

    get isAvailableGame() {
        return this.exchangePlayer2PovService.availableGames.length >= MIN_NUMBER_OF_AVAILABLE_GAMES;
    }

    resetGameMode(): void {
        this.newGameConfigurationService.gameMode = '';
    }

    soloGame(): void {
        this.newGameConfigurationService.playerMode = PlayerMode.Solo;
    }

    multiplayerGame(): void {
        this.newGameConfigurationService.playerMode = PlayerMode.Multiplayer;
    }
}
