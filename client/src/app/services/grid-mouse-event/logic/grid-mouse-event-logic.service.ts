import { Injectable } from '@angular/core';
import { BlankLetter } from '@app/classes/blank-letter/blank-letter';
import { CommandFormattingService } from '@app/classes/command-formatting/command-formatting.service';
import { MathUtils } from '@app/classes/utils/math-utils';
import { ViewLetter } from '@app/classes/view-letter';
import { BOX_BY_ROW_WITH_NUMBER, INITIAL_PLACEMENT, SPACE_BETWEEN_CASE } from '@app/constants/grid';
import { ADJUST_X, ADJUST_Y } from '@app/constants/grid-mouse-event';
import { BACKSPACE, ENTER, ESCAPE1, ESCAPE2 } from '@app/constants/keyboard';
import { PlacementStep } from '@app/enum/placements';
import { PositionLetter } from '@app/interface/position-letter';
import { Vector2D } from '@app/interface/vector-2d';
import { EaselSelectionService } from '@app/services/easel/view/easel-selection.service';
import { GridContextService } from '@app/services/grid-context/grid-context.service';
import { GridMouseEventView } from '@app/services/grid-mouse-event/view/grid-mouse-event-view.service';
import { ALPHABET, ALPHABET_BOARD } from '@common/constants/alphabet';
import { BLANK, BLANK_IN_WORD } from '@common/constants/blank';
import { Orientation } from '@common/enums/orientation';
import { Coordinate } from '@common/interfaces/coordinate';

@Injectable({
    providedIn: 'root',
})
export class GridMouseEventLogic {
    letterInGrid: PositionLetter[];
    private grid: GridContextService;
    private easelService: EaselSelectionService;
    private viewGrid: GridMouseEventView;

    constructor(grid: GridContextService, easelService: EaselSelectionService, viewGrid: GridMouseEventView) {
        this.grid = grid;
        this.easelService = easelService;
        this.viewGrid = viewGrid;
    }

    mouseClick(coordinateClick: Vector2D): void {
        if ((this.grid.placement.step === PlacementStep.NoClick || this.grid.placement.step === PlacementStep.ClickPlacement) && coordinateClick) {
            const position: Vector2D = this.getCoordinate(coordinateClick);

            if (position.x >= 1 && position.y >= 1 && this.isTileEmpty(position)) {
                this.checkPlacement(position);
                this.viewGrid.createPlacement(position);
                this.grid.placement.step = PlacementStep.ClickPlacement;
            }
        }
    }

    keyboardClick(event: string): void {
        if (this.grid.placement.step === PlacementStep.ClickPlacement || this.grid.placement.step === PlacementStep.KeyboardPlacement) {
            this.handleSpecialButton(event);
            this.viewGrid.updateView();
        }
    }

    sendToServer(): void {
        if (this.grid.placement.step === PlacementStep.KeyboardPlacement) {
            const coordinate: Coordinate = {
                row: ALPHABET_BOARD[this.grid.placement.initialPlacement.y - 1],
                column: this.grid.placement.initialPlacement.x,
            };

            this.grid.conversionService.sendPlaceLetter(coordinate, this.grid.placement.orientation, this.letterToSend());
            this.gridReset();
        }
    }

    gridReset(): void {
        this.grid.saveLetterSquare = this.grid.saveLetterSquare.slice(0, this.grid.saveLetterSquare.length - this.grid.placement.letters.length);
        this.grid.placement.letters = [];
        this.grid.placement.initialPlacement = INITIAL_PLACEMENT;
        this.grid.placement.orientation = Orientation.None;
        this.grid.placement.step = PlacementStep.NoClick;
        this.easelService.errorWord = '';
    }

    reset(): void {
        this.handleSpecialButton(ESCAPE1);
    }

    private isTileEmpty(position: Vector2D): boolean {
        let notPositionLetter = true;

        this.grid.saveLetterSquare.forEach((letter) => {
            if (this.grid.comparePosition(position, letter.position)) notPositionLetter = false;
        });
        return notPositionLetter;
    }

    private letterToSend(): string {
        return MathUtils.accumulator(this.grid.placement.letters, '', (word: string, letter: ViewLetter) => {
            word += letter.letter instanceof BlankLetter ? letter.toCommonLetter.letter.toUpperCase() : letter.toCommonLetter.letter.toLowerCase();
            return word;
        });
    }

    private checkPlacement(position: Vector2D): void {
        if (this.grid.comparePosition(position, this.grid.placement.initialPlacement)) {
            this.grid.placement.orientation =
                this.grid.placement.orientation === Orientation.Vertical ? Orientation.Horizontal : Orientation.Vertical;
        } else {
            this.grid.placement.initialPlacement = position;
            this.grid.placement.orientation = Orientation.Horizontal;
        }
    }

    private getCoordinate(coordinateClick: Vector2D): Vector2D {
        return {
            x: Math.trunc((coordinateClick.x * ADJUST_X()) / SPACE_BETWEEN_CASE),
            y: Math.trunc((coordinateClick.y * ADJUST_Y()) / SPACE_BETWEEN_CASE),
        };
    }

    private handleSpecialButton(key: string): void {
        key = key === ESCAPE2 ? ESCAPE1 : key;
        switch (key) {
            case BACKSPACE:
                return this.popLetter();
            case ENTER:
                return this.sendToServer();
            case ESCAPE1:
                return this.escapeCase();
            default:
                return this.checkLetterInEasel(key);
        }
    }

    private escapeCase(): void {
        this.gridReset();
        this.easelService.cancelHidden();
    }

    private checkLetterInEasel(key: string): void {
        const newKey = CommandFormattingService.tidyAccent(key);

        if (CommandFormattingService.isABlank(newKey)) return this.checkLetterInEaselBlank(newKey);

        if (!this.easelService.isInEasel(newKey) || this.isLimit())
            this.easelService.errorWord = ALPHABET.includes(newKey) && !this.isLimit() ? newKey : '';
        else this.pushLetter(newKey);
    }

    private pushLetter(newKey: string) {
        const newViewLetter = this.easelService.selectHiddenByString(newKey);

        if (newViewLetter) {
            this.grid.placement.letters.push(newViewLetter);
            this.easelService.errorWord = '';
        }
        this.grid.placement.step = PlacementStep.KeyboardPlacement;
    }

    private checkLetterInEaselBlank(blank: string): void {
        if (!this.easelService.isInEasel(BLANK) || this.isLimit()) {
            this.easelService.errorWord = !this.isLimit() ? BLANK_IN_WORD : '';
            return;
        }
        const newViewLetter = this.easelService.selectHiddenByString(BLANK);

        if (newViewLetter) {
            const blankLetter: ViewLetter = new ViewLetter(new BlankLetter(blank), newViewLetter.selection);

            this.grid.placement.letters.push(blankLetter);
        }
        this.grid.placement.step = PlacementStep.KeyboardPlacement;
    }

    private isLimit(): boolean {
        let initialPosition = 0;

        initialPosition =
            this.grid.placement.orientation === Orientation.Vertical
                ? this.grid.placement.initialPlacement.y
                : this.grid.placement.initialPlacement.x;

        return initialPosition + this.grid.placement.letters.length >= BOX_BY_ROW_WITH_NUMBER;
    }

    private popLetter(): void {
        const letter = this.grid.placement.letters.pop();

        if (letter) {
            this.grid.saveLetterSquare.pop();
            const keyboardCharacter = letter.letter instanceof BlankLetter ? BLANK : letter.toCommonLetter.letter;

            this.easelService.unselectHiddenByString(keyboardCharacter);
        }
        if (!this.grid.placement.letters.length) this.grid.placement.step = PlacementStep.ClickPlacement;
    }
}
