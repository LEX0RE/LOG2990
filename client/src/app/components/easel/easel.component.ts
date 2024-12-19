import { Component, HostListener } from '@angular/core';
import { ViewLetter } from '@app/classes/view-letter';
import { DEFAULT_LETTER_SIZE } from '@app/constants/font-letter';
import { EASEL_SIZE } from '@app/constants/game-page';
import { ARROW_LEFT, ARROW_RIGHT, SHIFT } from '@app/constants/keyboard';
import { CommandConversionService } from '@app/services/command-conversion/command-conversion.service';
import { EaselSelectionService } from '@app/services/easel/view/easel-selection.service';
import { FontSizeService } from '@app/services/font-size/font-size.service';
import { GameUpdaterService } from '@app/services/game-updater/game-updater.service';

@Component({
    selector: 'app-easel',
    templateUrl: './easel.component.html',
    styleUrls: ['./easel.component.scss'],
})
export class EaselComponent {
    letterSize: number;
    isTradeTouched: boolean;
    isCancelTouched: boolean;
    readonly gameUpdate: GameUpdaterService;
    private readonly easelService: EaselSelectionService;
    private readonly commandSender: CommandConversionService;
    private readonly fontSizeService: FontSizeService;

    // eslint-disable-next-line max-params -- ne fait que construire l'application
    constructor(
        easelService: EaselSelectionService,
        gameUpdate: GameUpdaterService,
        commandSender: CommandConversionService,
        fontSizeService: FontSizeService,
    ) {
        this.letterSize = DEFAULT_LETTER_SIZE;
        this.easelService = easelService;
        this.gameUpdate = gameUpdate;
        this.commandSender = commandSender;
        this.fontSizeService = fontSizeService;
        this.gameUpdate.easelUpdateEvent.subscribe(this.onEaselUpdateEvent(this.easelService));
    }

    get fontSize(): number {
        return this.fontSizeService.fontSizeEasel;
    }

    get isGoodToExchange() {
        return this.isSelected && this.gameUpdate.stash.nLettersLeft >= EASEL_SIZE;
    }

    get letters(): ViewLetter[] {
        return this.easelService.letters;
    }

    get errorEasel(): string {
        return this.easelService.errorWord;
    }

    get isSelected(): boolean {
        return this.easelService.tradeLetters.length !== 0;
    }

    get isTradeAllowed(): boolean {
        return this.isGoodToExchange && this.gameUpdate.playerInfo.turn;
    }

    @HostListener('wheel', ['$event'])
    onScroll(event: WheelEvent): void {
        if (event.deltaY <= 0) this.easelService.moveManipulationLeft();
        else this.easelService.moveManipulationRight();
    }

    @HostListener('window:keydown.enter', ['$event'])
    onEnter() {
        if (this.isGoodToExchange) this.onClickExchange();
    }

    onClickExchange(): void {
        if (this.gameUpdate.playerInfo.turn) this.commandSender.sendTradeLetter();
    }

    onCancelClick(): void {
        this.easelService.cancelManipulation();
        this.easelService.cancelTrade();
    }

    onKeyPressed(event: KeyboardEvent): void {
        switch (event.key) {
            case ARROW_RIGHT:
                return this.easelService.moveManipulationRight();
            case ARROW_LEFT:
                return this.easelService.moveManipulationLeft();
            case SHIFT:
                return;
            default:
                return this.defaultManipulation(event.key);
        }
    }

    onLeftClick(index: number): void {
        this.easelService.selectManipulationByIndex(index);
    }

    onRightClick(index: number): void {
        this.easelService.selectTrade(index);
    }

    private defaultManipulation(keyBoardChar: string): void {
        if (this.easelService.isInEasel(keyBoardChar)) this.easelService.selectManipulationByString(keyBoardChar);
        else this.easelService.cancelManipulation();
    }

    private onEaselUpdateEvent(easelService: EaselSelectionService): () => void {
        return (): void => {
            easelService.cancelHidden();
        };
    }
}
