import { Component, OnInit } from '@angular/core';
import { DOUBLE_DIGIT_NUMBER, MS_IN_A_MINUTE, MS_IN_A_SECOND } from '@app/constants/utils';
import { HttpRequestManagerService } from '@app/services/http-request-manager/http-request-manager.service';
import { GameInfoHistory } from '@common/interfaces/game-information';

@Component({
    selector: 'app-game-history-page',
    templateUrl: './game-history-page.component.html',
    styleUrls: ['./game-history-page.component.scss'],
})
export class GameHistoryPageComponent implements OnInit {
    gamesInfoHistory: GameInfoHistory[];
    isServerValid: boolean;
    openConfirmationOverlay: boolean;
    private httpRequestManagerService: HttpRequestManagerService;

    constructor(httpRequestManagerService: HttpRequestManagerService) {
        this.isServerValid = true;
        this.openConfirmationOverlay = false;
        this.httpRequestManagerService = httpRequestManagerService;
    }

    ngOnInit(): void {
        this.fetchGameHistory();
    }

    fetchGameHistory(): void {
        this.httpRequestManagerService.getHistory().subscribe(
            (receivedHistory) => {
                this.gamesInfoHistory = receivedHistory;
                this.isServerValid = true;
            },
            () => (this.isServerValid = false),
        );
    }

    resetHistory(): void {
        this.httpRequestManagerService.deleteHistory().subscribe(
            () => {
                this.isServerValid = true;
                this.fetchGameHistory();
            },
            () => (this.isServerValid = false),
        );
    }

    formatDate(dateToFormat: Date): string {
        const date = new Date(dateToFormat);
        const month = new Intl.DateTimeFormat('fr-ca', { month: 'long' }).format(date);

        return date.getDate() + ' ' + month + ' ' + date.getFullYear();
    }

    formatTime(dateToFormat: Date): string {
        const date = new Date(dateToFormat);

        const hours = date.getHours() < DOUBLE_DIGIT_NUMBER ? '0' + date.getHours() : date.getHours();
        const minutes = date.getMinutes() < DOUBLE_DIGIT_NUMBER ? '0' + date.getMinutes() : date.getMinutes();

        return hours + 'h' + minutes;
    }

    formatDuration(duration: number): string {
        const minutes = Math.floor(duration / MS_IN_A_MINUTE);
        const seconds = Math.floor((duration % MS_IN_A_MINUTE) / MS_IN_A_SECOND);

        return minutes + 'min ' + seconds + 's';
    }
}
