import { Component } from '@angular/core';
import { Player } from '@app/interface/player';
import { CommandConversionService } from '@app/services/command-conversion/command-conversion.service';
import { EndGameService } from '@app/services/end-game/end-game.service';
import { GameUpdaterService } from '@app/services/game-updater/game-updater.service';
import { TimerService } from '@app/services/timer/timer.service';
import { CommonGoal } from '@common/interfaces/goal';

@Component({
    selector: 'app-informative-panel',
    templateUrl: './informative-panel.component.html',
    styleUrls: ['./informative-panel.component.scss'],
})
export class InformativePanelComponent {
    isImageTouched: boolean;
    private readonly gameUpdate: GameUpdaterService;
    private readonly timerUpdater: TimerService;
    private readonly endGameService: EndGameService;
    private readonly conversionService: CommandConversionService;

    // eslint-disable-next-line max-params -- ne fait que construire l'application
    constructor(gameUpdate: GameUpdaterService, timerUpdater: TimerService, endGame: EndGameService, conversion: CommandConversionService) {
        this.gameUpdate = gameUpdate;
        this.timerUpdater = timerUpdater;
        this.endGameService = endGame;
        this.conversionService = conversion;
    }

    get myGoal(): CommonGoal | null {
        return this.gameUpdate.myGoal.length ? this.gameUpdate.myGoal[0] : null;
    }

    get otherGoal(): CommonGoal | null {
        return this.gameUpdate.myGoal.length ? this.gameUpdate.otherGoal[0] : null;
    }

    get publicGoal1(): CommonGoal | null {
        return this.gameUpdate.publicGoals.length ? this.gameUpdate.publicGoals[0] : null;
    }

    get publicGoal2(): CommonGoal | null {
        return this.gameUpdate.publicGoals.length > 1 ? this.gameUpdate.publicGoals[1] : null;
    }

    get decision() {
        return this.endGameService.decision;
    }

    get timer(): string {
        const timer = this.timerUpdater.timer;

        return (
            timer.minute.toString() +
            ':' +
            timer.second.toLocaleString('en-US', {
                minimumIntegerDigits: 2,
                useGrouping: false,
                maximumFractionDigits: 0,
            })
        );
    }

    get player(): Player {
        return this.gameUpdate.playerInfo;
    }

    get opponent(): Player {
        return this.gameUpdate.otherPlayerInfo;
    }

    get remainingLetter(): number {
        return this.gameUpdate.stash.nLettersLeft;
    }

    sendStash(): void {
        this.conversionService.sendStash();
    }
}
