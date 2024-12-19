import { Component } from '@angular/core';
import { NewGameConfigurationService } from '@app/services/new-game-configuration/new-game-configuration.service';

@Component({
    selector: 'app-error-creating-game',
    templateUrl: './error-creating-game.component.html',
    styleUrls: ['./error-creating-game.component.scss'],
})
export class ErrorCreatingGameComponent {
    private newGameConfigurationService: NewGameConfigurationService;

    constructor(newGameConfigurationService: NewGameConfigurationService) {
        this.newGameConfigurationService = newGameConfigurationService;
    }

    close(): void {
        this.newGameConfigurationService.openErrorCreatingGameOverlay = false;
    }
}
