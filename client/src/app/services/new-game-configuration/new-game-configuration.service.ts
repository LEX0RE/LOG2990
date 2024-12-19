import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Dictionary } from '@app/interface/dictionary';
import { HttpRequestManagerService } from '@app/services/http-request-manager/http-request-manager.service';
import { CLASSIC, LOG2990 } from '@common/constants/game-modes';
import { Difficulty } from '@common/enums/difficulty';
import { PlayerMode } from '@common/enums/player-mode';
import { CommonTimer } from '@common/interfaces/game-view-related/common-timer';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class NewGameConfigurationService {
    openDictionaryOverlay: boolean;
    openErrorCreatingGameOverlay: boolean;
    playerMode: PlayerMode;
    difficulty: Difficulty;
    gameInfo: FormGroup;
    timer: CommonTimer;
    randomJoin: boolean;
    dictionaryAvailable: boolean;
    private privateGameMode: string;
    private httpRequestManagerService: HttpRequestManagerService;

    constructor(httpRequestManagerService: HttpRequestManagerService) {
        this.openDictionaryOverlay = false;
        this.openErrorCreatingGameOverlay = false;
        this.playerMode = PlayerMode.NotDefine;
        this.difficulty = Difficulty.NotDefine;
        this.randomJoin = false;
        this.privateGameMode = '';
        this.httpRequestManagerService = httpRequestManagerService;
    }

    get gameMode(): string {
        return this.privateGameMode;
    }

    set gameMode(gameMode: string) {
        const lowerCaseGameMode: string = gameMode.toLocaleLowerCase();

        if (this.isValidGameMode(lowerCaseGameMode) || lowerCaseGameMode === '') this.privateGameMode = lowerCaseGameMode;
    }

    set player(gameMode: string) {
        const lowerCasePlayerMode: string = gameMode.toLocaleLowerCase();

        switch (lowerCasePlayerMode) {
            case PlayerMode.Solo:
                this.playerMode = PlayerMode.Solo;
                break;
            case PlayerMode.Multiplayer:
                this.playerMode = PlayerMode.Multiplayer;
                break;
        }
    }

    fetchTurnTimes(): Observable<CommonTimer[]> {
        return this.httpRequestManagerService.getTurnTimes();
    }

    fetchDictionaries(): Observable<Dictionary[]> {
        return this.httpRequestManagerService.getDictionaries();
    }

    configureGame(newGameConfigForm: FormGroup, turnTime: CommonTimer): void {
        this.gameInfo = newGameConfigForm;
        this.timer = turnTime;
    }

    changeDictionary(dictionaryTitle: string): void {
        this.gameInfo.patchValue({
            dictionary: dictionaryTitle,
        });
    }

    hasValidGameMode(): boolean {
        return this.isValidGameMode(this.privateGameMode);
    }

    private isValidGameMode(gameMode: string): boolean {
        return gameMode === CLASSIC || gameMode === LOG2990;
    }
}
