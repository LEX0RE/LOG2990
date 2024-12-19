import { Component, OnInit } from '@angular/core';
import { ExchangePlayer2PovService } from '@app/services/initialize-game-exchange/player-2/initialize-game-player-2-pov.service';
import { JoiningGameService } from '@app/services/joining-game/joining-game.service';
import { NewGameConfigurationService } from '@app/services/new-game-configuration/new-game-configuration.service';

@Component({
    selector: 'app-waiting-for-game-start-page',
    templateUrl: './waiting-for-game-start-page.component.html',
    styleUrls: ['./waiting-for-game-start-page.component.scss'],
})
export class WaitingForGameStartComponent implements OnInit {
    isCancelConfirmationOverlayOpen: boolean;
    isCancelConfirmationOverlay: boolean;
    private newGameConfigurationService: NewGameConfigurationService;
    private exchangePlayer2PovService: ExchangePlayer2PovService;
    private joiningGameService: JoiningGameService;

    constructor(
        newGameConfigurationService: NewGameConfigurationService,
        exchangePlayer2PovService: ExchangePlayer2PovService,
        joiningGameService: JoiningGameService,
    ) {
        this.isCancelConfirmationOverlay = false;
        this.newGameConfigurationService = newGameConfigurationService;
        this.exchangePlayer2PovService = exchangePlayer2PovService;
        this.joiningGameService = joiningGameService;
    }

    get gameMode(): string {
        return this.newGameConfigurationService.gameMode;
    }

    get opponentName(): string {
        return this.exchangePlayer2PovService.gameTryingToJoin ? this.exchangePlayer2PovService.gameTryingToJoin.player1Name : '';
    }

    ngOnInit(): void {
        this.isCancelConfirmationOverlayOpen = false;
    }

    errorGameStart(): boolean {
        return this.joiningGameService.isErrorGameStart;
    }

    cancelJoiningGame(): void {
        this.exchangePlayer2PovService.cancelJoiningGame();
    }
}
