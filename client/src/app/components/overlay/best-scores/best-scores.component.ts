import { Component } from '@angular/core';

@Component({
    selector: 'app-best-scores',
    templateUrl: './best-scores.component.html',
    styleUrls: ['./best-scores.component.scss'],
})
export class BestScoresComponent {
    bestScoreVisible: boolean;

    constructor() {
        this.bestScoreVisible = false;
    }
}
