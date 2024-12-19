import { Component } from '@angular/core';
import { EndGameService } from '@app/services/end-game/end-game.service';
import { GamePossibility } from '@common/enums/game-possibility';
@Component({
    selector: 'app-home-button',
    templateUrl: './home-button.component.html',
    styleUrls: ['./home-button.component.scss'],
})
export class HomeButtonComponent {
    private endGameService: EndGameService;

    constructor(endGameService: EndGameService) {
        this.endGameService = endGameService;
    }

    get isEndGame(): boolean {
        return this.endGameService.decision !== GamePossibility.NotFinish;
    }

    exitGame() {
        this.endGameService.reset();
    }
}
