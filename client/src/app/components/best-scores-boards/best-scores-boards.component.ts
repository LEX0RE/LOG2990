import { Component, OnInit } from '@angular/core';
import { DEFAULT_FONT_SIZE_BEST_SCORE } from '@app/constants/font-size-best-score';
import { HttpRequestManagerService } from '@app/services/http-request-manager/http-request-manager.service';
import { CLASSIC, LOG2990 } from '@common/constants/game-modes';
import { CommonBestScore } from '@common/interfaces/game-view-related/common-best-score';

@Component({
    selector: 'app-best-scores-boards',
    templateUrl: './best-scores-boards.component.html',
    styleUrls: ['./best-scores-boards.component.scss'],
})
export class BestScoresBoardsComponent implements OnInit {
    bestScoresClassic: CommonBestScore[];
    bestScoresLog: CommonBestScore[];
    isServerValid: boolean;
    private httpRequestManagerService: HttpRequestManagerService;

    constructor(httpRequestManagerService: HttpRequestManagerService) {
        this.isServerValid = true;
        this.httpRequestManagerService = httpRequestManagerService;
    }

    ngOnInit(): void {
        this.fetchBestScores(CLASSIC);
        this.fetchBestScores(LOG2990);
    }

    fetchBestScores(mode: string): void {
        this.httpRequestManagerService.getBestScores(mode).subscribe(
            (receivedBestScore) => {
                if (mode === CLASSIC) this.bestScoresClassic = receivedBestScore;
                else this.bestScoresLog = receivedBestScore;
                this.isServerValid = true;
            },
            () => (this.isServerValid = false),
        );
    }

    newFontSize(bestScore: CommonBestScore): number {
        return DEFAULT_FONT_SIZE_BEST_SCORE / bestScore.playerName.length;
    }
}
