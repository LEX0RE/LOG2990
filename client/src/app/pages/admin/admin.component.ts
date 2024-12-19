import { Component } from '@angular/core';
import {
    BEST_SCORES,
    DATA_RESET_CONFIRMATION,
    DICTIONARIES,
    ERROR_RESETTING_DATA,
    GAME_HISTORY,
    SUCCESS_RESETTING_DATA,
    VIRTUAL_PLAYER_NAMES,
} from '@app/constants/data-resetting';
import { ResettableData } from '@app/interface/resettable-data';
import { HttpRequestManagerService } from '@app/services/http-request-manager/http-request-manager.service';

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss'],
})
export class AdminComponent {
    dataToReset: ResettableData;
    errorDataResetting: ResettableData;
    openConfirmationOverlay: boolean;
    openFeedbackOverlay: boolean;
    private httpRequestManagerService: HttpRequestManagerService;

    constructor(httpRequestManagerService: HttpRequestManagerService) {
        this.dataToReset = {
            dictionaries: false,
            bestScores: false,
            virtualPlayerNames: false,
            gameHistory: false,
        };
        this.errorDataResetting = {
            dictionaries: false,
            bestScores: false,
            virtualPlayerNames: false,
            gameHistory: false,
        };
        this.openConfirmationOverlay = false;
        this.openFeedbackOverlay = false;
        this.httpRequestManagerService = httpRequestManagerService;
    }

    get isDataToReset(): boolean {
        return this.dataToReset.dictionaries || this.dataToReset.bestScores || this.dataToReset.virtualPlayerNames || this.dataToReset.gameHistory;
    }

    get resetDataConfirmationMessage(): string {
        return DATA_RESET_CONFIRMATION + this.addDataMessage(this.dataToReset);
    }

    get resetDataFeedback(): string {
        const resetDataFeedbackMessage = this.addDataMessage(this.errorDataResetting);

        return resetDataFeedbackMessage ? ERROR_RESETTING_DATA + resetDataFeedbackMessage : SUCCESS_RESETTING_DATA;
    }

    resetData(): void {
        if (this.dataToReset.dictionaries) this.resetDictionaries();
        if (this.dataToReset.bestScores) this.resetBestScores();
        if (this.dataToReset.virtualPlayerNames) this.resetVirtualPlayerNames();
        if (this.dataToReset.gameHistory) this.resetGameHistory();
        this.openFeedbackOverlay = true;
    }

    private resetDictionaries(): void {
        this.httpRequestManagerService.deleteAllDictionary().subscribe(
            () => (this.errorDataResetting.dictionaries = false),
            () => (this.errorDataResetting.dictionaries = true),
        );
    }

    private resetBestScores(): void {
        this.httpRequestManagerService.deleteBestScores().subscribe(
            () => (this.errorDataResetting.bestScores = false),
            () => (this.errorDataResetting.bestScores = true),
        );
        this.dataToReset.bestScores = false;
    }

    private resetVirtualPlayerNames(): void {
        this.httpRequestManagerService.deleteAllNames().subscribe(
            () => (this.errorDataResetting.virtualPlayerNames = false),
            () => (this.errorDataResetting.virtualPlayerNames = true),
        );
        this.dataToReset.virtualPlayerNames = false;
    }

    private resetGameHistory(): void {
        this.httpRequestManagerService.deleteHistory().subscribe(
            () => (this.errorDataResetting.gameHistory = false),
            () => (this.errorDataResetting.gameHistory = true),
        );
        this.dataToReset.gameHistory = false;
    }

    private addDataMessage(dataResettingState: ResettableData): string {
        let dataMessage = '';

        if (dataResettingState.dictionaries) dataMessage += DICTIONARIES;
        if (dataResettingState.bestScores) dataMessage += BEST_SCORES;
        if (dataResettingState.virtualPlayerNames) dataMessage += VIRTUAL_PLAYER_NAMES;
        if (dataResettingState.gameHistory) dataMessage += GAME_HISTORY;
        return dataMessage;
    }
}
