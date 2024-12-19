import { Component } from '@angular/core';
import { EndGameService } from '@app/services/end-game/end-game.service';
import { MessageSenderService } from '@app/services/messages-sender/messages-sender.service';
import { GamePossibility } from '@common/enums/game-possibility';

@Component({
    selector: 'app-surrender',
    templateUrl: './surrender.component.html',
    styleUrls: ['./surrender.component.scss'],
})
export class SurrenderComponent {
    change: boolean;
    private readonly communicationService: MessageSenderService;
    private readonly endGameService: EndGameService;

    constructor(communication: MessageSenderService, endGameService: EndGameService) {
        this.change = false;
        this.communicationService = communication;
        this.endGameService = endGameService;
    }

    get isEndGame(): boolean {
        return this.endGameService.decision !== GamePossibility.NotFinish;
    }

    onClick(): void {
        this.communicationService.surrender();
    }
}
