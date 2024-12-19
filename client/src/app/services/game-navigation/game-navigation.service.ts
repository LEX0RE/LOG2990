import { Injectable } from '@angular/core';
import { CLASSIC, LOG2990 } from '@common/constants/game-modes';

@Injectable({
    providedIn: 'root',
})
export class GameNavigationService {
    private gameMode: string;

    constructor() {
        this.gameMode = '';
    }

    setGameMode(gameMode: string): void {
        const lowerCaseGameMode: string = gameMode.toLocaleLowerCase();

        if ((lowerCaseGameMode === CLASSIC || lowerCaseGameMode === LOG2990 || lowerCaseGameMode === '') && lowerCaseGameMode !== this.gameMode)
            this.gameMode = lowerCaseGameMode;
    }

    hasValidGameMode(): boolean {
        return this.gameMode === CLASSIC || this.gameMode === LOG2990;
    }
}
