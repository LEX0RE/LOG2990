import { Component } from '@angular/core';
import { NewGameConfigurationService } from '@app/services/new-game-configuration/new-game-configuration.service';

@Component({
    selector: 'app-entry-point-page',
    templateUrl: './entry-point-page.component.html',
    styleUrls: ['./entry-point-page.component.scss'],
})
export class EntryPointPageComponent {
    private newGameConfigurationService: NewGameConfigurationService;

    constructor(newGameConfigurationService: NewGameConfigurationService) {
        this.newGameConfigurationService = newGameConfigurationService;
    }

    setGameMode(gameMode: string): void {
        this.newGameConfigurationService.gameMode = gameMode;
    }
}
