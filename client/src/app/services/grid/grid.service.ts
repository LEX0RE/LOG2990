import { Injectable } from '@angular/core';
import { Vector2D } from '@app/interface/vector-2d';
import { GridCreateBoardService } from '@app/services/grid-create-board/grid-create-board.service';
import { GridMouseEvent } from '@app/services/grid-mouse-event/grid-mouse-event.service';
import { GridPlaceLetterService } from '@app/services/grid-place-letter/grid-place-letter.service';
import { CommonBoard } from '@common/interfaces/game-view-related/common-board';

@Injectable({
    providedIn: 'root',
})
export class GridService {
    private gridCreation: GridCreateBoardService;
    private gridPlaceLetter: GridPlaceLetterService;
    private gridMouseEvent: GridMouseEvent;

    constructor(gridCreation: GridCreateBoardService, gridPlaceLetter: GridPlaceLetterService, gridMouseEvent: GridMouseEvent) {
        this.gridCreation = gridCreation;
        this.gridPlaceLetter = gridPlaceLetter;
        this.gridMouseEvent = gridMouseEvent;
    }

    drawGrid(): void {
        this.gridCreation.createBoard();
    }

    changeFontSize(fontSize: number): void {
        this.gridPlaceLetter.changeFontSize(fontSize);
    }

    putWord(word: CommonBoard): void {
        this.gridPlaceLetter.putWord(word);
    }

    mouseClick(coordinateClick: Vector2D): void {
        this.gridMouseEvent.mouseClick(coordinateClick);
    }

    putPlacement(): void {
        this.gridMouseEvent.update();
    }

    keyboardClick(event: string): void {
        this.gridMouseEvent.keyboardClick(event);
    }

    reset(): void {
        this.gridMouseEvent.reset();
    }

    gridReset(): void {
        this.gridMouseEvent.gridReset();
    }
}
