import { Component, ViewChild } from '@angular/core';
import { BestScoresBoardsComponent } from '@app/components/best-scores-boards/best-scores-boards.component';
import { HttpRequestManagerService } from '@app/services/http-request-manager/http-request-manager.service';
import { CLASSIC, LOG2990 } from '@common/constants/game-modes';

@Component({
    selector: 'app-best-scores-admin',
    templateUrl: './best-scores-admin.component.html',
    styleUrls: ['./best-scores-admin.component.scss'],
})
export class BestScoresAdminComponent {
    @ViewChild(BestScoresBoardsComponent) bestScoresBoards: BestScoresBoardsComponent;
    isServerValid: boolean;
    openConfirmationOverlay: boolean;
    private httpRequestManagerService: HttpRequestManagerService;

    constructor(httpRequestManagerService: HttpRequestManagerService) {
        this.isServerValid = true;
        this.openConfirmationOverlay = false;
        this.httpRequestManagerService = httpRequestManagerService;
    }

    resetBestScores(): void {
        this.httpRequestManagerService.deleteBestScores().subscribe(
            () => {
                this.isServerValid = true;
                this.bestScoresBoards.fetchBestScores(CLASSIC);
                this.bestScoresBoards.fetchBestScores(LOG2990);
            },
            () => (this.isServerValid = false),
        );
    }
}
