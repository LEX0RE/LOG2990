import { Component } from '@angular/core';
import { NewGameConfigurationService } from '@app/services/new-game-configuration/new-game-configuration.service';

@Component({
    selector: 'app-invalid-game-mode',
    templateUrl: './invalid-game-mode.component.html',
    styleUrls: ['./invalid-game-mode.component.scss'],
})
export class InvalidGameModeComponent {
    private invalidStep: number;
    private gameMode: string;
    private readonly newGameConfigurationService: NewGameConfigurationService;

    constructor(newGameConfigurationService: NewGameConfigurationService) {
        this.invalidStep = 0;
        this.newGameConfigurationService = newGameConfigurationService;
    }

    get step() {
        return this.invalidStep;
    }

    get playerMode() {
        return this.newGameConfigurationService.playerMode;
    }

    setGameMode(gameMode: string): void {
        this.gameMode = gameMode;
        if (this.playerMode) this.newGameConfigurationService.gameMode = this.gameMode;
        else this.invalidStep++;
    }

    setPlayerMode(playerMode: string): void {
        this.newGameConfigurationService.gameMode = this.gameMode;
        this.newGameConfigurationService.player = playerMode;
    }

    return() {
        this.invalidStep--;
    }
}
