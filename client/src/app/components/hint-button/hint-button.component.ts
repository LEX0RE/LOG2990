import { Component, Input } from '@angular/core';
import { CommandConversionService } from '@app/services/command-conversion/command-conversion.service';
import { GameUpdaterService } from '@app/services/game-updater/game-updater.service';

@Component({
    selector: 'app-hint-button',
    templateUrl: './hint-button.component.html',
    styleUrls: ['./hint-button.component.scss'],
})
export class HintButtonComponent {
    @Input() isTouched = false;
    readonly gameUpdate: GameUpdaterService;
    private readonly conversionService: CommandConversionService;

    constructor(conversion: CommandConversionService, gameUpdate: GameUpdaterService) {
        this.conversionService = conversion;
        this.gameUpdate = gameUpdate;
    }

    sendHint() {
        this.conversionService.sendHint();
    }
}
