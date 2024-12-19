import { Component, Input, OnInit } from '@angular/core';
import { MIN_NUMBER_OF_AVAILABLE_GAMES } from '@app/constants/join-game';
import { ExchangePlayer2PovService } from '@app/services/initialize-game-exchange/player-2/initialize-game-player-2-pov.service';
import { NewGameConfigurationService } from '@app/services/new-game-configuration/new-game-configuration.service';
import { PlayerMode } from '@common/enums/player-mode';
import { CommonGameConfig } from '@common/interfaces/common-game-config';

@Component({
    selector: 'app-random-join-button',
    templateUrl: './random-join-button.component.html',
    styleUrls: ['./random-join-button.component.scss'],
})
export class RandomJoinButtonComponent implements OnInit {
    @Input() buttonText: string;
    @Input() joinGameCallBack: () => void;
    private exchangePlayer2PovService: ExchangePlayer2PovService;
    private newGameConfigurationService: NewGameConfigurationService;

    constructor(exchangePlayer2PovService: ExchangePlayer2PovService, newGameConfigurationService: NewGameConfigurationService) {
        this.exchangePlayer2PovService = exchangePlayer2PovService;
        this.newGameConfigurationService = newGameConfigurationService;
    }

    get availableGames(): CommonGameConfig[] {
        return this.exchangePlayer2PovService.availableGames;
    }

    get isGameNotAvailable(): boolean {
        return this.availableGames.length <= MIN_NUMBER_OF_AVAILABLE_GAMES;
    }

    ngOnInit(): void {
        this.exchangePlayer2PovService.getAvailableGames();
    }

    joinRandomGame(): void {
        this.newGameConfigurationService.randomJoin = true;
        this.newGameConfigurationService.playerMode = PlayerMode.Multiplayer;
        this.exchangePlayer2PovService.navigateToJoinGamePage();
        if (this.joinGameCallBack) this.joinGameCallBack();
    }
}
