import { AfterViewChecked, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { SenderType } from '@app/constants/sender';
import { GameUpdaterService } from '@app/services/game-updater/game-updater.service';
import { MessageSenderService } from '@app/services/messages-sender/messages-sender.service';
import { Message } from '@common/interfaces/message';
import { SYSTEM } from '@common/constants/communication';
@Component({
    selector: 'app-output-box',
    templateUrl: './output-box.component.html',
    styleUrls: ['./output-box.component.scss'],
})
export class OutputBoxComponent implements AfterViewChecked {
    @ViewChild('scrollBar') scrollElement: ElementRef;
    @Input() sender: string;
    nbMessages: number;
    private readonly communicationService: MessageSenderService;
    private readonly gameUpdaterService: GameUpdaterService;

    constructor(communication: MessageSenderService, gameUpdaterService: GameUpdaterService) {
        this.nbMessages = 0;
        this.communicationService = communication;
        this.sender = this.communicationService.socketService.socketId;
        this.gameUpdaterService = gameUpdaterService;
    }

    get messages(): Message[] {
        return this.communicationService.message;
    }

    ngAfterViewChecked(): void {
        this.checkIfScrollToBottomNeeded();
    }

    checkIfScrollToBottomNeeded(): void {
        if (this.nbMessages !== this.messages.length) {
            this.scrollToBottom();
            this.nbMessages = this.messages.length;
        }
    }

    setCategory(sender: string): string {
        const sendName = this.gameUpdaterService.playerInfo.name;

        if (sender === sendName) return SenderType.Client;
        return sender === SYSTEM ? SenderType.System : SenderType.Others;
    }

    private scrollToBottom(): void {
        this.scrollElement.nativeElement.scrollTo({ top: this.scrollElement.nativeElement.scrollHeight });
    }
}
