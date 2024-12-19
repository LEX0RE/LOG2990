import { Injectable } from '@angular/core';
import { DELAY_LETTER_RESET } from '@app/constants/easel';
import { EaselSelectionService } from '@app/services/easel/view/easel-selection.service';
import { GameUpdaterService } from '@app/services/game-updater/game-updater.service';
import { MessageSenderService } from '@app/services/messages-sender/messages-sender.service';
import { MESSAGE } from '@common/constants/communication';
import { ActionType } from '@common/enums/action-type';
import { Orientation } from '@common/enums/orientation';
import { Coordinate } from '@common/interfaces/coordinate';
@Injectable({
    providedIn: 'root',
})
export class CommandConversionService {
    private readonly messageSender: MessageSenderService;
    private readonly easelSelectionService: EaselSelectionService;
    private readonly gameUpdateService: GameUpdaterService;

    constructor(messageSender: MessageSenderService, easelSelectionService: EaselSelectionService, gameUpdateService: GameUpdaterService) {
        this.messageSender = messageSender;
        this.easelSelectionService = easelSelectionService;
        this.gameUpdateService = gameUpdateService;
    }

    sendPlaceLetter(initialPosition: Coordinate, orientation: Orientation, letters: string): void {
        const message = `${ActionType.PlaceLetters} ${initialPosition.row}${initialPosition.column}${orientation} ${letters}`;

        this.messageSender.sendToServer(MESSAGE, message);
        this.gameUpdateService.playerInfo.turn = false;
        this.easelSelectionService.cancelHidden();
        letters.split('').forEach((character: string) => this.easelSelectionService.selectHiddenByString(character));
        setTimeout(() => this.easelSelectionService.cancelHidden(), DELAY_LETTER_RESET);
    }

    sendTradeLetter(): void {
        const lettersToTrade: string = this.easelSelectionService.tradeLetters;

        if (!lettersToTrade) return;
        const message = `${ActionType.Trade} ${lettersToTrade.toLowerCase()}`;

        this.messageSender.sendToServer(MESSAGE, message);
        this.easelSelectionService.cancelTrade();
    }

    sendSkipTurn(): void {
        this.messageSender.sendToServer(MESSAGE, ActionType.SkipTurn);
    }

    sendStash(): void {
        this.messageSender.sendToServer(MESSAGE, ActionType.Stash);
    }

    sendHint(): void {
        this.messageSender.sendToServer(MESSAGE, ActionType.Hint);
    }

    sendHelp(): void {
        this.messageSender.sendToServer(MESSAGE, ActionType.Help);
    }
}
