import { Component } from '@angular/core';
import { EndGameService } from '@app/services/end-game/end-game.service';
import { GameUpdaterService } from '@app/services/game-updater/game-updater.service';
import { GamePossibility } from '@common/enums/game-possibility';

@Component({
    selector: 'app-winner-announcement',
    templateUrl: './winner-announcement.component.html',
    styleUrls: ['./winner-announcement.component.scss'],
})
export class WinnerAnnouncementComponent {
    open: boolean;
    private readonly gameInfoService: GameUpdaterService;
    private readonly endGameService: EndGameService;

    constructor(gameInfo: GameUpdaterService, endGame: EndGameService) {
        this.open = true;
        this.gameInfoService = gameInfo;
        this.endGameService = endGame;
    }

    get winner(): string {
        switch (this.endGameService.decision) {
            case GamePossibility.Win:
                return this.gameInfoService.playerInfo.name;
            case GamePossibility.Lost:
                return this.gameInfoService.otherPlayerInfo.name;
            case GamePossibility.Equality:
                return `${this.gameInfoService.otherPlayerInfo.name}, ${this.gameInfoService.playerInfo.name}`;
        }
        return '';
    }

    get isEndGame(): boolean {
        return this.endGameService.decision !== GamePossibility.NotFinish;
    }

    close(): void {
        this.open = false;
    }
}
