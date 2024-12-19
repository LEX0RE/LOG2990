import { Component } from '@angular/core';
import { GameUpdaterService } from '@app/services/game-updater/game-updater.service';

@Component({
    selector: 'app-game-loading',
    templateUrl: './game-loading.component.html',
    styleUrls: ['./game-loading.component.scss'],
})
export class GameLoadingComponent {
    private gameUpdate: GameUpdaterService;

    get isGameLoading(): boolean {
        return this.gameUpdate.isLoading;
    }

    constructor(gameUpdate: GameUpdaterService) {
        this.gameUpdate = gameUpdate;
    }
}
