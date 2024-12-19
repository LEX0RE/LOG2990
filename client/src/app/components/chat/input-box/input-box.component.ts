import { Component } from '@angular/core';
import { SPACE } from '@app/constants/easel';
import { EaselSelectionService } from '@app/services/easel/view/easel-selection.service';
import { GameUpdaterService } from '@app/services/game-updater/game-updater.service';
import { MessageSenderService } from '@app/services/messages-sender/messages-sender.service';
import { MESSAGE } from '@common/constants/communication';
import { ActionType } from '@common/enums/action-type';

@Component({
    selector: 'app-input-box',
    templateUrl: './input-box.component.html',
    styleUrls: ['./input-box.component.scss'],
})
export class InputBoxComponent {
    textToSend: string;
    readonly chatBoxService: MessageSenderService;
    private readonly easel: EaselSelectionService;
    private readonly game: GameUpdaterService;

    constructor(chatBoxService: MessageSenderService, easel: EaselSelectionService, gameUpdaterService: GameUpdaterService) {
        this.textToSend = '';
        this.chatBoxService = chatBoxService;
        this.easel = easel;
        this.game = gameUpdaterService;
    }

    onEnter(event: Event): void {
        if (this.textToSend) this.chatBoxService.sendToServer(MESSAGE, this.textToSend);
        this.handleHideEaselLetters(event);

        this.textToSend = '';
    }

    private handleHideEaselLetters(event: Event): void {
        const commands = this.textToSend.split(SPACE);
        const placeLettersParam = 3;

        if (commands.length < placeLettersParam || commands[0] !== ActionType.PlaceLetters) return;
        const lettersToPlace = commands[2];

        this.easel.cancelHidden();
        for (const character of lettersToPlace) this.easel.selectHiddenByString(character);
        event.stopPropagation();
        this.game.playerInfo.turn = false;
    }
}
